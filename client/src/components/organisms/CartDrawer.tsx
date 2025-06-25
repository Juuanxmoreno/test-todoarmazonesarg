import React, { useEffect } from "react";
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
  const { cart, loading, error, fetchCart, increment, decrement, removeItem } =
    useCart();

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
              authEvents.emit("openAccountDrawer");
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

          {loading && (
            <li className="flex justify-center text-[#888888]">
              <LoadingSpinner />
            </li>
          )}
          {error && <li className="text-error">{error}</li>}

          {!loading && cart && cart.items.length === 0 && (
            <li className="text-[#888888] text-center">
              El carrito está vacío.
            </li>
          )}

          {!loading &&
            cart &&
            cart.items.map((item, idx) => {
              const variant =
                typeof item.productVariant === "string"
                  ? null
                  : item.productVariant;

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
                          onClick={() => variant && decrement(variant._id)}
                          className="btn btn-xs bg-[#FFFFFF] hover:bg-[#FFFFFF] rounded-none border-[#e1e1e1] text-[#888888] shadow-none"
                        >
                          <MinusIcon size={14} />
                        </button>
                        <span className="mx-2">{item.quantity}</span>
                        <button
                          onClick={() => variant && increment(variant._id)}
                          className="btn btn-xs bg-[#FFFFFF] hover:bg-[#FFFFFF] rounded-none border-[#e1e1e1] text-[#888888] shadow-none"
                        >
                          <PlusIcon size={14} />
                        </button>
                      </div>

                      <span className="mt-1 text-sm">
                        Subtotal: ${item.subTotal.toLocaleString()}
                      </span>
                    </div>

                    {/* Botón eliminar */}
                    <button
                      onClick={() => variant && removeItem(variant._id)}
                      className="btn btn-xs bg-[#FFFFFF] hover:bg-[#FFFFFF] rounded-none border-[#e1e1e1] text-[#888888] shadow-none"
                      aria-label="Eliminar del carrito"
                    >
                      <TrashIcon size={14} />
                    </button>
                  </div>
                </li>
              );
            })}

          {!loading && cart && cart.items.length > 0 && (
            <li className="mt-4 font-bold text-[#222222]">
              SUBTOTAL: {formatCurrency(cart.subTotal, "es-AR", "ARS")}
            </li>
          )}

          {!loading && cart && (
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
