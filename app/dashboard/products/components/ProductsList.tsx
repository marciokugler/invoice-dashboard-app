//import { sql } from "@vercel/postgres";


const sql = require('../../../lib/db.js')
import Image from "next/image";

import type { Products } from '@/app/lib/definitions';
import { Metadata } from 'next';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/20/solid';

export const metadata: Metadata = {
    title: 'Products',
  };

export default async function ProductList() {
  const rows  = await sql<Products>`SELECT * FROM products`;
  //log(rows);
  return (
        <div className="flex flex-row">
                {rows.map(({ id, name, price, description, img_url }: { name: string, id: number, price: number, description: string, img_url: string }) => (
            <div key={id} className="p-2">
                <Image
                    src={`/products/${id}.png`}
                    alt="randomImage"
                    width={200}
                    height={200}
                />
                <div className="text-base">{name}</div>
                <div className="text-sm">{description}</div>
                <div className="text-xl mb-1">${price}</div>
                
            </div>
        ))}
        </div>
        );
}

export function ProductButton() {
    return (
      <Link
        href="/dashboard/products/create"
        className="flex h-10 items-center rounded-lg bg-blue-500 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        <span className="hidden md:block">Create Product</span>{' '}
        <PlusIcon className="h-5 md:ml-4" />
      </Link>
    );
  }
