
import { fetchProducts } from '@/app/lib/data';
import ProductsTable from '@/app/ui/products/table';
import { Metadata } from 'next';


export const metadata: Metadata = {
  title: 'Products',
};

export default async function ProductsPage ({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query || '';
  const products = await fetchProducts(query);
  return (
    <main>
      <ProductsTable products={products} />
      
    </main>
  );
}