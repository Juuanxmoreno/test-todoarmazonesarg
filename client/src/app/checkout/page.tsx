"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addressSchema, AddressFormData } from "@/schemas/order.schema";
import { useCart } from "@/hooks/useCart";
import { useOrders } from "@/hooks/useOrders";
import { createOrder } from "@/redux/slices/orderSlice";
import type { CreateOrderPayload } from "@/interfaces/order";
import { formatCurrency } from "@/utils/formatCurrency";
import { PaymentMethod, ShippingMethod } from "@/enums/order.enum";
import Link from "next/link";
import Image from "next/image";
import { Check, Package, ShoppingBag } from "lucide-react";
import LoadingSpinner from "@/components/atoms/LoadingSpinner";

const CheckoutPage = () => {
  const { cart, loading: cartLoading, fetchCart } = useCart();
  const { placeOrder, loading: orderLoading, error, resetError } = useOrders();

  const [shippingMethod, setShippingMethod] = useState(
    ShippingMethod.Motorcycle
  );
  const [paymentMethod, setPaymentMethod] = useState(
    PaymentMethod.CashOnDelivery
  );
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  });

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const bankTransferFee =
    paymentMethod === PaymentMethod.BankTransfer
      ? (cart?.subTotal ?? 0) * 0.04
      : 0;

  const onSubmit = async (data: AddressFormData) => {
    if (error) resetError();
    const payload: CreateOrderPayload = {
      shippingMethod,
      shippingAddress: data,
      paymentMethod,
    };
    const result = await placeOrder(payload);
    if (createOrder.fulfilled.match(result)) {
      setSuccess(true);
    }
  };

  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (success && modalRef.current) {
      modalRef.current.showModal();
    }
  }, [success]);

  const closeModalAndGo = () => {
    modalRef.current?.close();
  };
  return (
    <div className="min-h-screen bg-[#FFFFFF] pt-4 pb-10 px-4">
      <nav aria-label="Checkout steps" className="flex justify-center my-8">
        <ul className="steps w-full max-w-3xl mx-auto">
          <li className="step step-neutral">
            <span className="step-icon">
              <ShoppingBag size={16} />
            </span>
            <Link
              href="/cart"
              className="text-[#111111] text-lg font-bold px-2 py-1"
              style={{
                fontSize: "1.25rem",
                minHeight: "2.5rem",
                display: "inline-block",
              }}
            >
              Carrito
            </Link>
          </li>
          <li className="step step-neutral">
            <span className="step-icon">
              <Package size={16} />
            </span>
            <Link
              href="/checkout"
              className="text-[#111111] text-lg font-bold px-2 py-1"
              style={{
                fontSize: "1.25rem",
                minHeight: "2.5rem",
                display: "inline-block",
              }}
            >
              Checkout
            </Link>
          </li>
          <li className="step">
            <span className="step-icon">
              <Check size={16} />
            </span>
            <Link href="/account/orders" className="text-[#111111]">
              Confirmación
            </Link>
          </li>
        </ul>
      </nav>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-none shadow-none p-8">
        {/* Address Form */}
        <form
          className="space-y-4"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <h2 className="text-2xl font-bold mb-4 text-[#111111]">
            FACTURACIÓN Y ENVÍO
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              ["firstName", "Nombre *"],
              ["lastName", "Apellidos *"],
              ["email", "Email *", "Email"],
              ["phoneNumber", "Teléfono *"],
              ["dni", "DNI *", "DNI"],
              ["streetAddress", "Dirección *"],
              ["city", "Ciudad *", "Ciudad"],
              ["state", "Provincia *"],
              ["postalCode", "Código Postal *"],
              ["companyName", "Nombre de Empresa (opcional)"],
            ].map(([name, label, type = "text"]) => (
              <div
                key={name}
                className={
                  ["email", "streetAddress"].includes(name) ? "col-span-2" : ""
                }
              >
                <label
                  htmlFor={name}
                  className="block mb-1 text-sm"
                  style={{ color: "#7A7A7A" }}
                >
                  {label}
                </label>
                <input
                  id={name}
                  type={type}
                  {...register(name as keyof AddressFormData)}
                  className="input w-full border rounded-none bg-[#FFFFFF] text-[#222222]"
                  style={{ borderColor: "#e1e1e1" }}
                />
                {errors[name as keyof AddressFormData] && (
                  <span className="text-red-500 text-sm">
                    {errors[name as keyof AddressFormData]?.message}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Shipping Method */}
          <div className="flex flex-col gap-4 mt-4">
            {/* Método de envío */}
            <div>
              <label className="block text-sm text-[#7A7A7A] mb-2">
                Método de envío *
              </label>
              <div className="flex flex-col gap-2">
                {[ShippingMethod.Motorcycle, ShippingMethod.ParcelCompany].map(
                  (method) => {
                    const isDisabled =
                      paymentMethod === PaymentMethod.CashOnDelivery &&
                      method === ShippingMethod.ParcelCompany;

                    return (
                      <label
                        key={method}
                        className={`flex items-center gap-2 ${
                          isDisabled
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                      >
                        <input
                          type="radio"
                          name="shippingMethod"
                          value={method}
                          checked={shippingMethod === method}
                          onChange={() => setShippingMethod(method)}
                          className="radio border-[#e1e1e1] checked:bg-[#222222]"
                          disabled={isDisabled}
                        />
                        <span className="text-[#222222] text-sm">
                          {method === ShippingMethod.Motorcycle
                            ? "Moto"
                            : "Transporte/Empresa de encomienda"}{" "}
                          <span className="text-xs text-[#7A7A7A]">
                            (Costo de envío extra a cargo del Cliente)
                          </span>
                        </span>
                      </label>
                    );
                  }
                )}
              </div>
            </div>

            {/* Campos condicionales según método de envío */}
            {shippingMethod === ShippingMethod.Motorcycle && (
              <div className="col-span-2">
                <label
                  htmlFor="deliveryWindow"
                  className="block mb-1 text-sm"
                  style={{ color: "#7A7A7A" }}
                >
                  Franja horaria (opcional)
                </label>
                <input
                  id="deliveryWindow"
                  type="text"
                  {...register("deliveryWindow")}
                  className="input w-full border rounded-none bg-[#FFFFFF] text-[#222222]"
                  style={{ borderColor: "#e1e1e1" }}
                />
                {errors.deliveryWindow && (
                  <span className="text-red-500 text-sm">
                    {errors.deliveryWindow.message}
                  </span>
                )}
              </div>
            )}

            {shippingMethod === ShippingMethod.ParcelCompany && (
              <>
                <div className="col-span-2">
                  <label
                    htmlFor="shippingCompany"
                    className="block mb-1 text-sm"
                    style={{ color: "#7A7A7A" }}
                  >
                    Transporte / Empresa de encomienda *
                  </label>
                  <input
                    id="shippingCompany"
                    type="text"
                    {...register("shippingCompany")}
                    className="input w-full border rounded-none bg-[#FFFFFF] text-[#222222]"
                    style={{ borderColor: "#e1e1e1" }}
                  />
                  {errors.shippingCompany && (
                    <span className="text-red-500 text-sm">
                      {errors.shippingCompany.message}
                    </span>
                  )}
                </div>

                <div className="col-span-2">
                  <label
                    htmlFor="declaredShippingAmount"
                    className="block mb-1 text-sm"
                    style={{ color: "#7A7A7A" }}
                  >
                    Valor declarado (opcional)
                  </label>
                  <input
                    id="declaredShippingAmount"
                    type="text"
                    {...register("declaredShippingAmount")}
                    className="input w-full border rounded-none bg-[#FFFFFF] text-[#222222]"
                    style={{ borderColor: "#e1e1e1" }}
                  />
                  {errors.declaredShippingAmount && (
                    <span className="text-red-500 text-sm">
                      {errors.declaredShippingAmount.message}
                    </span>
                  )}
                </div>
              </>
            )}

            {/* Método de pago */}
            <div>
              <label className="block text-sm text-[#7A7A7A] mb-2">
                Método de pago *
              </label>
              <div className="flex flex-col gap-2">
                {[PaymentMethod.BankTransfer, PaymentMethod.CashOnDelivery].map(
                  (method) => {
                    const isDisabled =
                      shippingMethod === ShippingMethod.ParcelCompany &&
                      method === PaymentMethod.CashOnDelivery;

                    return (
                      <label
                        key={method}
                        className={`flex items-center gap-2 ${
                          isDisabled
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method}
                          checked={paymentMethod === method}
                          onChange={() => setPaymentMethod(method)}
                          className="radio border-[#e1e1e1] checked:bg-[#222222]"
                          disabled={isDisabled}
                        />
                        <span className="text-[#222222] text-sm">
                          {method === PaymentMethod.BankTransfer
                            ? "Transferencia / Depósito bancario"
                            : "Efectivo contra reembolso"}{" "}
                          {method === PaymentMethod.BankTransfer && (
                            <span className="text-xs text-[#7A7A7A]">
                              (4% extra)
                            </span>
                          )}
                        </span>
                      </label>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        </form>
        {/* Cart Summary */}
        <div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: "#222222" }}>
            TU PEDIDO
          </h2>
          <div className="space-y-4">
            {cart?.items.length ? (
              cart.items.map((item, idx) => {
                const variant =
                  typeof item.productVariant === "string"
                    ? null
                    : item.productVariant;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 border-b pb-2"
                  >
                    {variant && (
                      <Image
                        src={
                          variant.images?.[0]
                            ? process.env.NEXT_PUBLIC_API_URL +
                              variant.images[0]
                            : "/placeholder.png"
                        }
                        width={40}
                        height={40}
                        alt={variant.product.productModel}
                        className="w-10 h-10 object-cover rounded-none"
                      />
                    )}

                    <div className="flex-1">
                      <div
                        className="font-semibold"
                        style={{ color: "#222222" }}
                      >
                        {variant?.product.productModel}
                      </div>
                      <div className="text-sm" style={{ color: "#222222" }}>
                        Color: {variant?.color.name}
                      </div>
                      <div className="text-sm" style={{ color: "#222222" }}>
                        Cantidad: {item.quantity}
                      </div>
                    </div>
                    <div className="font-bold" style={{ color: "#222222" }}>
                      {formatCurrency(item.subTotal, "en-US", "USD")}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-gray-500" style={{ color: "#222222" }}>
                Tu carrito está vacío.
              </div>
            )}
          </div>
          <div className="mt-6 border-t pt-4">
            <div
              className="flex justify-between text-lg font-semibold"
              style={{ color: "#222222" }}
            >
              <span>Subtotal</span>
              <span>{formatCurrency(cart?.subTotal ?? 0, "en-US", "USD")}</span>
            </div>
            {paymentMethod === PaymentMethod.BankTransfer && (
              <div
                className="flex justify-between text-base"
                style={{ color: "#222222" }}
              >
                <span>Gasto por transferencia bancaria</span>
                <span>{formatCurrency(bankTransferFee, "en-US", "USD")}</span>
              </div>
            )}
            <div
              className="flex justify-between text-lg font-semibold"
              style={{ color: "#222222" }}
            >
              <span>TOTAL</span>
              <span>
                {formatCurrency(
                  (cart?.subTotal ?? 0) + bankTransferFee,
                  "en-US",
                  "USD"
                )}
              </span>
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && (
              <div className="text-green-600 font-semibold">
                ¡Orden creada con éxito!
              </div>
            )}
            <button
              type="submit"
              className={`mt-4 btn rounded-none shadow-none border-none h-12 px-6 w-full transition-colors duration-300 ease-in-out ${
                orderLoading || cartLoading
                  ? "bg-[#666666] cursor-not-allowed pointer-events-none"
                  : "bg-[#222222] hover:bg-[#111111]"
              } text-white`}
              onClick={
                orderLoading || cartLoading ? undefined : handleSubmit(onSubmit)
              }
            >
              {orderLoading ? <LoadingSpinner /> : "Realizar pedido"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-8 text-center">
        <p className="text-sm text-gray-500" style={{ color: "#7A7A7A" }}>
          Al realizar el pedido, aceptas nuestros{" "}
          <a
            href="/terms"
            className="text-blue-600 hover:underline"
            style={{ color: "#007BFF" }}
          >
            Términos y Condiciones
          </a>
        </p>
      </div>

      <dialog id="order_success_modal" className="modal" ref={modalRef}>
        <div className="modal-box bg-white text-[#111111] rounded-none">
          <h3 className="font-bold text-lg">¡Orden creada con éxito!</h3>
          <p className="py-4">
            Gracias por tu compra. Pronto recibirás un correo de confirmación
            con los detalles de tu pedido. Tambien puedes revisar el estado de
            tu pedido en{" "}
            <Link
              href="/account/orders"
              className="text-[#000000] underline-animate"
            >
              Mis Pedidos
            </Link>
            .
          </p>
          <div className="modal-action">
            <Link
              href="/account/orders"
              className="btn rounded-none shadow-none border-none transition-colors duration-300 ease-in-out h-12 text-base px-6 w-full"
              onClick={closeModalAndGo}
            >
              Ir a Mis Pedidos
            </Link>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default CheckoutPage;
