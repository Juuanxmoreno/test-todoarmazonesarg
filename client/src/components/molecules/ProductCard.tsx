"use client";

import { Product } from "@/interfaces/product";
import Image from "next/image";
import Link from "next/link";
import BagIcon from "../atoms/Icon/BagIcon";
import { formatCurrency } from "@/utils/formatCurrency";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";
import LoadingSpinner from "../atoms/LoadingSpinner";

const ProductCard = ({
  slug,
  thumbnail,
  category,
  subcategory,
  productModel,
  sku,
  priceUSD,
  variants,
}: Product) => {
  const { addItem } = useCart();

  // Obtener colores únicos de todas las variantes
  const uniqueColors = Array.from(
    new Map(variants.map((v) => [v.color.hex, v.color])).values()
  );

  // Estado para el color seleccionado (ninguno al inicio)
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  
  // Estado local para manejar errores específicos de este producto
  const [addError, setAddError] = useState<string | null>(null);
  
  // Estado local para manejar loading específico de este producto
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // Encontrar la variante seleccionada según el color
  const selectedVariant = selectedColor
    ? variants.find((v) => v.color.hex === selectedColor) || null
    : null;

  // Imagen a mostrar: thumbnail si no hay variante seleccionada, si no la de la variante
  const imageToShow = selectedVariant ? selectedVariant.images[0] : thumbnail;

  const handleAddToCart = async () => {
    if (!selectedVariant || selectedVariant.stock === 0) return;

    // Limpiar error anterior
    setAddError(null);
    
    // Activar loading específico para este producto
    setIsAdding(true);

    const result = await addItem(selectedVariant.id, 1);
    
    // Desactivar loading específico para este producto
    setIsAdding(false);

    if (!result.success) {
      // Mostrar error específico de este producto
      const errorMessage = typeof result.error === 'string' 
        ? result.error 
        : 'Error al agregar al carrito';
      setAddError(errorMessage);
      
      // Limpiar error después de 5 segundos
      setTimeout(() => setAddError(null), 5000);
    }
    // La lógica para abrir el CartDrawer está ahora en useCart
  };

  return (
    <div className="card card-border border-[#e1e1e1] hover:shadow-lg bg-white rounded-none">
      <div className="card-body transition-transform duration-300 ease-in-out hover:scale-103">
        <Link href={`/producto/${slug}`}>
          <Image
            src={process.env.NEXT_PUBLIC_API_URL + imageToShow}
            alt={productModel}
            width={300}
            height={300}
            className="object-cover h-48 w-full"
          />
        </Link>
        <div className="flex gap-2 text-xs text-[#888888]">
          {category.map((cat, idx) => (
            <Link
              key={cat.slug}
              href={`/categorias/${encodeURIComponent(cat.slug)}`}
              className="hover:underline"
            >
              {cat.name}
              {idx < category.length - 1 && <span>,</span>}
            </Link>
          ))}
          {subcategory && subcategory.slug && (
            <>
              <span> - </span>
              <Link
                href={`/subcategoria/${encodeURIComponent(subcategory.slug)}`}
                className="hover:underline"
              >
                {subcategory.name}
              </Link>
            </>
          )}
        </div>
        <Link href={`/producto/${slug}`}>
          <h2 className="card-title text-sm font-semibold text-[#111]">
            {productModel + " " + sku}
          </h2>
        </Link>
        <p className="text-xs font-bold text-gray-800">
          {formatCurrency(priceUSD, "en-US", "USD")}
        </p>
        <div className="text-sm text-gray-500 flex items-center gap-2">
          {uniqueColors.map((c) => {
            // Encontrar la variante correspondiente a este color para verificar stock
            const variantForColor = variants.find((v) => v.color.hex === c.hex);
            const isOutOfStock =
              !variantForColor || variantForColor.stock === 0;

            return (
              <button
                key={c.hex}
                type="button"
                className={`flex items-center gap-1 focus:outline-none relative ${
                  isOutOfStock 
                    ? "pointer-events-none cursor-not-allowed" 
                    : "cursor-pointer"
                }`}
                onClick={() => {
                  if (!isOutOfStock) {
                    setSelectedColor(c.hex);
                    // Limpiar error al seleccionar un nuevo color
                    setAddError(null);
                  }
                }}
              >
                <div
                  className="tooltip"
                  data-tip={isOutOfStock ? `${c.name} - Sin stock` : c.name}
                >
                  <span
                    className={`inline-block w-4 h-4 rounded-full border border-gray-300 relative ${
                      isOutOfStock
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    } ${
                      selectedColor === c.hex && !isOutOfStock
                        ? "ring-2 ring-black"
                        : ""
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {/* Línea diagonal para colores sin stock */}
                    {isOutOfStock && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="w-5 h-px bg-red-500 rotate-45 transform"></span>
                      </span>
                    )}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        <div className="card-actions justify-center">
          <div
            className={
              selectedVariant && selectedVariant.stock > 0 ? "" : "tooltip"
            }
            data-tip={
              !selectedVariant
                ? "Selecciona un color"
                : selectedVariant?.stock === 0
                ? "Sin stock disponible"
                : undefined
            }
          >
            <button
              className={`btn rounded-none shadow-none border-none transition-colors duration-300 ease-in-out ${
                selectedVariant && selectedVariant.stock > 0 && !isAdding
                  ? "bg-[#f2f2f2] text-[#222222] hover:bg-[#000000] hover:text-[#ffffff] cursor-pointer"
                  : "bg-[#e5e5e5] text-[#888888] cursor-not-allowed pointer-events-none"
              }`}
              onClick={
                selectedVariant && selectedVariant.stock > 0 && !isAdding
                  ? handleAddToCart
                  : undefined
              }
            >
              {isAdding ? (
                <LoadingSpinner size="sm" />
              ) : (
                <BagIcon />
              )}
            </button>
          </div>
        </div>
        
        {/* Error específico para este producto */}
        {addError && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-xs text-center">
            {addError}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
