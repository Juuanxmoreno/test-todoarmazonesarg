"use client";

import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { OrderStatusBadge } from "@/components/atoms/OrderStatusBadge";
import { OrderStatus, PaymentMethod, ShippingMethod } from "@/enums/order.enum";
import { OrderItem } from "@/interfaces/order";
import { formatCurrency } from "@/utils/formatCurrency";
import useOrders from "@/hooks/useOrders";
import { debounce } from "@/utils/debounce";
import { downloadOrderPDF } from "@/utils/downloadOrderPDF";
import LoadingSpinner from "@/components/atoms/LoadingSpinner";

const SKELETON_COUNT = 6;

const OrdersPage = () => {
  const {
    orders,
    nextCursor,
    loading,
    error,
    statusFilter,
    getOrders,
    setFilter,
    changeOrderStatus,
    clearOrders,
  } = useOrders();

  // Estado local para loading de descarga por orden
  const [pdfLoading, setPdfLoading] = useState<{ [orderId: string]: boolean }>(
    {}
  );

  // Scroll pagination
  const observer = useRef<IntersectionObserver | null>(null);
  const lastOrderRef = useRef<HTMLDivElement | null>(null);
  const isLoadingMore = loading && orders.length > 0;

  // Mostrar error si existe
  const renderError = error ? (
    <div className="p-4 text-center text-error">{error}</div>
  ) : null;

  // Debounced fetch for next page
  const debouncedLoadMore = useMemo(
    () =>
      debounce(() => {
        if (nextCursor && !loading) {
          getOrders({ status: statusFilter, cursor: nextCursor });
        }
      }, 300),
    [nextCursor, loading, statusFilter, getOrders]
  );

  const loadMore = useCallback(() => {
    debouncedLoadMore();
  }, [debouncedLoadMore]);

  // Observe last order for infinite scroll
  useEffect(() => {
    if (!nextCursor || loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new window.IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    });
    if (lastOrderRef.current) {
      observer.current.observe(lastOrderRef.current);
    }
    return () => observer.current?.disconnect();
  }, [orders, nextCursor, loading, loadMore]);

  // Fetch orders on mount and when filter changes
  useEffect(() => {
    clearOrders();
    getOrders(statusFilter ? { status: statusFilter } : undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.Pending]: [OrderStatus.Shipped, OrderStatus.Cancelled],
    [OrderStatus.Shipped]: [OrderStatus.Completed, OrderStatus.Cancelled],
    [OrderStatus.Completed]: [],
    [OrderStatus.Cancelled]: [],
  };

  // Skeleton para lista
  const SkeletonRow = () => (
    <div className="collapse collapse-arrow bg-[#FFFFFF] text-[#222222] border rounded-none mb-4 animate-pulse">
      <div className="collapse-title font-semibold flex justify-between items-center">
        <span className="w-32 h-4 bg-gray-200 rounded"></span>
        <span className="w-16 h-4 bg-gray-200 rounded"></span>
      </div>
      <div className="collapse-content text-sm">
        <div className="h-4 w-1/2 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 w-1/4 bg-gray-200 rounded mb-2"></div>
        <div className="h-3 w-1/3 bg-gray-200 rounded mb-2"></div>
      </div>
    </div>
  );

  return (
    <div className="px-4 py-6">
      <h2 className="text-2xl font-bold text-[#111111] mb-4">
        Órdenes de clientes
      </h2>
      {renderError}
      {/* Filtro por estado */}
      <fieldset className="fieldset mb-4">
        <legend className="fieldset-legend text-[#666666]">
          Filtrar por estado
        </legend>
        <select
          className="select rounded-none border border-[#e1e1e1] bg-[#FFFFFF] text-[#222222] px-3 py-2"
          value={statusFilter || ""}
          onChange={(e) =>
            setFilter(
              e.target.value ? (e.target.value as OrderStatus) : undefined
            )
          }
        >
          <option value="">Todos</option>
          <option value={OrderStatus.Pending}>Pendiente</option>
          <option value={OrderStatus.Shipped}>Enviado</option>
          <option value={OrderStatus.Completed}>Completado</option>
          <option value={OrderStatus.Cancelled}>Cancelado</option>
        </select>
        <span className="label text-[#666666]">Opcional</span>
      </fieldset>
      {orders.length === 0 && !loading && (
        <div className="p-4 text-center text-sm opacity-60">No hay órdenes</div>
      )}
      {orders.map((order, idx) => {
        const isLast = idx === orders.length - 1;
        return (
          <div
            key={order.id}
            ref={isLast && nextCursor ? lastOrderRef : undefined}
            className="collapse collapse-arrow bg-[#FFFFFF] text-[#222222] border rounded-none mb-4"
          >
            <input type="checkbox" />
            <div className="collapse-title font-semibold flex justify-between items-center">
              <span>Orden #{order.orderNumber}</span>
              <OrderStatusBadge status={order.orderStatus} />
            </div>
            <div className="collapse-content text-sm">
              <div className="mb-2">
                <strong>Fecha:</strong>{" "}
                {new Date(order.createdAt).toLocaleString()}
              </div>
              <div className="mb-2">
                <strong>Método de pago:</strong>{" "}
                {order.paymentMethod === PaymentMethod.BankTransfer
                  ? "Transferencia bancaria"
                  : "Efectivo"}
              </div>
              <div className="mb-2">
                <strong>Método de envío:</strong>{" "}
                {order.shippingMethod === ShippingMethod.Motorcycle
                  ? "Moto"
                  : "Empresa de encomienda"}
              </div>
              {order.shippingMethod === ShippingMethod.ParcelCompany && (
                <div className="mb-2">
                  <strong>Empresa de encomienda:</strong>{" "}
                  {order.shippingAddress.shippingCompany}
                </div>
              )}
              {order.shippingMethod === ShippingMethod.ParcelCompany && (
                <div className="mb-2">
                  <strong>Valor declarado:</strong>{" "}
                  {order.shippingAddress.declaredShippingAmount}
                </div>
              )}
              {order.shippingMethod === ShippingMethod.Motorcycle && (
                <div className="mb-2">
                  <strong>Franja horaria de entrega:</strong>{" "}
                  {order.shippingAddress.deliveryWindow}
                </div>
              )}
              <div className="mb-2">
                <strong>Dirección de envío:</strong>
                <div className="ml-2">
                  <div>
                    {order.shippingAddress.firstName}{" "}
                    {order.shippingAddress.lastName}
                  </div>
                  <div>
                    {order.shippingAddress.streetAddress},{" "}
                    {order.shippingAddress.city}, {order.shippingAddress.state},{" "}
                    {order.shippingAddress.postalCode}
                  </div>
                  <div>Email: {order.shippingAddress.email}</div>
                  <div>Tel: {order.shippingAddress.phoneNumber}</div>
                  <div>DNI: {order.shippingAddress.dni}</div>
                </div>
              </div>
              <div className="mb-2">
                <strong>Ítems:</strong>
                <ul className="ml-4 list-disc">
                  {order.items.map((item: OrderItem, idx: number) => (
                    <li key={idx}>
                      <div>
                        <span className="font-medium">
                          {item.productVariant.product.productModel}{" "}
                          {item.productVariant.product.sku}
                        </span>{" "}
                        - Cantidad: {item.quantity}
                      </div>
                      <div>
                        Color:{" "}
                        <span style={{ color: item.productVariant.color.hex }}>
                          {item.productVariant.color.name}
                        </span>
                      </div>
                      <div>
                        Precio unitario:{" "}
                        {formatCurrency(
                          item.priceUSDAtPurchase,
                          "en-US",
                          "USD"
                        )}
                      </div>
                      <div>
                        Subtotal:{" "}
                        {formatCurrency(item.subTotal, "en-US", "USD")}
                      </div>
                      <div>
                        Ganancia: {formatCurrency(item.gainUSD, "en-US", "USD")}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 border-t pt-2 text-sm">
                <div>
                  <strong>Subtotal:</strong>{" "}
                  {formatCurrency(order.subTotal, "en-US", "USD")}
                </div>
                {order.paymentMethod === PaymentMethod.BankTransfer && (
                  <div>
                    <strong>Gasto por transferencia bancaria:</strong>{" "}
                    {formatCurrency(
                      order.bankTransferExpense ?? 0,
                      "en-US",
                      "USD"
                    )}
                  </div>
                )}
                <div>
                  <strong>Total:</strong>{" "}
                  {formatCurrency(order.totalAmount, "en-US", "USD")}
                </div>
                <div>
                  <strong>Ganancia total:</strong>{" "}
                  {formatCurrency(order.totalGainUSD, "en-US", "USD")}
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Última actualización:{" "}
                {new Date(order.updatedAt).toLocaleString()}
              </div>
              {/* Ejemplo de cambio de estado */}
              <div className="mt-4">
                <label className="block mb-1 font-medium">
                  Cambiar estado:
                </label>
                <select
                  value={order.orderStatus}
                  onChange={(e) =>
                    changeOrderStatus(order.id, e.target.value as OrderStatus)
                  }
                  className="border rounded-none px-2 py-1"
                  disabled={
                    validTransitions[order.orderStatus as OrderStatus]
                      .length === 0
                  }
                >
                  <option value={order.orderStatus}>
                    {(() => {
                      switch (order.orderStatus) {
                        case OrderStatus.Pending:
                          return "Pendiente";
                        case OrderStatus.Shipped:
                          return "Enviado";
                        case OrderStatus.Completed:
                          return "Completado";
                        case OrderStatus.Cancelled:
                          return "Cancelado";
                        default:
                          return order.orderStatus;
                      }
                    })()}
                  </option>
                  {validTransitions[order.orderStatus as OrderStatus].map(
                    (status) => (
                      <option key={status} value={status}>
                        {status === OrderStatus.Pending && "Pendiente"}
                        {status === OrderStatus.Shipped && "Enviado"}
                        {status === OrderStatus.Completed && "Completado"}
                        {status === OrderStatus.Cancelled && "Cancelado"}
                      </option>
                    )
                  )}
                </select>
              </div>
              {/* Botón para descargar PDF */}
              <button
                className="btn btn-ghost mt-4 bg-[#222222] text-[#FFFFFF] rounded-none border-none shadow-none flex items-center gap-2"
                onClick={async () => {
                  setPdfLoading((prev) => ({ ...prev, [order.id]: true }));
                  try {
                    await downloadOrderPDF(
                      order.id,
                      `Orden-${order.orderNumber}.pdf`
                    );
                  } finally {
                    setPdfLoading((prev) => ({ ...prev, [order.id]: false }));
                  }
                }}
                disabled={!!pdfLoading[order.id]}
              >
                {pdfLoading[order.id] ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    <span>Descargando PDF...</span>
                  </>
                ) : (
                  <span>Descargar PDF</span>
                )}
              </button>
            </div>
          </div>
        );
      })}
      {loading &&
        orders.length === 0 &&
        Array.from({ length: SKELETON_COUNT }).map((_, idx) => (
          <SkeletonRow key={idx} />
        ))}
      {isLoadingMore && (
        <div className="flex justify-center py-4 text-[#666666]">
          <LoadingSpinner />
        </div>
      )}
      {!nextCursor && !loading && orders.length > 0 && (
        <div className="p-4 text-center text-sm text-[#222222] opacity-60">
          No hay más órdenes.
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
