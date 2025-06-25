// app/categorias/[categorySlug]/page.tsx

import ProductList from "@/components/organisms/ProductList";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const { categorySlug } = await params;

  return <ProductList categorySlug={categorySlug} />;
}
