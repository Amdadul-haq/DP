'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface UsePrescriptionPDFReturn {
  downloadPDF: (fileName?: string) => Promise<void>;
  printPDF: () => Promise<void>;
  downloading: boolean;
  printing: boolean;
}

/**
 * Reusable hook for handling PDF download and print operations
 * @param prescriptionId - The prescription ID to fetch PDF for
 * @returns Object containing download/print functions and loading states
 */
export function usePrescriptionPDF(prescriptionId: string | number): UsePrescriptionPDFReturn {
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);

  /**
   * Shared fetch logic to reduce code duplication
   * Handles token retrieval and API call
   */
  const fetchPDF = async (): Promise<Blob> => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }

    const response = await fetch(`/api/prescriptions/${prescriptionId}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to fetch PDF');
    }

    return await response.blob();
  };

  /**
   * Download PDF file to user's device
   * @param fileName - Optional custom filename (default: prescription_${id}.pdf)
   */
  const downloadPDF = async (fileName?: string): Promise<void> => {
    setDownloading(true);
    const toastId = toast.loading('Generating PDF...', {
      description: 'Preparing your prescription for download',
    });

    try {
      const blob = await fetchPDF();
      const url = window.URL.createObjectURL(blob);

      // Create temporary anchor element and trigger download
      const anchor = document.createElement('a');
      anchor.style.display = 'none';
      anchor.href = url;
      anchor.download = fileName || `prescription_${prescriptionId}.pdf`;

      document.body.appendChild(anchor);
      anchor.click();

      // Cleanup
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(url);

      toast.success('PDF downloaded successfully', {
        id: toastId,
        description: 'Your prescription has been downloaded',
      });
    } catch (error) {
      console.error('PDF download error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Please try again later';
      toast.error('Failed to download PDF', {
        id: toastId,
        description: errorMessage,
      });
    } finally {
      setDownloading(false);
    }
  };

  /**
   * Open PDF in new tab for printing
   * User can then use browser's print function (Ctrl+P or Cmd+P)
   */
  const printPDF = async (): Promise<void> => {
    setPrinting(true);
    const toastId = toast.loading('Preparing for printing...', {
      description: 'Loading prescription document',
    });

    try {
      const blob = await fetchPDF();
      const url = window.URL.createObjectURL(blob);

      // Open in new tab
      const printWindow = window.open(url, '_blank');

      if (printWindow) {
        /**
         * Wait for PDF to load in the new window before showing success message
         * This ensures the document is ready when user opens print dialog
         */
        printWindow.onload = function () {
          setPrinting(false);
          toast.success('PDF ready for printing', {
            id: toastId,
            description: 'Use Ctrl+P (or Cmd+P) to print',
          });

          // Bring window to focus after a short delay
          setTimeout(() => {
            printWindow.focus();
          }, 1000);
        };
      } else {
        // Popup was blocked by browser
        toast.error('Popup blocked', {
          id: toastId,
          description: 'Please allow popups for this site',
        });
        setPrinting(false);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('PDF print error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      toast.error('Failed to prepare for printing', {
        id: toastId,
        description: errorMessage,
      });
      setPrinting(false);
    }
  };

  return {
    downloadPDF,
    printPDF,
    downloading,
    printing,
  };
}
