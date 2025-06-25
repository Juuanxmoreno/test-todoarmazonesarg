// app/categorias/[categorySlug]/[subcategorySlug]/page.tsx

import ProductList from "@/components/organisms/ProductList";

export default async function SubcategoryPage({
  params,
}: {
  params: Promise<{ categorySlug: string; subcategorySlug: string }>;
}) {
  const { categorySlug, subcategorySlug } = await params;

  return (
    <ProductList
      categorySlug={categorySlug}
      subcategorySlug={subcategorySlug}
    />
  );
}
