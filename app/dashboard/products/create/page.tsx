import Pagination from '@/app/ui/products/pagination';
import Search from '@/app/ui/search';
import Table from '@/app/ui/products/table';
import { lusitana } from '@/app/ui/fonts';
import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import { fetchProductPages, fetchProducts } from '@/app/lib/data';
import { Metadata } from 'next';
import { CreateProduct   } from '@/app/ui/products/buttons';
export const metadata: Metadata = {
  title: 'Products',
};
 
export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const products = await fetchProducts(query);
  const totalPages = products.length; // Assuming totalPages is the length of products

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Products</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search {Products}..." />
        <CreateProduct />
      </div>
      
      <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
        <Table products={products} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
      <Pagination totalPages={totalPages} />
        { <Pagination totalPages={totalPages} /> }
      </div>
    </div>
  );
}