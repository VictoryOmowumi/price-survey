import { NextResponse } from "next/server";
import { PRODUCTS } from "@/schemas/product";

export async function GET() {
  return NextResponse.json({ 
    items: PRODUCTS 
  });
}
