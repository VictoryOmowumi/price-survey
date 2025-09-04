import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Submission from "@/models/Submission";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const area = searchParams.get('area');
    const outletName = searchParams.get('outletName');
    const hasGeo = searchParams.get('hasGeo');

    await dbConnect();

    const query: Record<string, any> = {};
    
    if (from || to) {
      query.collectedAt = {};
      if (from) query.collectedAt.$gte = new Date(from);
      if (to) query.collectedAt.$lte = new Date(to);
    }
    
    if (area) query.area = new RegExp(area, 'i');
    if (outletName) query.outletName = new RegExp(outletName, 'i');
    if (hasGeo === 'true') query.geo = { $ne: null };
    if (hasGeo === 'false') query.geo = null;

    const submissions = await Submission.find(query)
      .sort({ collectedAt: -1 })
      .limit(10000);

    // Create CSV header
    const headers = [
      'ID',
      'Customer Name',
      'Customer Phone',
      'Outlet Name',
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
      submission.items.map((item: any) => [
        submission._id,
        submission.customerName,
        submission.customerPhone || '',
        submission.outletName,
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
      .map(row => row.map((field: any) => `"${String(field).replace(/"/g, '""')}"`).join(','))
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
