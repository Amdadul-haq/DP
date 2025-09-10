// app/api/prescriptions/[id]/pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { verifyJWT } from '@/lib/auth';
import { generatePrescriptionHTML } from '@/app/utils/prescription-emplate'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Verify the JWT token
    try {
      await verifyJWT(token);
    } catch (error) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const prescriptionId = resolvedParams.id;
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    // Fetch prescription data directly
    const prescriptionResponse = await fetch(`${baseUrl}/api/prescriptions/${prescriptionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!prescriptionResponse.ok) {
      return new NextResponse('Failed to fetch prescription', { status: 500 });
    }
    
    const { prescription } = await prescriptionResponse.json();
    
    // Generate HTML content using the utility function
    const htmlContent = generatePrescriptionHTML(prescription);
    
    // Launch puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set the HTML content directly
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      // printBackground: true,
      // margin: {
      //   top: '10mm',
      //   right: '10mm',
      //   bottom: '10mm',
      //   left: '10mm'
      // },
      // preferCSSPageSize: true,
    });
    
    await browser.close();
    
    // Return the PDF
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="prescription_${prescription.patient_name}_${new Date().toISOString().split('T')[0]}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return new NextResponse('Failed to generate PDF', { status: 500 });
  }
}