// src/app/api/medicines/route.ts
import { NextResponse } from "next/server";
import {
  getMedicines,
  addMedicine,
  searchMedicines,
  updateMedicine,
} from "@/lib/medicine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    let medicines;
    if (search && search.trim().length > 0) {
      medicines = await searchMedicines(search.trim());
    } else {
      medicines = await getMedicines();
    }

    return NextResponse.json({ medicines });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch medicines" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const medicine = await addMedicine(body);
    return NextResponse.json({ medicine });
  } catch {
    return NextResponse.json(
      { error: "Failed to add medicine" },
      { status: 500 }
    );
  }
}