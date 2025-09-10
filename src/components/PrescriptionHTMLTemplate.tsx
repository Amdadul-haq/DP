// components/PrescriptionHTMLTemplate.tsx
"use client";

interface Medicine {
  name: string;
  rules: string;
  days: string;
  notes?: string;
}

interface PrescriptionData {
  id: number;
  patient_id: number;
  diagnosis: string;
  history: string;
  cc: string;
  bp: string;
  pulse: string;
  weight: string;
  temperature: string;
  tests: string;
  advice: string;
  next_visit_date: string;
  created_at: string;
  patient_name: string;
  patient_age: number;
  patient_gender: string;
  patient_mobile: string;
  doctor_first_name: string;
  doctor_last_name: string;
  doctor_bmdc: string;
  doctor_specialty: string;
  medicines: Medicine[];
}

interface PrescriptionHTMLTemplateProps {
  prescription: PrescriptionData;
  isForPDF?: boolean;
}

export function PrescriptionHTMLTemplate({
  prescription,
  isForPDF = false,
}: PrescriptionHTMLTemplateProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const splitValues = (value: string) => {
    if (!value) return [];
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const nextVisitDate = prescription.next_visit_date
    ? new Date(prescription.next_visit_date).toLocaleDateString("en-BD", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div
      className={`bg-white p-4 rounded-lg flex flex-col justify-between ${
        isForPDF ? "" : "shadow-lg print:shadow-none print:border-0"
      }`}
      style={{ minHeight: "297mm" }}
    >
      <div>
        {/* Doctor Info */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              ডাঃ {prescription.doctor_first_name}{" "}
              {prescription.doctor_last_name}
            </h3>
            <p className="text-sm text-gray-600">
              {prescription.doctor_specialty} • BMDC: {prescription.doctor_bmdc}
            </p>
          </div>
          <div className="text-right">
            <h3 className="text-lg font-semibold text-gray-800">
              Dr. {prescription.doctor_first_name}{" "}
              {prescription.doctor_last_name}
            </h3>
            <p className="text-sm text-gray-600">
              {prescription.doctor_specialty} • BMDC: {prescription.doctor_bmdc}
            </p>
          </div>
        </div>

        {/* Patient Info */}
        <div className="grid grid-cols-4 gap-2 border-t-2 border-b-2 border-black bg-gray-50 p-2">
          <div className="text-gray-800">
            <span className="font-semibold">ID:</span> {prescription.patient_id}
          </div>
          <div className="text-gray-800">
            <span className="font-semibold">Name:</span>{" "}
            {prescription.patient_name}
          </div>
          <div className="text-gray-800">
            <span className="font-semibold">Age/Sex:</span>{" "}
            {prescription.patient_age}y / {prescription.patient_gender}
          </div>
          <div className="text-gray-800">
            <span className="font-semibold">Date:</span>{" "}
            {formatDate(prescription.created_at)}
          </div>
        </div>

        {/* Section with Vertical Divider */}
        <div className="relative">
          <div className="grid grid-cols-5 gap-6 py-6 border-b-2 border-black">
            {/* Left Column */}
            <div className="col-span-2 space-y-4">
              {prescription.cc && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Chief Complaints (CC):
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {splitValues(prescription.cc).map((complaint, index) => (
                      <li key={index} className="text-gray-700">
                        {complaint}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-gray-800 mb-2">
                  On Examination:
                </h4>
                <div className="grid grid-cols-2 gap-2 text-gray-700">
                  {prescription.bp && (
                    <div>
                      <span className="font-medium">BP:</span> {prescription.bp}
                    </div>
                  )}
                  {prescription.pulse && (
                    <div>
                      <span className="font-medium">Pulse:</span>{" "}
                      {prescription.pulse}
                    </div>
                  )}
                  {prescription.weight && (
                    <div>
                      <span className="font-medium">Weight:</span>{" "}
                      {prescription.weight} kg
                    </div>
                  )}
                  {prescription.temperature && (
                    <div>
                      <span className="font-medium">Temp:</span>{" "}
                      {prescription.temperature}°C
                    </div>
                  )}
                </div>
              </div>

              {prescription.diagnosis && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Diagnosis:
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {splitValues(prescription.diagnosis).map((diag, index) => (
                      <li key={index} className="text-gray-700">
                        {diag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {prescription.tests && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Tests Recommended:
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {splitValues(prescription.tests).map((test, index) => (
                      <li key={index} className="text-gray-700">
                        {test}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {prescription.history && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Medical History:
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {splitValues(prescription.history).map((history, index) => (
                      <li key={index} className="text-gray-700">
                        {history}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="col-span-3">
              <h4 className="font-semibold text-gray-800 mb-4 border-b pb-2">
                Medicines:
              </h4>
              <div className="space-y-3">
                {prescription.medicines.map((medicine, index) => (
                  <div key={index} className="border-b pb-3 last:border-b-0">
                    <div className="font-medium text-gray-800">
                      {medicine.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span>{medicine.rules}</span>
                      {" • "}
                      <span>{medicine.days}</span>
                      {medicine.notes && (
                        <>
                          {" • "}
                          <span>{medicine.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vertical Divider connected top (patient info) → bottom (footer line) */}
          <div className="absolute top-0 bottom-0 left-[40%] border-l-2 border-black"></div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4">
        <div className="grid grid-cols-3 gap-4">
          {prescription.advice && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Advice:</h4>
              <ul className="list-disc list-inside space-y-1">
                {splitValues(prescription.advice).map((advice, index) => (
                  <li key={index} className="text-gray-700">
                    {advice}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {prescription.next_visit_date && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Next Visit:</h4>
              <p className="text-gray-700">{nextVisitDate}</p>
            </div>
          )}

          <div>
            <h4 className="font-semibold text-gray-800 mb-2">
              Chamber Information:
            </h4>
            <p className="text-gray-700">Please contact for appointment</p>
            <p className="text-sm text-gray-600 mt-1">
              Mobile: {prescription.patient_mobile}
            </p>
          </div>
        </div>
      </div>

      {/* Signature */}
      <div className="text-right mt-8 pt-4 border-t border-gray-300">
        <div className="inline-block text-center">
          <div className="h-12 border-b border-gray-400 mb-2"></div>
          <p className="text-sm text-gray-600">Doctor&apos;s Signature</p>
        </div>
      </div>
    </div>
  );
}
