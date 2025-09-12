// // utils/prescription-template.ts
// interface Medicine {
//   name: string;
//   rules: string;
//   days: string;
//   notes?: string;
// }

// interface PrescriptionData {
//   id: number;
//   patient_id: number;
//   diagnosis: string;
//   history: string;
//   cc: string;
//   bp: string;
//   pulse: string;
//   weight: string;
//   temperature: string;
//   tests: string;
//   advice: string;
//   next_visit_date: string;
//   created_at: string;
//   patient_name: string;
//   patient_age: number;
//   patient_gender: string;
//   patient_mobile: string;
//   medicines: Medicine[];
// }

// export function generatePrescriptionHTML(prescription: PrescriptionData): string {
//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString("en-BD", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const splitValues = (value: string) => {
//     if (!value) return [];
//     return value
//       .split(",")
//       .map((item) => item.trim())
//       .filter(Boolean);
//   };

//   // Calculate days until next visit
//   const calculateDaysUntilNextVisit = () => {
//     if (!prescription.next_visit_date) return null;

//     const nextVisitDate = new Date(prescription.next_visit_date);
//     const today = new Date();
//     const diffTime = nextVisitDate.getTime() - today.getTime();
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

//     return diffDays;
//   };

//   const nextVisitDate = prescription.next_visit_date
//     ? new Date(prescription.next_visit_date).toLocaleDateString("en-BD", {
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//       })
//     : "";

//   const daysUntilNextVisit = calculateDaysUntilNextVisit();

//   // Helper function to generate list items
//   const generateListItems = (items: string[]) => {
//     if (items.length === 0) return '<p class="text-black">N/A</p>';
//     return `
//       <ul class="list-disc list-inside space-y-1">
//         ${items.map(item => `<li class="text-black">${item}</li>`).join('')}
//       </ul>
//     `;
//   };

//   // Helper function to generate medicine items
//   const generateMedicineItems = () => {
//     return prescription.medicines.map((medicine, index) => `
//       <div class="border-b pb-3 ${index === prescription.medicines.length - 1 ? 'last:border-b-0' : ''}">
//         <div class="font-medium text-black">${medicine.name}</div>
//         <div class="flex justify-between text-sm">
//           <div class="flex gap-3 flex-wrap">
//             <span>${medicine.rules}</span>
//             ${medicine.notes ? `<span class="break-words">${medicine.notes}</span>` : ''}
//           </div>
//           <span>${medicine.days}</span>
//         </div>
//       </div>
//     `).join('');
//   };

// return `
//     <!DOCTYPE html>
//     <html>
//       <head>
//         <meta charset="utf-8">
//         <title>Prescription - ${prescription.patient_name}</title>
//         <script src="https://cdn.tailwindcss.com"></script>
//         <style>
//           @media print {
//             .print\\:shadow-none {
//               box-shadow: none !important;
//             }
//             .print\\:border-0 {
//               border-width: 0 !important;
//             }
//             body {
//               margin: 0;
//               padding: 0;
//             }
//           }
//           body {
//             font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
//             margin: 0;
//             padding: 0;
//             background: white;
//             color: #000;
//             line-height: 1.3;
//             font-size: 14px;
//           }
//           .bg-white {
//             background-color: #fff;
//           }
//           .p-4 {
//             padding: 12px;
//           }
//           .rounded-lg {
//             border-radius: 6px;
//           }
//           .shadow-lg {
//             box-shadow: 0 5px 10px -3px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.05);
//           }
//           .flex {
//             display: flex;
//           }
//           .flex-col {
//             flex-direction: column;
//           }
//           .justify-between {
//             justify-content: space-between;
//           }
//           .items-center {
//             align-items: center;
//           }
//           .mb-4 {
//             margin-bottom: 16px;
//           }
//           .text-lg {
//             font-size: 16px;
//           }
//           .font-semibold {
//             font-weight: 600;
//           }
//           .text-black {
//             color: #000;
//           }
//           .text-sm {
//             font-size: 12px;
//           }
//           .text-xs {
//             font-size: 11px;
//           }
//           .text-right {
//             text-align: right;
//           }
//           .grid {
//             display: grid;
//           }
//           .grid-cols-4 {
//             grid-template-columns: repeat(4, 1fr);
//           }
//           .grid-cols-5 {
//             grid-template-columns: repeat(5, 1fr);
//           }
//           .grid-cols-3 {
//             grid-template-columns: repeat(3, 1fr);
//           }
//           .gap-2 {
//             gap: 6px;
//           }
//           .gap-4 {
//             gap: 12px;
//           }
//           .gap-6 {
//             gap: 16px;
//           }
//           .border-t-2 {
//             border-top-width: 2px;
//           }
//           .border-b-2 {
//             border-bottom-width: 2px;
//           }
//           .border-black {
//             border-color: #000;
//           }
//           .bg-gray-100 {
//             background-color: #f3f4f6;
//           }
//           .p-2 {
//             padding: 6px;
//           }
//           .py-4 {
//             padding-top: 16px;
//             padding-bottom: 16px;
//           }
//           .relative {
//             position: relative;
//           }
//           .space-y-3 > * + * {
//             margin-top: 12px;
//           }
//           .space-y-2 > * + * {
//             margin-top: 8px;
//           }
//           .mb-2 {
//             margin-bottom: 6px;
//           }
//           .mb-1 {
//             margin-bottom: 4px;
//           }
//           .list-disc {
//             list-style-type: disc;
//           }
//           .list-inside {
//             list-style-position: inside;
//           }
//           .space-y-1 > * + * {
//             margin-top: 3px;
//           }
//           .text-2xl {
//             font-size: 24px;
//           }
//           .pb-2 {
//             padding-bottom: 6px;
//           }
//           .pl-4 {
//             padding-left: 12px;
//           }
//           .pl-12 {
//             padding-left: 48px;
//           }
//           .space-y-2 > * + * {
//             margin-top: 8px;
//           }
//           .border-b {
//             border-bottom-width: 1px;
//           }
//           .pb-2 {
//             padding-bottom: 8px;
//           }
//           .last\\:border-b-0:last-child {
//             border-bottom-width: 0;
//           }
//           .font-medium {
//             font-weight: 500;
//           }
//           .justify-between {
//             justify-content: space-between;
//           }
//           .flex-wrap {
//             flex-wrap: wrap;
//           }
//           .break-words {
//             overflow-wrap: break-word;
//           }
//           .absolute {
//             position: absolute;
//           }
//           .inline-block {
//             display: inline-block;
//           }
//           .text-center {
//             text-align: center;
//           }
//           .h-10 {
//             height: 40px;
//           }
//           .pt-1 {
//             padding-top: 4px;
//           }
//           .mt-0 {
//             margin-top: 0;
//           }
//           .cursive {
//             font-family: cursive;
//           }
//           .prescription-container {
//             height: 100vh;
//             max-height: 297mm;
//             display: flex;
//             flex-direction: column;
//           }
//           .content-area {
//             flex: 1;
//             overflow: hidden;
//             display: flex;
//             flex-direction: column;
//           }
//           .footer-area {
//             flex-shrink: 0;
//           }
//           .main-content {
//             flex: 1;
//             position: relative;
//           }
//           .signature-area {
//             display: flex;
//             justify-content: space-between;
//             align-items: flex-end;
//             margin-top: 10px;
//             padding: 0 10px;
//           }
//           .divider-full {
//             position: absolute;
//             top: 210px;
//             bottom: 168px;
//             left: 40%;
//             border-left: 2px solid #000;
//            // height: calc(100% + 2px); /* Extend to footer top border */
//           }
//         </style>
//       </head>
//       <body>
//         <div class="prescription-container bg-white p-4 rounded-lg shadow-lg print:shadow-none print:border-0 flex flex-col justify-between">
//         <div class="divider-full"></div> <!-- এখানেই রাখো -->
//           <div class="content-area">
        
//             <!-- Doctor Info (Static) -->
//             <div class="flex justify-between items-center mb-4">
//               <div>
//                 <h3 class="text-lg font-semibold text-black">ডাঃ মোঃ সালমান ফার্সি</h3>
//                 <p class="text-xs">সি.পি রংপুর কমিউনিটি প্যারামেডিক ইন্সটিটিটিউট</p>
//                 <p class="text-xs">বি. এন. এম সি (ঢাকা)</p>
//                 <p class="text-xs">জে.এ.এইচ.এস, গাজীপুর (পলিপাস)</p>
//                 <p class="text-xs">এফ.টি বদরগঞ্জ উপজেলা স্বাস্থ্য কমপ্লেক্স</p>
//                 <p class="text-xs">জেনারেল প্রাকটিশনার</p>
//                 <p class="text-xs mt-1">মোবাইল: ০১৩১৮৯০৫৮৫৭</p>
//               </div>
//               <div class="text-right">
//                 <h3 class="text-lg font-semibold text-black">Dr. Salman Farshi</h3>
//                 <p class="text-xs">C.P Rangpur Community Paramedic Institute</p>
//                 <p class="text-xs">B.N.M.C (Dhaka)</p>
//                 <p class="text-xs">J.A.H.S, Gazipur (Polypus)</p>
//                 <p class="text-xs">F.T Badarganj Upazila Health Complex</p>
//                 <p class="text-xs">General Practitioner</p>
//                 <p class="text-xs mt-1">Movile : 01318905857</p>
//               </div>
//             </div>

//             <!-- Patient Info -->
//             <div class="grid grid-cols-4 gap-2 border-t-2 border-b-2 border-black bg-gray-100 p-2">
//               <div class="text-black text-xs">
//                 <span class="font-semibold">ID:</span> ${prescription.patient_id}
//               </div>
//               <div class="text-black text-xs">
//                 <span class="font-semibold">Name:</span> ${prescription.patient_name}
//               </div>
//               <div class="text-black text-xs">
//                 <span class="font-semibold">Age/Sex:</span> ${prescription.patient_age}y / ${prescription.patient_gender}
//               </div>
//               <div class="text-black text-xs">
//                 <span class="font-semibold">Date:</span> ${formatDate(prescription.created_at)}
//               </div>
//             </div>

//             <!-- Main Content Area -->
//             <div class="main-content">
//               <div class="grid grid-cols-5 gap-4 py-4">
//                 <!-- Left Column -->
//                 <div class="col-span-2 space-y-3">
//                   <!-- Chief Complaints - Always show title -->
//                   <div>
//                     <h4 class="font-semibold text-black mb-1 text-sm">Chief Complaints (CC):</h4>
//                     ${prescription.cc ? generateListItems(splitValues(prescription.cc)) : '<p class="text-black text-xs">N/A</p>'}
//                   </div>

//                   <!-- Diagnosis - Always show title -->
//                   <div>
//                     <h4 class="font-semibold text-black mb-1 text-sm">Diagnosis:</h4>
//                     ${prescription.diagnosis ? generateListItems(splitValues(prescription.diagnosis)) : '<p class="text-black text-xs">N/A</p>'}
//                   </div>

//                   <!-- Tests Recommended - Always show title -->
//                   <div>
//                     <h4 class="font-semibold text-black mb-1 text-sm">Tests Recommended:</h4>
//                     ${prescription.tests ? generateListItems(splitValues(prescription.tests)) : '<p class="text-black text-xs">N/A</p>'}
//                   </div>

//                   <!-- Medical History - Always show title -->
//                   <div>
//                     <h4 class="font-semibold text-black mb-1 text-sm">Medical History:</h4>
//                     ${prescription.history ? generateListItems(splitValues(prescription.history)) : '<p class="text-black text-xs">N/A</p>'}
//                   </div>

//                   <!-- Advice - Always show title -->
//                   <div>
//                     <h4 class="font-semibold text-black mb-1 text-sm">Advice:</h4>
//                     ${prescription.advice ? generateListItems(splitValues(prescription.advice)) : '<p class="text-black text-xs">N/A</p>'}
//                   </div>
//                 </div>

//                 <!-- Right Column -->
//                 <div class="col-span-3">
//                   <h4 class="text-2xl text-black mb-2 pb-1 pl-4 cursive">Rx</h4>
//                   <div class="space-y-2 pl-12">
//                     ${generateMedicineItems()}
//                   </div>
//                 </div>
//               </div>

//             </div>

//             <!-- Signature and Next Visit Area - Positioned near footer -->
//             <div class="signature-area">
//               <!-- Next Visit Section - Always show -->
//               <div>
//                 ${prescription.next_visit_date ? `
//                   <p class="text-xs text-black">
//                     * ${daysUntilNextVisit} দিন পর আবার আসবেন।
//                     <br />
//                     (পরবর্তী সাক্ষাতের সময় ব্যবস্থাপত্র সঙ্গে আনবেন)
//                   </p>
//                 ` : `
//                   <p class="text-xs text-black">
//                     .... দিন পর আবার আসবেন ।
//                     <br />
//                     (পরবর্তী সাক্ষাতের সময় ব্যবস্থাপত্র সঙ্গে আনবেন)
//                   </p>
//                 `}
//               </div>

//               <!-- Doctor's Signature -->
//               <div class="text-right">
//                 <div class="inline-block text-center">
//                   <div class="h-10 border-b border-black mb-1"></div>
//                   <p class="text-xs text-black">Doctor's Signature</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <!-- Footer: 3 Chamber Info -->
//           <div class="footer-area pt-1 border-t-2 border-black mt-2">
//             <div class="grid grid-cols-3 gap-3 text-black">
//               <div>
//                 <h4 class="font-semibold mb-1 text-xs">এম.এস ফার্সি ডিজিটাল হেল্থ কেয়ার সেন্টার</h4>
//                 <div class="text-xs">
//                   <p>এন এ फার্মেসী সংলগ্ন</p>
//                   <p>শালবাড়ি বাজার, বদরগঞ্জ, রংপুর</p>
//                   <p>রোগী দেখার সময় : প্রতি শনিবার,রবিবার,সোমবার,বুধবার ও বৃহস্পতিবার সকাল ৯:০০ টা হতে দুপুর ১২:০০ টা ও বিকাল ৪:০০ টা হতে রাত ১০:০০ টা পর্যন্ত</p>
//                   <p>মোবাইল: ০১৩১৮৯০৫৮৫৭</p>
//                 </div>
//               </div>
              
//               <div>
//                 <h4 class="font-semibold mb-1 text-xs">এম.এস ফার্সি ডিজিটাল হেল্থ কেয়ার সেন্টার</h4>
//                 <div class="text-xs">
//                   <p>এন এ ফার্মেসী সংলগ্ন</p>
//                   <p>শালবাড়ি বাজার, বদরগঞ্জ, রংপুর</p>
//                   <p>রোগী দেখার সময় : প্রতি শনিবার,রবিবার,সোমবার,বুধবার ও বৃহস্পতিবার সকাল ৯:০০ টা হতে দুপুর ১২:০০ টা ও বিকাল ৪:০০ টা হতে রাত ১০:০০ টা পর্যন্ত</p>
//                   <p>মোবাইল: ০১৩১৮৯০৫৮৫৭</p>
//                 </div>
//               </div>
              
//               <div>
//                 <h4 class="font-semibold mb-1 text-xs">এম.এস ফার্সি ডিজিটাল হেল্থ কেয়ার সেন্টার</h4>
//                 <div class="text-xs">
//                   <p>এন এ ফার্মেসী সংলগ্ন</p>
//                   <p>শালবাড়ি বাজার, বদরগঞ্জ, রংপুর</p>
//                   <p>রোগী দেখার সময় : প্রতি শনিবার,রবিবার,সোমবার,বুধবার ও বৃহস্পতিবার সকাল ৯:০০ টা হতে দুপুর ১২:০০ টা ও বিকাল ৪:০০ টা হতে রাত ১০:০০ টা পর্যন্ত</p>
//                   <p>মোবাইল: ০১৩১৮৯০৫৮৫৭</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </body>
//     </html>
//   `;

// } 

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
  medicines: Medicine[];
}

export function generatePrescriptionHTML(prescription: PrescriptionData): string {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-BD", {
      timeZone: "Asia/Dhaka",
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
        timeZone: "Asia/Dhaka",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const daysUntilNextVisit = calculateDaysUntilNextVisit();

  // Helper function to generate list items
  const generateListItems = (items: string[]) => {
    if (items.length === 0) return '<p class="text-black">N/A</p>';
    return `
      <ul class="list-disc list-inside space-y-1">
        ${items.map(item => `<li class="text-black">${item}</li>`).join('')}
      </ul>
    `;
  };

  // Helper function to generate medicine items
  const generateMedicineItems = () => {
    return prescription.medicines.map((medicine, index) => `
      <div class="border-b pb-3 ${index === prescription.medicines.length - 1 ? 'last:border-b-0' : ''}">
        <div class="font-medium text-black">${medicine.name}</div>
        <div class="flex justify-between text-sm">
          <div class="flex gap-3 flex-wrap">
            <span>${medicine.rules}</span>
            ${medicine.notes ? `<span class="break-words">${medicine.notes}</span>` : ''}
          </div>
          <span>${medicine.days}</span>
        </div>
      </div>
    `).join('');
  };

return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Prescription - ${prescription.patient_name}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          @media print {
            .print\\:shadow-none {
              box-shadow: none !important;
            }
            .print\\:border-0 {
              border-width: 0 !important;
            }
            body {
              margin: 0;
              padding: 0;
            }
          }
          body {
            font-family: 'Noto Sans Bengali', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
            margin: 0;
            padding: 0;
            background: white;
            color: #000;
            line-height: 1.3;
            font-size: 14px;
          }
          .bengali-font {
            font-family: 'Noto Sans Bengali', sans-serif;
          }
          .bg-white {
            background-color: #fff;
          }
          .p-4 {
            padding: 12px;
          }
          .rounded-lg {
            border-radius: 6px;
          }
          .shadow-lg {
            box-shadow: 0 5px 10px -3px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.05);
          }
          .flex {
            display: flex;
          }
          .flex-col {
            flex-direction: column;
          }
          .justify-between {
            justify-content: space-between;
          }
          .items-center {
            align-items: center;
          }
          .mb-4 {
            margin-bottom: 16px;
          }
          .text-lg {
            font-size: 16px;
          }
          .font-semibold {
            font-weight: 600;
          }
          .text-black {
            color: #000;
          }
          .text-sm {
            font-size: 12px;
          }
          .text-xs {
            font-size: 11px;
          }
          .text-right {
            text-align: right;
          }
          .grid {
            display: grid;
          }
          .grid-cols-4 {
            grid-template-columns: repeat(4, 1fr);
          }
          .grid-cols-5 {
            grid-template-columns: repeat(5, 1fr);
          }
          .grid-cols-3 {
            grid-template-columns: repeat(3, 1fr);
          }
          .gap-2 {
            gap: 6px;
          }
          .gap-4 {
            gap: 12px;
          }
          .gap-6 {
            gap: 16px;
          }
          .border-t-2 {
            border-top-width: 2px;
          }
          .border-b-2 {
            border-bottom-width: 2px;
          }
          .border-black {
            border-color: #000;
          }
          .bg-gray-100 {
            background-color: #f3f4f6;
          }
          .p-2 {
            padding: 6px;
          }
          .py-4 {
            padding-top: 16px;
            padding-bottom: 16px;
          }
          .relative {
            position: relative;
          }
          .space-y-3 > * + * {
            margin-top: 12px;
          }
          .space-y-2 > * + * {
            margin-top: 8px;
          }
          .mb-2 {
            margin-bottom: 6px;
          }
          .mb-1 {
            margin-bottom: 4px;
          }
          .list-disc {
            list-style-type: disc;
          }
          .list-inside {
            list-style-position: inside;
          }
          .space-y-1 > * + * {
            margin-top: 3px;
          }
          .text-2xl {
            font-size: 24px;
          }
          .pb-2 {
            padding-bottom: 6px;
          }
          .pl-4 {
            padding-left: 12px;
          }
          .pl-12 {
            padding-left: 48px;
          }
          .space-y-2 > * + * {
            margin-top: 8px;
          }
          .border-b {
            border-bottom-width: 1px;
          }
          .pb-2 {
            padding-bottom: 8px;
          }
          .last\\:border-b-0:last-child {
            border-bottom-width: 0;
          }
          .font-medium {
            font-weight: 500;
          }
          .justify-between {
            justify-content: space-between;
          }
          .flex-wrap {
            flex-wrap: wrap;
          }
          .break-words {
            overflow-wrap: break-word;
          }
          .absolute {
            position: absolute;
          }
          .inline-block {
            display: inline-block;
          }
          .text-center {
            text-align: center;
          }
          .h-10 {
            height: 40px;
          }
          .pt-1 {
            padding-top: 4px;
          }
          .mt-0 {
            margin-top: 0;
          }
          .cursive {
            font-family: cursive, 'Noto Sans Bengali', sans-serif;
          }
          .prescription-container {
            height: 100vh;
            max-height: 297mm;
            display: flex;
            flex-direction: column;
          }
          .content-area {
            flex: 1;
            overflow: hidden;
            display: flex;
            flex-direction: column;
          }
          .footer-area {
            flex-shrink: 0;
          }
          .main-content {
            flex: 1;
            position: relative;
          }
          .signature-area {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 10px;
            padding: 0 10px;
          }
          .divider-full {
            position: absolute;
            top: 210px;
            bottom: 155px;
            left: 40%;
            border-left: 2px solid #000;
           // height: calc(100% + 2px); /* Extend to footer top border */
          }
        </style>
      </head>
      <body>
        <div class="prescription-container bg-white p-4 rounded-lg shadow-lg print:shadow-none print:border-0 flex flex-col justify-between">
        <div class="divider-full"></div> <!-- এখানেই রাখো -->
          <div class="content-area">
        
            <!-- Doctor Info (Static) -->
            <div class="flex justify-between items-center mb-4 bengali-font">
              <div>
                <h3 class="text-lg font-semibold text-black">ডাঃ মোঃ সালমান ফার্সি</h3>
                <p class="text-xs">সি.পি রংপুর কমিউনিটি প্যারামেডিক ইন্সটিটিটিউট</p>
                <p class="text-xs">বি. এন. এম সি (ঢাকা)</p>
                <p class="text-xs">জে.এ.এইচ.এস, গাজীপুর (পলিপাস)</p>
                <p class="text-xs">এফ.টি বদরগঞ্জ উপজেলা স্বাস্থ্য কমপ্লেক্স</p>
                <p class="text-xs">জেনারেল প্রাকটিশনার</p>
                <p class="text-xs mt-1">মোবাইল: ০১৩১৮৯০৫৮৫৭</p>
              </div>
              <div class="text-right">
                <h3 class="text-lg font-semibold text-black">Dr. Salman Farshi</h3>
                <p class="text-xs">C.P Rangpur Community Paramedic Institute</p>
                <p class="text-xs">B.N.M.C (Dhaka)</p>
                <p class="text-xs">J.A.H.S, Gazipur (Polypus)</p>
                <p class="text-xs">F.T Badarganj Upazila Health Complex</p>
                <p class="text-xs">General Practitioner</p>
                <p class="text-xs mt-1">Mobile : 01318905857</p>
              </div>
            </div>

            <!-- Patient Info -->
            <div class="grid grid-cols-4 gap-2 border-t-2 border-b-2 border-black bg-gray-100 p-2">
              <div class="text-black text-xs">
                <span class="font-semibold">ID:</span> ${prescription.patient_id}
              </div>
              <div class="text-black text-xs">
                <span class="font-semibold">Name:</span> ${prescription.patient_name}
              </div>
              <div class="text-black text-xs">
                <span class="font-semibold">Age/Sex:</span> ${prescription.patient_age}y / ${prescription.patient_gender}
              </div>
              <div class="text-black text-xs">
                <span class="font-semibold">Date:</span> ${formatDate(prescription.created_at)}
              </div>
            </div>

            <!-- Main Content Area -->
            <div class="main-content">
              <div class="grid grid-cols-5 gap-4 py-4">
                <!-- Left Column -->
                <div class="col-span-2 space-y-3">
                  <!-- Chief Complaints - Always show title -->
                  <div>
                    <h4 class="font-semibold text-black mb-1 text-sm">Chief Complaints (CC):</h4>
                    ${prescription.cc ? generateListItems(splitValues(prescription.cc)) : '<p class="text-black text-xs">N/A</p>'}
                  </div>

                  <!-- Diagnosis - Always show title -->
                  <div>
                    <h4 class="font-semibold text-black mb-1 text-sm">Diagnosis:</h4>
                    ${prescription.diagnosis ? generateListItems(splitValues(prescription.diagnosis)) : '<p class="text-black text-xs">N/A</p>'}
                  </div>

                  <!-- Tests Recommended - Always show title -->
                  <div>
                    <h4 class="font-semibold text-black mb-1 text-sm">Tests Recommended:</h4>
                    ${prescription.tests ? generateListItems(splitValues(prescription.tests)) : '<p class="text-black text-xs">N/A</p>'}
                  </div>

                  <!-- Medical History - Always show title -->
                  <div>
                    <h4 class="font-semibold text-black mb-1 text-sm">Medical History:</h4>
                    ${prescription.history ? generateListItems(splitValues(prescription.history)) : '<p class="text-black text-xs">N/A</p>'}
                  </div>

                  <!-- Advice - Always show title -->
                  <div>
                    <h4 class="font-semibold text-black mb-1 text-sm">Advice:</h4>
                    ${prescription.advice ? generateListItems(splitValues(prescription.advice)) : '<p class="text-black text-xs">N/A</p>'}
                  </div>
                </div>

                <!-- Right Column -->
                <div class="col-span-3">
                  <h4 class="text-2xl text-black mb-2 pb-1 pl-4 cursive">Rx</h4>
                  <div class="space-y-2 pl-12">
                    ${generateMedicineItems()}
                  </div>
                </div>
              </div>

            </div>

            <!-- Signature and Next Visit Area - Positioned near footer -->
            <div class="signature-area bengali-font">
              <!-- Next Visit Section - Always show -->
              <div>
                ${prescription.next_visit_date ? `
                  <p class="text-xs text-black">
                    * ${daysUntilNextVisit} দিন পর আবার আসবেন।
                    <br />
                    (পরবর্তী সাক্ষাতের সময় ব্যবস্থাপত্র সঙ্গে আনবেন)
                  </p>
                ` : `
                  <p class="text-xs text-black">
                    .... দিন পর আবার আসবেন ।
                    <br />
                    (পরবর্তী সাক্ষাতের সময় ব্যবস্থাপত্র সঙ্গে আনবেন)
                  </p>
                `}
              </div>

              <!-- Doctor's Signature -->
              <div class="text-right">
                <div class="inline-block text-center">
                  <div class="h-10 border-b border-black mb-1"></div>
                  <p class="text-xs text-black">Doctor's Signature</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer: 3 Chamber Info -->
          <div class="footer-area pt-1 border-t-2 border-black mt-2 bengali-font">
            <div class="grid grid-cols-3 gap-3 text-black">
              <div>
                <h4 class="font-semibold mb-1 text-xs">এম.এস ফার্সি ডিজিটাল হেল্থ কেয়ার সেন্টার</h4>
                <div class="text-xs">
                  <p>এন এ ফার্মেসী সংলগ্ন</p>
                  <p>শালবাড়ি বাজার, বদরগঞ্জ, রংপুর</p>
                  <p>রোগী দেখার সময় : প্রতি শনিবার,রবিবার,সোমবার,বুধবার ও বৃহস্পতিবার সকাল ৯:০০ টা হতে দুপুর ১২:০০ টা ও বিকাল ৪:০০ টা হতে রাত ১০:০০ টা পর্যন্ত</p>
                  <p>মোবাইল: ০১৩১৮৯০৫৮৫৭</p>
                </div>
              </div>
              
              <div>
                <h4 class="font-semibold mb-1 text-xs">এম.এস ফার্সি ডিজিটাল হেল্থ কেয়ার সেন্টার</h4>
                <div class="text-xs">
                  <p>এন এ ফার্মেসী সংলগ্ন</p>
                  <p>শালবাড়ি বাজার, বদরগঞ্জ, রংপুর</p>
                  <p>রোগী দেখার সময় : প্রতি শনিবার,রবিবার,সোমবার,বুধবার ও বৃহস্পতিবার সকাল ৯:০০ টা হতে দুপুর ১২:০০ টা ও বিকাল ৪:০০ টা হতে রাত ১০:০০ টা পর্যন্ত</p>
                  <p>মোবাইল: ০১৩১৮৯০৫৮৫৭</p>
                </div>
              </div>
              
              <div>
                <h4 class="font-semibold mb-1 text-xs">এম.এস ফার্সি ডিজিটাল হেল্থ কেয়ার সেন্টার</h4>
                <div class="text-xs">
                  <p>এন এ ফার্মেসী সংলগ্ন</p>
                  <p>শালবাড়ি বাজার, বদরগঞ্জ, রংপুর</p>
                  <p>রোগী দেখার সময় : প্রতি শনিবার,রবিবার,সোমবার,বুধবার ও বৃহস্পতিবার সকাল ৯:০০ টা হতে দুপুর ১২:০০ টা ও বিকাল ৪:০০ টা হতে রাত ১০:০০ টা পর্যন্ত</p>
                  <p>মোবাইল: ০১৩১৮৯০৫৮৫৭</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

} 