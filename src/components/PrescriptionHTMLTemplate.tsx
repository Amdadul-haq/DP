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
  patient_number: number;
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

  // Calculate days until next visit
  const calculateDaysUntilNextVisit = () => {
    if (!prescription.next_visit_date) return null;

    const nextVisitDate = new Date(prescription.next_visit_date);
    const today = new Date();
    const diffTime = nextVisitDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const nextVisitDate = prescription.next_visit_date
    ? new Date(prescription.next_visit_date).toLocaleDateString("en-BD", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const daysUntilNextVisit = calculateDaysUntilNextVisit();

  return (
    <div
      className={`bg-white p-4 rounded-lg  flex flex-col justify-between ${
        isForPDF ? "" : "shadow-lg print:shadow-none print:border-0"
      }`}
      style={{ minHeight: "297mm" }}
    >
      <div>
        {/* Doctor Info (Static) */}
        <div className="flex justify-between invisible items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-black">
              ডাঃ মোঃ সালমান ফার্সি
            </h3>
            <p className="text-sm">
              সি.পি রংপুর কমিউনিটি প্যারামেডিক ইন্সটিটিউট
            </p>
            <p className="text-sm">বি. এন. এম সি (ঢাকা)</p>
            <p className="text-sm">জে.এ.এইচ.এস, গাজীপুর (পলিপাস)</p>
            <p className="text-sm">এফ.টি বদরগঞ্জ উপজেলা স্বাস্থ্য কমপ্লেক্স</p>
            <p className="text-sm">জেনারেল প্রাকটিশনার</p>
            <p className="text-sm mt-1">মোবাইল: ০১৩১৮৯০৫৮৫৭</p>
          </div>
          <div className="text-right">
            <h3 className="text-lg font-semibold text-black">
              Dr. Salman Farshi
            </h3>
            <p className="text-sm">C.P Rangpur Community Paramedic Institute</p>
            <p className="text-sm">B.N.M.C (Dhaka)</p>
            <p className="text-sm">J.A.H.S, Gazipur (Polypus)</p>
            <p className="text-sm">F.T Badarganj Upazila Health Complex</p>
            <p className="text-sm">General Practitioner</p>
            <p className="text-sm mt-1">Movile : 01318905857</p>
          </div>
        </div>

        {/* Patient Info */}
        <div className="grid grid-cols-4 gap-2 border-t-2 border-b-2 border-black bg-gray-100 p-2">
          <div className="text-black">
            <span className="font-semibold">ID:</span>{" "}
            {prescription.patient_number}
          </div>
          <div className="text-black">
            <span className="font-semibold">Name:</span>{" "}
            {prescription.patient_name}
          </div>
          <div className="text-black">
            <span className="font-semibold">Age/Sex:</span>{" "}
            {prescription.patient_age}y / {prescription.patient_gender}
          </div>
          <div className="text-black">
            <span className="font-semibold">Date:</span>{" "}
            {formatDate(prescription.created_at)}
          </div>
        </div>

        {/* Main Content Area with Fixed Height */}
        <div className="relative" style={{ minHeight: "calc(297mm - 280px)" }}>
          <div className="grid grid-cols-5 gap-6 py-6 h-full">
            {/* Left Column */}
            <div className="col-span-2 space-y-4">
              {/* Chief Complaints - Always show title */}
              <div>
                <h4 className="font-semibold text-black mb-2">
                  Chief Complaints (CC):
                </h4>
                {prescription.cc ? (
                  <ul className="list-disc list-inside space-y-1">
                    {splitValues(prescription.cc).map((complaint, index) => (
                      <li key={index} className="text-black">
                        {complaint}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-black">N/A</p>
                )}
              </div>

              {/* Vitals Section - New Section */}
              <div>
                <h4 className="font-semibold text-black mb-2">Vitals:</h4>
                <div className="space-y-2">
                  {/* First Row: BP and Pulse */}
                  <div className="flex justify-between gap-4">
                    <div className="flex-1">
                      <span className="text-black text-sm">
                        BP:{" "}
                        {prescription.bp ? prescription.bp + " mm/Hg" : "N/A"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <span className="text-black text-sm">
                        Pulse:{" "}
                        {prescription.pulse
                          ? prescription.pulse + " bpm"
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                  {/* Second Row: Weight and Temperature */}
                  <div className="flex justify-between gap-4">
                    <div className="flex-1">
                      <span className="text-black text-sm">
                        Weight:{" "}
                        {prescription.weight
                          ? prescription.weight + " kg"
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <span className="text-black text-sm">
                        Temp:{" "}
                        {prescription.temperature
                          ? prescription.temperature + " °C"
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Diagnosis - Always show title */}
              <div>
                <h4 className="font-semibold text-black mb-2">Diagnosis:</h4>
                {prescription.diagnosis ? (
                  <ul className="list-disc list-inside space-y-1">
                    {splitValues(prescription.diagnosis).map((diag, index) => (
                      <li key={index} className="text-black">
                        {diag}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-black">N/A</p>
                )}
              </div>

              {/* Tests Recommended - Always show title */}
              <div>
                <h4 className="font-semibold text-black mb-2">
                  Tests Recommended:
                </h4>
                {prescription.tests ? (
                  <ul className="list-disc list-inside space-y-1">
                    {splitValues(prescription.tests).map((test, index) => (
                      <li key={index} className="text-black">
                        {test}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-black">N/A</p>
                )}
              </div>

              {/* Medical History - Always show title */}
              <div>
                <h4 className="font-semibold text-black mb-2">
                  Medical History:
                </h4>
                {prescription.history ? (
                  <ul className="list-disc list-inside space-y-1">
                    {splitValues(prescription.history).map((history, index) => (
                      <li key={index} className="text-black">
                        {history}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-black">N/A</p>
                )}
              </div>

              {/* Advice - Always show title */}
              <div>
                <h4 className="font-semibold text-black mb-2">Advice:</h4>
                {prescription.advice ? (
                  <ul className="list-disc list-inside space-y-1">
                    {splitValues(prescription.advice).map((advice, index) => (
                      <li key={index} className="text-black">
                        {advice}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-black">N/A</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="col-span-3">
              <h4
                className="text-3xl text-black mb-4 pb-2 pl-4"
                style={{ fontFamily: "cursive" }}
              >
                Rx
              </h4>
              <div className="space-y-3 pl-15">
                {prescription.medicines.map((medicine, index) => (
                  <div key={index} className="border-b pb-3 last:border-b-0">
                    <div className="font-medium text-black">
                      {medicine.name}
                    </div>
                    <div className="flex justify-between text-sm">
                      <div className="flex gap-3 flex-wrap">
                        <span>{medicine.rules}</span>
                        {medicine.notes && (
                          <span className="break-words">{medicine.notes}</span>
                        )}
                      </div>
                      <span>{medicine.days}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vertical Divider - Extended to connect with footer */}
          <div
            className="absolute top-0 bottom-0 left-[40%] border-l-2 border-black"
            style={{ height: "calc(100% + 2px)" }}
          ></div>

          {/* Next Visit Section - Always show */}
          <div className="absolute bottom-[50px] left-[42%]">
            {prescription.next_visit_date ? (
              <>
                <p className="text-sm text-black">
                  * {daysUntilNextVisit} দিন পর আবার আসবেন।
                  <br />
                  (পরবর্তী সাক্ষাতের সময় ব্যবস্থাপত্র সঙ্গে আনবেন)
                </p>
              </>
            ) : (
              <p className="text-sm text-black">
                .... দিন পর আবার আসবেন ।
                <br />
                (পরবর্তী সাক্ষাতের সময় ব্যবস্থাপত্র সঙ্গে আনবেন)
              </p>
            )}
          </div>

          {/* Doctor's Signature */}
          <div className="absolute bottom-[50px] right-0 text-right">
            <div className="inline-block text-center">
              <div className="h-12 border-b border-black mb-2"></div>
              <p className="text-sm text-black">Doctor&apos;s Signature</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer: 3 Chamber Info */}
      <div className="pt-2 border-t-2 border-black mt-0">
        <div className="grid grid-cols-3 invisible gap-4 text-black">
          <div>
            <h4 className="font-semibold mb-1">
              {" "}
              এম.এস ফার্সি ডিজিটাল হেল্থ কেয়ার সেন্টার
            </h4>
            <div className="text-sm">
              <p>এন এ ফার্মেসী সংলগ্ন</p>
              <p>শালবাড়ি বাজার, বদরগঞ্জ, রংপুর</p>
              <p>
                রোগী দেখার সময় : প্রতি শনিবার,রবিবার,সোমবার,বুধবার ও বৃহস্পতিবার
                সকাল ৯:০০ টা হতে দুপুর ১২:০০ টা ও বিকাল ৪:০০ টা হতে রাত ১০:০০ টা
                পর্যন্ত
              </p>
              <p>মোবাইল: ০১৩১৮৯০৫৮৫৭</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-1">
              {" "}
              এম.এস ফার্সি ডিজিটাল হেল্থ কেয়ার সেন্টার
            </h4>
            <div className="text-sm">
              <p>এন এ ফার্মেসী সংলগ্ন</p>
              <p>শালবাড়ি বাজার, বদরগঞ্জ, রংপুর</p>
              <p>
                রোগী দেখার সময় : প্রতি শনিবার,রবিবার,সোমবার,বুধবার ও বৃহস্পতিবার
                সকাল ৯:০০ টা হতে দুপুর ১২:০০ টা ও বিকাল ৪:০০ টা হতে রাত ১০:০০ টা
                পর্যন্ত
              </p>
              <p>মোবাইল: ০১৩১৮৯০৫৮৫৭</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-1">
              {" "}
              এম.এস ফার্সি ডিজিটাল হেল্থ কেয়ার সেন্টার
            </h4>
            <div className="text-sm">
              <p>এন এ ফার্মেসী সংলগ্ন</p>
              <p>শালবাড়ি বাজার, বদরগঞ্জ, রংপুর</p>
              <p>
                রোগী দেখার সময় : প্রতি শনিবার,রবিবার,সোমবার,বুধবার ও বৃহস্পতিবার
                সকাল ৯:০০ টা হতে দুপুর ১২:০০ টা ও বিকাল ৪:০০ টা হতে রাত ১০:০০ টা
                পর্যন্ত
              </p>
              <p>মোবাইল: ০১৩১৮৯০৫৮৫৭</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
