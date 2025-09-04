import { NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/mongodb";
import Submission from "@/models/Submission";
import { SubmissionCreate } from "@/schemas/submission";
import { format } from "date-fns";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = SubmissionCreate.parse(json);

    await dbConnect();

    const collectedAt = parsed.collectedAt ?? new Date();
    const day = format(collectedAt, "yyyy-MM-dd");

    const doc = await Submission.create({
      ...parsed,
      day,
      clientMeta: {
        userAgent: req.headers.get("user-agent") || "",
        platform: req.headers.get("sec-ch-ua-platform") || "",
      },
    });

    return NextResponse.json({ ok: true, id: String(doc._id) }, { status: 201 });
  } catch (err: unknown) {
    // Duplicate guard (unique index)
    if ((err as any)?.code === 11000) {
      return NextResponse.json(
        { ok: false, code: "DUPLICATE", message: "Already captured for this outlet today" },
        { status: 409 }
      );
    }
    
    // Zod validation error
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, code: "VALIDATION_ERROR", errors: err.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 400 });
  }
}

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

    const items = await Submission.find(query)
      .sort({ collectedAt: -1 })
      .limit(1000);

    return NextResponse.json({ 
      ok: true, 
      items: items.map(item => ({
        id: item._id,
        customerName: item.customerName,
        customerPhone: item.customerPhone,
        outletName: item.outletName,
        area: item.area,
        geo: item.geo,
        items: item.items,
        collectedAt: item.collectedAt,
        day: item.day,
        clientMeta: item.clientMeta,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      total: items.length 
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
