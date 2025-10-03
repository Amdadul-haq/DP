// app/api/lab-reports/[id]/pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';

interface LabReportWithCustomer {
  id: number;
  lab_id: string;
  customer_id: number;
  referred_by?: string;
  test_name: string;
  result: string;
  sample_date: string;
  report_date: string;
  verified_by?: string;
  created_at: string;
  full_name: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  mobile: string;
  email?: string;
  address?: string;
}

interface LabSettings {
  lab_name_bengali: string;
  lab_name_english: string;
  lab_address: string;
  lab_mobile: string;
  lab_email: string;
}

function generateLabReportHTML(report: LabReportWithCustomer, labSettings: LabSettings) {
  const generatedOn = new Date().toLocaleDateString('en-GB');
// Use lab settings if available, otherwise use default values
  // const labNameBengali = labSettings.lab_name_bengali || "এম.এস ফার্সি কমিউনিটি হেলথ কেয়ার সার্ভিস";
  // const labNameEnglish = labSettings.lab_name_english || "M.S FARSI COMMUNITY HEALTH CARE SERVICE";
  // const labAddress = labSettings.lab_address || "Shalbari Bazar,Badargonj,Rangpur";
  // const labMobile = labSettings.lab_mobile || "01318905857";
  // const labEmail = labSettings.lab_email || "farsi8325@gmail.com";

   const labNameBengali = labSettings.lab_name_bengali || "হেলথ কেয়ার সার্ভিস";
  const labNameEnglish = labSettings.lab_name_english || "HEALTH CARE SERVICE";
  const labAddress = labSettings.lab_address || "Bazar,Badargonj,Rangpur";
  const labMobile = labSettings.lab_mobile || "01XXXXXXXX";
  const labEmail = labSettings.lab_email || "demo@gmail.com";
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali&display=swap" rel="stylesheet">
  <title>Lab Report - ${report.lab_id}</title>
  <style>
    body {
      font-family: 'Noto Sans Bengali', Arial, sans-serif;
      margin: 0px;
      padding: 20px;
      color: #333;
    }

    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
      border: 2px solid #333;
      padding: 10px;
    }

    .header2 {
      text-align: left;
      margin-left: 110px;
    }

    .header1 {
      text-align: left;
      margin-left: 22px;
    }

    .header1, .header2 {
      flex: 1;
    }

    .header1 p, .header2 p {
      margin: 12px 0;
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
      color: #39c357;
    }

    .details {
      margin-bottom: 20px;
    }

    .details p {
      margin: 5px 0;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
    }

    .table th, .table td {
      border: 1px solid #ddd;
      padding: 8px;
    }

    .table th {
      text-align: left;
      background-color: #f2f2f2;
    }

    .footer {
      margin-top: 480px;
      text-align: right;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
    }

    #address {
      margin-top: 0px;
      font-size: 14px;
    }

    h1 {
      margin-bottom: 0px;
      font-weight: 1000;
    }

    h2 {
      margin-top: 0px;
      margin-bottom: 0px;
      font-weight: 980;
    }

    #setboder {
      border-bottom: 2px #39c357 solid;
      margin-top: 0px;
      margin-bottom: 10px;
      width: 736px;
      margin-left: 15px;
      margin-right: 15px;
    }

    #labrotary {
      font-size: 30px;
      text-align: center;
    }

    #verifyBy {
      text-align: start;
    }

    #printedOn {
      text-align: center;
      margin-top: 0px;
      margin-bottom: 5px;
      font-size: 10px;
      color: #0c0d0d;
    }
  </style>
</head>

<body>
  <div class="header">
    <h1>${labNameBengali}</h1>
    <h2>${labNameEnglish}</h2>
    <p id="setboder"></p>
    <p id="address">${labAddress} || Mobile : ${labMobile}${labEmail ? `, Email : ${labEmail}` : ''}</p>
  </div>
  <p id="labrotary">Labrotary Services</p>
  <div class="header-container">
    <div class="header1">
      <p><strong>Patient Name:</strong> ${report.full_name}</p>
      <p><strong>Lab ID:</strong> ${report.lab_id}</p>
      <p><strong>Age:</strong> ${report.age}</p>
      <p><strong>Sex:</strong> ${report.gender}</p>
    </div>
    <div class="header2">
      <p><strong>Reffered By:</strong> ${report.referred_by || 'N/A'}</p>
      <p><strong>Mobile:</strong> ${report.mobile}</p>
      <p><strong>Sample date:</strong> ${new Date(report.sample_date).toLocaleDateString('en-GB')}</p>
      <p><strong>Report date:</strong> ${new Date(report.report_date).toLocaleDateString('en-GB')}</p>
    </div>
  </div>

  <table class="table">
    <tr>
      <th>Test Name</th>
      <th>Result</th>
    </tr>
    <tr>
      <td>${report.test_name}</td>
      <td>${report.result}</td>
    </tr>
  </table>

  <div class="footer">
    <div>
      <p id="verifyBy">Verified by: ${report.verified_by || '----------------'}</p>
    </div>
    <div>
      <p id="medicalTechnologist">Medical Technologist Signature</p>
    </div>
  </div>
  <div>
    <p id="printedOn">Printed on: ${generatedOn}</p>
  </div>
</body>
</html>`;
}

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
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = await getUserFromSession(token);

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // If assistant, get doctor_id
    let doctorId = user.id;
    if (user.role === 'assistant' && user.doctor_id) {
      doctorId = user.doctor_id;
    }

    // Get lab report with customer details
    const reportResult = await pool.query<LabReportWithCustomer>(
      `SELECT lr.*, lc.full_name, lc.gender, lc.age, lc.mobile, lc.email, lc.address
       FROM lab_reports lr
       JOIN lab_customers lc ON lr.customer_id = lc.id
       WHERE lr.id = $1 AND lr.doctor_id = $2`,
      [resolvedParams.id, doctorId]
    );

    if (reportResult.rows.length === 0) {
      return new NextResponse("Lab report not found", { status: 404 });
    }

    const report = reportResult.rows[0];

    // Get doctor's lab settings
    const labSettingsResult = await pool.query<LabSettings>(
      `SELECT lab_name_bengali, lab_name_english, lab_address, lab_mobile, lab_email
       FROM users WHERE id = $1`,
      [doctorId]
    );

    const labSettings = labSettingsResult.rows[0] || {
      lab_name_bengali: "",
      lab_name_english: "",
      lab_address: "",
      lab_mobile: "",
      lab_email: ""
    };
    
    // Generate HTML for PDF with dynamic lab settings
    const htmlContent = generateLabReportHTML(report, labSettings);


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
        "Content-Disposition": `attachment; filename="lab-report-${report.lab_id}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Lab report PDF generation error:', error);
    return new NextResponse("Failed to generate PDF", { status: 500 });
  }
}