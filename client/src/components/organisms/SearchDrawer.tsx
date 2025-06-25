import React, { useState, useEffect } from "react";
import SearchIcon from "../atoms/Icon/SearchIcon";
import { useProducts } from "@/hooks/useProducts";
import ProductCard from "../molecules/ProductCard";
import { usePathname } from "next/navigation";

const SearchDrawer: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const pathname = usePathname();

  const { searchResults, searchLoading, searchProducts, clearSearchResults } =
    useProducts();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      clearSearchResults();
      setSearching(false);
      return;
    }
    setSearching(true);
    await searchProducts(query);
  };

  const handleClose = () => {
    setOpen(false);
    setQuery("");
    clearSearchResults();
    setSearching(false);
  };

  // Cerrar drawer cuando cambie el pathname
  useEffect(() => {
    if (open) {
      handleClose();
    }
  }, [pathname]);

  return (
    <>
      {/* Botón para abrir el Drawer */}
      <button
        className="flex items-center gap-2 bg-white text-black cursor-pointer"
        onClick={() => setOpen(true)}
        aria-label="Abrir búsqueda"
      >
        <SearchIcon />
        <span className="hidden sm:inline">Buscar</span>
      </button>

      {/* Drawer */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          open ? "visible" : "invisible pointer-events-none"
        }`}
      >
        {/* Fondo blanco semi-transparente */}
        <div
          className={`absolute inset-0 bg-white bg-opacity-90 transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={handleClose}
        />

        {/* Contenido del Drawer */}
        <div
          className={`absolute left-0 top-0 w-full max-w-full bg-white shadow-lg transition-transform duration-300 ${
            open ? "translate-y-0" : "-translate-y-full"
          }`}
          style={{ maxHeight: "100vh", height: "100vh", overflow: "hidden" }}
        >
          {/* Botón cerrar */}
          <div className="flex justify-end p-4">
            <button
              className="text-black hover:text-gray-700 text-2xl"
              onClick={handleClose}
              aria-label="Cerrar búsqueda"
            >
              ✕
            </button>
          </div>
          {/* Contenido centrado y scrollable */}
          <div className="flex flex-col items-center justify-center px-4 py-8 h-[calc(100vh-64px)] overflow-y-auto">
            {/* Sticky header y barra */}
            <div className="w-full max-w-2xl sticky top-0 z-10 bg-white pb-4">
              <span
                className="text-lg font-semibold mb-4 text-center block"
                style={{ color: "#111111" }}
              >
                ¿QUÉ ESTÁS BUSCANDO?
              </span>
              <form
                className="w-full max-w-md mx-auto"
                onSubmit={handleSearch}
                autoComplete="off"
              >
                <div className="relative">
                  <input
                    type="search"
                    placeholder="Buscar productos..."
                    className="flex-1 w-full outline-none px-3 py-2 bg-transparent text-black rounded-none pr-10"
                    style={{
                      border: "1px solid #e1e1e1",
                      color: "#111111",
                    }}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute inset-y-0 right-3 flex items-center text-black"
                    aria-label="Buscar"
                    tabIndex={0}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                    }}
                  >
                    <SearchIcon />
                  </button>
                  <style>{`
                    input::placeholder {
                      color: #888888 !important;
                      opacity: 1;
                    }
                  `}</style>
                </div>
              </form>
              {searching && (
                <h3 className="text-base font-semibold mb-2 mt-4 text-[#222222]">
                  Resultados de la búsqueda{query && `: "${query}"`}
                </h3>
              )}
            </div>
            {/* Resultados de búsqueda */}
            {searching && (
              <div className="w-full max-w-2xl mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {searchLoading && (
                    <div className="col-span-full text-center text-sm opacity-60">
                      Buscando...
                    </div>
                  )}
                  {!searchLoading && searchResults.length === 0 && (
                    <div className="col-span-full text-center text-sm opacity-60">
                      No se encontraron productos
                    </div>
                  )}
                  {searchResults.map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchDrawer;
