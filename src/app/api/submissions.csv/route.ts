import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Submission from "@/models/Submission";

export async function GET(req: Request) {
  try {
    // Check if we're in a build environment
    if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
      return NextResponse.json(
        { ok: false, error: 'Database not configured' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const area = searchParams.get('area');
    const outletName = searchParams.get('outletName');
    const hasGeo = searchParams.get('hasGeo');
    const product = searchParams.get('product');
    const productName = searchParams.get('productName');
    const buyPrice = searchParams.get('buyPrice');
    const sellPrice = searchParams.get('sellPrice');

    await dbConnect();

    const query: Record<string, unknown> = {};
    
    if (from || to) {
      query.collectedAt = {} as Record<string, unknown>;
      if (from) (query.collectedAt as Record<string, unknown>).$gte = new Date(from);
      if (to) (query.collectedAt as Record<string, unknown>).$lte = new Date(to);
    }
    
    if (area) query.area = new RegExp(area, 'i');
    if (outletName) query.outletName = new RegExp(outletName, 'i');
    if (hasGeo === 'true') query.geo = { $ne: null };
    if (hasGeo === 'false') query.geo = null;

    // Product filters live inside the `items` array.
    const itemMatch: Record<string, unknown> = {};
    if (product) {
      const escapedProduct = product.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      itemMatch.productName = new RegExp(`^${escapedProduct}$`, 'i');
    } else if (productName) {
      itemMatch.productName = new RegExp(productName, 'i');
    }

    if (buyPrice) {
      const parsedBuyPrice = Number(buyPrice);
      if (!Number.isNaN(parsedBuyPrice)) {
        itemMatch.buyPrice = parsedBuyPrice;
      }
    }

    if (sellPrice) {
      const parsedSellPrice = Number(sellPrice);
      if (!Number.isNaN(parsedSellPrice)) {
        itemMatch.sellPrice = parsedSellPrice;
      }
    }

    if (Object.keys(itemMatch).length > 0) {
      query.items = { $elemMatch: itemMatch };
    }

    const submissions = await Submission.find(query)
      .sort({ collectedAt: -1 })
      .limit(10000);

    // Create CSV header
    const headers = [
      'ID',
      'Customer Name',
      'Customer Phone',
      'Outlet Name',
      'Outlet Address',
      'Area',
      'Latitude',
      'Longitude',
      'Accuracy',
      'Product Name',
      'Buy Price (NGN)',
      'Sell Price (NGN)',
      'Collected At',
      'Day',
      'User Agent',
      'Platform',
      'Created At',
      'Updated At'
    ];

    // Create CSV rows
    const rows = submissions.flatMap(submission => 
      submission.items.map((item: { productName: string; buyPrice: number; sellPrice: number }) => [
        submission._id,
        submission.customerName,
        submission.customerPhone || '',
        submission.outletName,
        submission.outletAddress,
        submission.area,
        submission.geo?.lat || '',
        submission.geo?.lng || '',
        submission.geo?.accuracy || '',
        item.productName,
        item.buyPrice,
        item.sellPrice,
        submission.collectedAt.toISOString(),
        submission.day,
        submission.clientMeta?.userAgent || '',
        submission.clientMeta?.platform || '',
        submission.createdAt.toISOString(),
        submission.updatedAt.toISOString()
      ])
    );

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.map((field: unknown) => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="price-survey-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
