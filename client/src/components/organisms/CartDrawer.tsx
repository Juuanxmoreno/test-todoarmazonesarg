import React, { useEffect, useState } from "react";
import { useCart } from "@/hooks/useCart";
import BagIcon from "../atoms/Icon/BagIcon";
import { MinusIcon, PlusIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/utils/formatCurrency";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { authEvents } from "@/utils/authRequiredRequest";
import LoadingSpinner from "../atoms/LoadingSpinner";

const CartDrawer: React.FC = () => {
  const { user } = useAuth();
  const {
    cart,
    loading,
    error,
    fetchCart,
    increment,
    decrement,
    removeItem,
  } = useCart();

  // Estado local para manejar errores específicos por item
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({});

  // Estado local para manejar loading específico por item y acción
  const [itemLoading, setItemLoading] = useState<
    Record<
      string,
      {
        increment: boolean;
        decrement: boolean;
        remove: boolean;
      }
    >
  >({});

  const pathname = usePathname();

  useEffect(() => {
    const checkbox = document.getElementById("cart-drawer") as HTMLInputElement;
    if (checkbox) {
      const handleOpen = () => {
        if (checkbox.checked && !cart) fetchCart();
      };
      checkbox.addEventListener("change", handleOpen);
      return () => checkbox.removeEventListener("change", handleOpen);
    }
  }, [fetchCart, cart]);

  // Escuchar evento de carrito actualizado desde acción pendiente
  useEffect(() => {
    const handleCartUpdatedFromPendingAction = () => {
      // Forzar actualización del carrito cuando se ejecuta una acción pendiente
      fetchCart();
    };

    window.addEventListener('cartUpdatedFromPendingAction', handleCartUpdatedFromPendingAction);
    
    return () => {
      window.removeEventListener('cartUpdatedFromPendingAction', handleCartUpdatedFromPendingAction);
    };
  }, [fetchCart]);

  // Cierra el Drawer al cambiar de ruta
  useEffect(() => {
    const checkbox = document.getElementById("cart-drawer") as HTMLInputElement;
    if (checkbox) checkbox.checked = false;
  }, [pathname]);

  // Cierra el Drawer cuando el usuario se autentica
  useEffect(() => {
    if (user) {
      const checkbox = document.getElementById(
        "cart-drawer"
      ) as HTMLInputElement;
      if (checkbox) checkbox.checked = false;
    }
  }, [user]);

  // Limpiar errores cuando el error global cambia
  useEffect(() => {
    if (!error) {
      setItemErrors({});
    }
  }, [error]);

  // Handlers con manejo de errores específicos
  const handleIncrement = async (productVariantId: string) => {
    // Limpiar error anterior para este item
    setItemErrors((prev) => ({ ...prev, [productVariantId]: "" }));

    // Activar loading específico para este item
    setItemLoading((prev) => ({
      ...prev,
      [productVariantId]: {
        increment: true,
        decrement: prev[productVariantId]?.decrement || false,
        remove: prev[productVariantId]?.remove || false,
      },
    }));

    const result = await increment(productVariantId);

    // Desactivar loading específico para este item
    setItemLoading((prev) => ({
      ...prev,
      [productVariantId]: {
        increment: false,
        decrement: prev[productVariantId]?.decrement || false,
        remove: prev[productVariantId]?.remove || false,
      },
    }));

    if (!result.success) {
      setItemErrors((prev) => ({
        ...prev,
        [productVariantId]:
          typeof result.error === "string"
            ? result.error
            : "Error al incrementar cantidad",
      }));
    }
  };

  const handleDecrement = async (productVariantId: string) => {
    // Limpiar error anterior para este item
    setItemErrors((prev) => ({ ...prev, [productVariantId]: "" }));

    // Activar loading específico para este item
    setItemLoading((prev) => ({
      ...prev,
      [productVariantId]: {
        increment: prev[productVariantId]?.increment || false,
        decrement: true,
        remove: prev[productVariantId]?.remove || false,
      },
    }));

    const result = await decrement(productVariantId);

    // Desactivar loading específico para este item
    setItemLoading((prev) => ({
      ...prev,
      [productVariantId]: {
        increment: prev[productVariantId]?.increment || false,
        decrement: false,
        remove: prev[productVariantId]?.remove || false,
      },
    }));

    if (!result.success) {
      setItemErrors((prev) => ({
        ...prev,
        [productVariantId]:
          typeof result.error === "string"
            ? result.error
            : "Error al decrementar cantidad",
      }));
    }
  };

  const handleRemoveItem = async (productVariantId: string) => {
    // Limpiar error anterior para este item
    setItemErrors((prev) => ({ ...prev, [productVariantId]: "" }));

    // Activar loading específico para este item
    setItemLoading((prev) => ({
      ...prev,
      [productVariantId]: {
        increment: prev[productVariantId]?.increment || false,
        decrement: prev[productVariantId]?.decrement || false,
        remove: true,
      },
    }));

    const result = await removeItem(productVariantId);

    // Desactivar loading específico para este item
    setItemLoading((prev) => ({
      ...prev,
      [productVariantId]: {
        increment: prev[productVariantId]?.increment || false,
        decrement: prev[productVariantId]?.decrement || false,
        remove: false,
      },
    }));

    if (!result.success) {
      setItemErrors((prev) => ({
        ...prev,
        [productVariantId]:
          typeof result.error === "string"
            ? result.error
            : "Error al eliminar ítem",
      }));
    }
  };

  // Helper para obtener el estado de loading de un item específico
  const getItemLoading = (productVariantId: string) => {
    return (
      itemLoading[productVariantId] || {
        increment: false,
        decrement: false,
        remove: false,
      }
    );
  };

  return (
    <div className="drawer drawer-end">
      <input id="cart-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <label
          htmlFor="cart-drawer"
          className="btn text-lg bg-transparent text-black border-none shadow-none"
          onClick={(e) => {
            if (!user) {
              e.preventDefault();
              authEvents.emit("openAccountDrawer", {});
            }
          }}
        >
          <BagIcon />
        </label>
      </div>
      <div className="drawer-side">
        <label htmlFor="cart-drawer" className="drawer-overlay" />
        <ul className="bg-[#ffffff] min-h-full w-80 p-4">
          <h2 className="text-lg font-bold mb-4 text-black flex items-center gap-2 justify-center">
            <BagIcon /> Carrito de Compras
          </h2>

          {loading.fetch && (
            <li className="flex justify-center text-[#888888]">
              <LoadingSpinner size="sm" />
            </li>
          )}

          {/* Error al cargar el carrito */}
          {error && loading.fetch && (
            <li className="mx-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {error}
            </li>
          )}

          {!loading.fetch && cart && cart.items.length === 0 && (
            <li className="text-[#888888] text-center">
              El carrito está vacío.
            </li>
          )}

          {!loading.fetch &&
            cart &&
            cart.items.map((item, idx) => {
              const variant =
                typeof item.productVariant === "string"
                  ? null
                  : item.productVariant;

              // Obtener el estado de loading específico para este item
              const currentItemLoading = variant
                ? getItemLoading(variant._id)
                : {
                    increment: false,
                    decrement: false,
                    remove: false,
                  };

              return (
                <li key={idx} className="mb-4 p-3">
                  <div className="flex items-start gap-2">
                    {variant?.images?.[0] && (
                      <Image
                        src={
                          process.env.NEXT_PUBLIC_API_URL + variant.images[0]
                        }
                        alt={variant.product.productModel}
                        width={48}
                        height={48}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex flex-col text-sm text-gray-700 flex-grow">
                      <span className="font-semibold text-[#222222]">
                        {variant?.product.productModel ?? "Producto"}{" "}
                        {variant?.product.sku}
                      </span>
                      <span className="text-gray-500">
                        {variant?.color.name ?? "N/A"}
                      </span>

                      {/* Cantidad con botones */}
                      <div className="flex items-center mt-1">
                        <button
                          onClick={
                            variant && !currentItemLoading.decrement
                              ? () => handleDecrement(variant._id)
                              : undefined
                          }
                          className={`btn btn-xs rounded-none border-[#e1e1e1] shadow-none ${
                            currentItemLoading.decrement
                              ? "bg-[#f5f5f5] text-[#ccc] cursor-not-allowed pointer-events-none"
                              : "bg-[#FFFFFF] hover:bg-[#FFFFFF] text-[#888888] cursor-pointer"
                          }`}
                        >
                          {currentItemLoading.decrement ? (
                            <LoadingSpinner size="xs" />
                          ) : (
                            <MinusIcon size={14} />
                          )}
                        </button>
                        <span className="mx-2">{item.quantity}</span>
                        <button
                          onClick={
                            variant && !currentItemLoading.increment
                              ? () => handleIncrement(variant._id)
                              : undefined
                          }
                          className={`btn btn-xs rounded-none border-[#e1e1e1] shadow-none ${
                            currentItemLoading.increment
                              ? "bg-[#f5f5f5] text-[#ccc] cursor-not-allowed pointer-events-none"
                              : "bg-[#FFFFFF] hover:bg-[#FFFFFF] text-[#888888] cursor-pointer"
                          }`}
                        >
                          {currentItemLoading.increment ? (
                            <LoadingSpinner size="xs" />
                          ) : (
                            <PlusIcon size={14} />
                          )}
                        </button>
                      </div>

                      <span className="mt-1 text-sm">
                        Subtotal: ${item.subTotal.toLocaleString()}
                      </span>
                    </div>

                    {/* Botón eliminar */}
                    <button
                      onClick={
                        variant && !currentItemLoading.remove
                          ? () => handleRemoveItem(variant._id)
                          : undefined
                      }
                      className={`btn btn-xs rounded-none border-[#e1e1e1] shadow-none ${
                        currentItemLoading.remove
                          ? "bg-[#f5f5f5] text-[#ccc] cursor-not-allowed pointer-events-none"
                          : "bg-[#FFFFFF] hover:bg-[#FFFFFF] text-[#888888] cursor-pointer"
                      }`}
                      aria-label="Eliminar del carrito"
                    >
                      {currentItemLoading.remove ? (
                        <LoadingSpinner size="xs" />
                      ) : (
                        <TrashIcon size={14} />
                      )}
                    </button>
                  </div>

                  {/* Error contextual para este item */}
                  {variant && itemErrors[variant._id] && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-xs">
                      {itemErrors[variant._id]}
                    </div>
                  )}
                </li>
              );
            })}

          {!loading.fetch && cart && cart.items.length > 0 && (
            <li className="mt-4 font-bold text-[#222222]">
              SUBTOTAL: {formatCurrency(cart.subTotal, "es-AR", "ARS")}
            </li>
          )}

          {!loading.fetch && cart && (
            <div className="mt-6 flex flex-col gap-2 px-2">
              <button
                onClick={() => {
                  const checkbox = document.getElementById(
                    "cart-drawer"
                  ) as HTMLInputElement;
                  if (checkbox) checkbox.checked = false;
                }}
                className="btn btn-outline rounded-none text-[#111111] border-[#111111] hover:bg-[#111111] hover:text-white shadow-none"
              >
                Continuar comprando
              </button>

              {cart.items.length > 0 && (
                <Link
                  href="/checkout"
                  className="btn rounded-none bg-[#111111] text-[#FFFFFF] text-center hover:bg-[#333333] border-none shadow-none"
                >
                  Ir al Checkout
                </Link>
              )}
            </div>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CartDrawer;
