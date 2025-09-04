import { NextResponse } from "next/server";
import { PRODUCTS } from "@/schemas/product";

export async function GET() {
  try {
    return NextResponse.json({ 
      items: PRODUCTS 
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
