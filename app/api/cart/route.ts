'use server'
const sql = require('../../lib/db.js');
import { uid } from 'uid-promise';
import { getCookies } from 'next-client-cookies/server';
import { NextResponse } from "next/server";
import type { User } from '@/app/lib/definitions';
export async function POST(req: Request) {
  const { productId } = await req.json();
  
  const  cookies  = getCookies();

  const  value  = cookies.get('email_address');
  
  try {
    
    //console.log(await uid(36));
    const cart_item_id = await uid(36);
    const rows = await sql<User>`SELECT id FROM users WHERE email=${value}`;
    const id = await rows.map(({ id }: { id: number }) => id);
    const user_id = await rows.map(({ id }: { id: number }) => id);
    const rows1 = await sql<User>`SELECT img_url FROM products WHERE id=${productId}`;
    const img_url = await rows1.map(({ img_url }: { img_url: string }) => img_url);
    const product_id = await rows1.map(({ product_id }: { product_id: string }) => product_id);


    console.log(img_url);
    
    const { rows2 } =
     await sql`INSERT INTO cart_items(id, cart_item_id,user_id, product_id, img_url) VALUES(${user_id},${cart_item_id}, ${user_id}, ${productId}, ${img_url})`;
    return NextResponse.json({ message: "Added item to cart", result: true });
  } catch (e) {
    return NextResponse.json({ message: "Failed to add", result: false });
  }
}