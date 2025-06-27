import React, { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useEventListener } from "@/hooks/useEventBus";
import { cartEvents, authEvents } from "@/utils/eventBus";
import LoadingSpinner from "../atoms/LoadingSpinner";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/utils/formatCurrency";
import BagIcon from "../atoms/Icon/BagIcon";
import { MinusIcon, PlusIcon, TrashIcon } from "lucide-react";

const CartDrawer: React.FC = () => {
  const { user } = useAuth();
  const {
    cart,
    loading,
    error,
    incrementItem,
    decrementItem,
    removeItem,
    getItemLoading,
    getItemError,
  } = useCart();

  const pathname = usePathname();

  // Escuchar evento para abrir el cart drawer
  useEventListener("cart:openCartDrawer", () => {
    const checkbox = document.getElementById("cart-drawer") as HTMLInputElement;
    if (checkbox) checkbox.checked = true;
  });

  // Escuchar evento para cerrar el cart drawer
  useEventListener("cart:closeCartDrawer", () => {
    const checkbox = document.getElementById("cart-drawer") as HTMLInputElement;
    if (checkbox) checkbox.checked = false;
  });

  // Cierra el Drawer al cambiar de ruta
  useEffect(() => {
    cartEvents.closeCartDrawer();
  }, [pathname]);

  // Cierra el Drawer cuando el usuario se autentica
  useEffect(() => {
    if (user) {
      cartEvents.closeCartDrawer();
    }
  }, [user]);

  // Handlers simplificados usando el nuevo hook
  const handleIncrement = async (productVariantId: string) => {
    await incrementItem({ productVariantId });
  };

  const handleDecrement = async (productVariantId: string) => {
    await decrementItem({ productVariantId });
  };

  const handleRemoveItem = async (productVariantId: string) => {
    await removeItem({ productVariantId });
  };

  // ✅ Handler para abrir carrito con verificación de autenticación
  const handleOpenCart = () => {
    if (!user) {
      // Si no hay usuario, abrir el drawer de autenticación
      authEvents.openAccountDrawer();
    } else {
      // Si hay usuario, abrir el carrito
      cartEvents.openCartDrawer();
    }
  };

  return (
    <div className="drawer drawer-end">
      <input id="cart-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <button
          className="btn text-lg bg-transparent text-black border-none shadow-none relative"
          onClick={handleOpenCart}
        >
          <BagIcon />
          {/* Mostrar contador en pantallas pequeñas */}
          {user && cart && cart.items.length > 0 && (
            <div className="badge badge-ghost badge-xs rounded-full absolute -top-1 -right-1 lg:hidden">
              {cart.items.reduce((total, item) => total + item.quantity, 0)}
            </div>
          )}
          {/* Mostrar subtotal en pantallas grandes */}
          {user && cart && cart.items.length > 0 && (
            <span className="hidden lg:inline text-sm font-normal">
              {formatCurrency(cart.subTotal, "en-US", "USD")}
            </span>
          )}
        </button>
      </div>
      <div className="drawer-side">
        <label htmlFor="cart-drawer" className="drawer-overlay" />
        <ul className="bg-[#ffffff] min-h-full w-80 p-4">
          <h2 className="text-lg font-bold mb-4 text-black flex items-center gap-2 justify-center">
            <BagIcon /> Carrito de Compras
          </h2>

          {/* Mensaje cuando no hay usuario autenticado */}
          {!user && (
            <li className="text-[#888888] text-center p-4">
              <p className="mb-2">Inicia sesión para ver tu carrito</p>
              <button
                onClick={() => {
                  cartEvents.closeCartDrawer();
                  authEvents.openAccountDrawer();
                }}
                className="btn btn-sm rounded-none bg-[#111111] text-white hover:bg-[#333333] border-none shadow-none"
              >
                Iniciar Sesión
              </button>
            </li>
          )}

          {/* Contenido del carrito solo si hay usuario */}
          {user && (
            <>
              {loading.getCart && (
                <li className="flex justify-center text-[#888888]">
                  <LoadingSpinner size="sm" />
                </li>
              )}

              {/* Error al cargar el carrito */}
              {error.getCart && (
                <li className="mx-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                  {error.getCart}
                </li>
              )}

              {!loading.getCart && cart && cart.items.length === 0 && (
                <li className="text-[#888888] text-center">
                  El carrito está vacío.
                </li>
              )}

              {!loading.getCart &&
                cart &&
                cart.items.map((item, idx) => {
                  const variant = item.productVariant;
                  const loadingIncrement = getItemLoading("incrementItem", variant._id);
                  const loadingDecrement = getItemLoading("decrementItem", variant._id);
                  const loadingRemove = getItemLoading("removeItem", variant._id);
                  const errorIncrement = getItemError("incrementItem", variant._id);
                  const errorDecrement = getItemError("decrementItem", variant._id);
                  const errorRemove = getItemError("removeItem", variant._id);

                  return (
                    <li key={idx} className="mb-4 p-3">
                      <div className="flex items-start gap-2">
                        {variant.images?.[0] && (
                          <Image
                            src={
                              process.env.NEXT_PUBLIC_API_URL +
                              variant.images[0]
                            }
                            alt={variant.product.productModel}
                            width={48}
                            height={48}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex flex-col text-sm text-gray-700 flex-grow">
                          <span className="font-semibold text-[#222222]">
                            {variant.product.productModel} {variant.product.sku}
                          </span>
                          <span className="text-gray-500">
                            {variant.color.name}
                          </span>

                          {/* Cantidad con botones */}
                          <div className="flex items-center mt-1">
                            <button
                              onClick={() => handleDecrement(variant._id)}
                              disabled={loadingDecrement}
                              className={`btn btn-xs rounded-none border-[#e1e1e1] shadow-none ${
                                loadingDecrement
                                  ? "bg-[#f5f5f5] text-[#ccc] cursor-not-allowed"
                                  : "bg-[#FFFFFF] hover:bg-[#FFFFFF] text-[#888888] cursor-pointer"
                              }`}
                            >
                              {loadingDecrement ? (
                                <LoadingSpinner size="xs" />
                              ) : (
                                <MinusIcon size={14} />
                              )}
                            </button>
                            <span className="mx-2">{item.quantity}</span>
                            <button
                              onClick={() => handleIncrement(variant._id)}
                              disabled={loadingIncrement}
                              className={`btn btn-xs rounded-none border-[#e1e1e1] shadow-none ${
                                loadingIncrement
                                  ? "bg-[#f5f5f5] text-[#ccc] cursor-not-allowed"
                                  : "bg-[#FFFFFF] hover:bg-[#FFFFFF] text-[#888888] cursor-pointer"
                              }`}
                            >
                              {loadingIncrement ? (
                                <LoadingSpinner size="xs" />
                              ) : (
                                <PlusIcon size={14} />
                              )}
                            </button>
                          </div>

                          <span className="mt-1 text-sm">
                            Subtotal: {formatCurrency(item.subTotal, "es-AR", "ARS")}
                          </span>
                        </div>

                        {/* Botón eliminar */}
                        <button
                          onClick={() => handleRemoveItem(variant._id)}
                          disabled={loadingRemove}
                          className={`btn btn-xs rounded-none border-[#e1e1e1] shadow-none ${
                            loadingRemove
                              ? "bg-[#f5f5f5] text-[#ccc] cursor-not-allowed"
                              : "bg-[#FFFFFF] hover:bg-[#FFFFFF] text-[#888888] cursor-pointer"
                          }`}
                          aria-label="Eliminar del carrito"
                        >
                          {loadingRemove ? (
                            <LoadingSpinner size="xs" />
                          ) : (
                            <TrashIcon size={14} />
                          )}
                        </button>
                      </div>

                      {/* Errores específicos por operación */}
                      {errorIncrement && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-xs">
                          {errorIncrement}
                        </div>
                      )}
                      {errorDecrement && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-xs">
                          {errorDecrement}
                        </div>
                      )}
                      {errorRemove && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-xs">
                          {errorRemove}
                        </div>
                      )}
                    </li>
                  );
                })}

              {!loading.getCart && cart && cart.items.length > 0 && (
                <li className="mt-4 font-bold text-[#222222]">
                  SUBTOTAL: {formatCurrency(cart.subTotal, "es-AR", "ARS")}
                </li>
              )}

              {!loading.getCart && cart && (
                <div className="mt-6 flex flex-col gap-2 px-2">
                  <button
                    onClick={cartEvents.closeCartDrawer}
                    className="btn btn-outline rounded-none text-[#111111] border-[#111111] hover:bg-[#111111] hover:text-white shadow-none"
                  >
                    Continuar comprando
                  </button>

                  {cart.items.length > 0 && (
                    <Link
                      href="/checkout"
                      className="btn rounded-none bg-[#111111] text-[#FFFFFF] text-center hover:bg-[#333333] border-none shadow-none"
                      onClick={cartEvents.closeCartDrawer}
                    >
                      Ir al Checkout
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CartDrawer;
