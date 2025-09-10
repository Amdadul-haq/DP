// app/(dashboard)/dashboard/prescriptions/[id]/print-view/page.tsx
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { PrescriptionHTMLTemplate } from "@/components/PrescriptionHTMLTemplate";
import { verifyJWT } from "@/lib/auth";

async function getPrescription(id: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/prescriptions/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch prescription");
  }

  return response.json();
}

export default async function PrintView({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;

  // Get token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    // Verify the token is valid
    await verifyJWT(token);

    const data = await getPrescription(resolvedParams.id, token);

    return (
      <html>
        <head>
          <style>{`
            body {
              margin: 0;
              padding: 0;
              background: white !important;
            }
            .no-print {
              display: none !important;
            }
          `}</style>
        </head>
        <body>
          <div className="min-h-screen bg-white p-0 m-0">
            <PrescriptionHTMLTemplate prescription={data.prescription} />
          </div>
        </body>
      </html>
    );
  } catch (error) {
    console.error("Error loading prescription:", error);
    redirect("/dashboard/prescriptions");
  }
}
