// api/medicines/[id]/route.ts
import { NextResponse } from "next/server";
import { updateMedicine } from "@/lib/medicine";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // Change params to be a Promise
) {
  try {
    // Await the params first
    const resolvedParams = await params;
    
    const body = await req.json();
    const medicine = await updateMedicine(Number(resolvedParams.id), body); // Use resolvedParams.id
    return NextResponse.json({ medicine });
  } catch {
    return NextResponse.json(
      { error: "Failed to update medicine" },
      { status: 500 }
    );
  }
}