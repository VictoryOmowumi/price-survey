import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Submission from "@/models/Submission";

export async function POST(req: Request) {
  try {
    const { outletName, day } = await req.json();
    
    if (!outletName || !day) {
      return NextResponse.json(
        { ok: false, error: "Missing outletName or day" },
        { status: 400 }
      );
    }

    await dbConnect();
    
    const submission = await Submission.findOne({ outletName, day });
    
    return NextResponse.json({ 
      ok: true, 
      exists: !!submission,
      id: submission?._id 
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
