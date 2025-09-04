import { NextResponse } from "next/server";
import { updateMedicine } from "@/lib/medicine";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const medicine = await updateMedicine(Number(params.id), body);
    return NextResponse.json({ medicine });
  } catch {
    return NextResponse.json(
      { error: "Failed to update medicine" },
      { status: 500 }
    );
  }
}
