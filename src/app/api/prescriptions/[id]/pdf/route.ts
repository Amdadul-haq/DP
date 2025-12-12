// src/app/api/prescriptions/[id]/pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { generatePrescriptionHTML } from "@/app/utils/prescription-template";

async function getBrowser() {
  if (process.env.VERCEL_ENV) {
    // --- Production (Vercel) ---
    const chromium = (await import("@sparticuz/chromium")).default;
    const puppeteer = await import("puppeteer-core");
    
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  } else {
    // --- Local development ---
    const puppeteer = await import("puppeteer");
    return puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
}

export async function GET(
  request: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
  try {
     const resolvedParams = await params;
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const token = authHeader.substring(7);
    try {
      await verifyJWT(token);
    } catch {
      return new NextResponse("Unauthorized", { status: 401 });
    }

  const prescriptionId = resolvedParams.id;
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    const prescriptionResponse = await fetch(
      `${baseUrl}/api/prescriptions/${prescriptionId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!prescriptionResponse.ok) {
      return new NextResponse("Failed to fetch prescription", { status: 500 });
    }

    const { prescription } = await prescriptionResponse.json();
    const htmlContent = generatePrescriptionHTML(prescription);

    // Launch browser with correct config
    const browser = await getBrowser();
    const page = await browser.newPage();
    
    // Set the content and wait for fonts to load
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Wait for fonts to be loaded - CRITICAL for Bengali font rendering
    await page.evaluateHandle('document.fonts.ready');

    const pdfBuffer = await page.pdf({
      format: "a4",
      printBackground: true,
      margin: {
        top: "2mm",
        right: "2mm",
        bottom: "2mm",
        left: "2mm",
      },
    });

    await browser.close();

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="prescription_${prescription.patient_name}_${new Date()
          .toISOString()
          .split("T")[0]}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return new NextResponse("Failed to generate PDF", { status: 500 });
  }
}