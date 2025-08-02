"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { InvoiceDetails } from "@/app/api/actions/invoiceactions"

import { useSession } from 'next-auth/react';

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import InvoiceDetailsPage from '@/components/InvoiceDetails';


const Page = () => {
  const { data: session } = useSession({
  required: true,
  onUnauthenticated() {
    router.push('/');
  },
});
  const params = useParams();
  const id = params.invoiceid;
  const [invoice, setInvoice] = useState([])
 
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {

    if (id) {
      fetchData()
    }

  }, [id])

  const fetchData = async () => {
    setIsLoading(true);
    const res = await InvoiceDetails(id);
    setInvoice(res || {}); // Expecting a single invoice object


    
    setIsLoading(false);
  };

const generatePDF = async () => {
  if (!reportRef.current) return;
  setIsGeneratingPDF(true);
  const input = reportRef.current;

  // Save original styles for restoration
  const originalDisplay = input.style.display;
  const originalPosition = input.style.position;

  try {
    input.style.display = 'block';
    input.style.position = 'static';
    await new Promise((resolve) => setTimeout(resolve, 100));

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: -window.scrollY,
    });
    const imgWidthPx = canvas.width;
    const imgHeightPx = canvas.height;
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidthMm = pdf.internal.pageSize.getWidth();
    const pdfHeightMm = pdf.internal.pageSize.getHeight();

    const topMarginMm = 6;
    const bottomMarginMm = 6;
    const usableHeightMm = pdfHeightMm - topMarginMm - bottomMarginMm;
    const pxToMm = (px) => px * 0.264583;
    const imgWidthMm = pxToMm(imgWidthPx);
    const scaleFactor = pdfWidthMm / imgWidthMm;
    const pageHeightPx = (usableHeightMm / scaleFactor) / 0.264583;

    let yOffsetPx = 0;
    let pageIndex = 0;

    while (yOffsetPx < imgHeightPx) {
      const sliceHeightPx = Math.min(pageHeightPx, imgHeightPx - yOffsetPx);
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = imgWidthPx;
      sliceCanvas.height = Math.floor(sliceHeightPx);
      const ctx = sliceCanvas.getContext('2d');
      ctx.drawImage(
        canvas,
        0,
        Math.floor(yOffsetPx),
        imgWidthPx,
        Math.floor(sliceHeightPx),
        0,
        0,
        imgWidthPx,
        Math.floor(sliceHeightPx)
      );
      const sliceData = sliceCanvas.toDataURL('image/png');
      const sliceHeightMm = pxToMm(sliceHeightPx) * scaleFactor;

      if (pageIndex > 0) pdf.addPage();

      pdf.addImage(
        sliceData,
        'PNG',
        0,
        topMarginMm,
        pdfWidthMm,
        sliceHeightMm
      );

      // Optional: add timestamp on every page here, or below for only last
      yOffsetPx += sliceHeightPx;
      pageIndex++;
    }

    // Add timestamp to LAST PAGE ONLY:
    const timestamp = new Date().toLocaleString();
    pdf.setFontSize(6);
    const textWidth = pdf.getTextWidth(timestamp);
    pdf.text(
      timestamp,
      pdfWidthMm - textWidth - 10,
      pdfHeightMm - 10
    );

    pdf.save('invoice-report.pdf');
  } catch (error) {
    console.error('PDF generation error:', error);
    alert('There was an error generating the PDF.');
  } finally {
    // Restore styles to original
    input.style.display = originalDisplay;
    input.style.position = originalPosition;
    setIsGeneratingPDF(false);
  }
};





  return (
    <>
      <div className="container mx-auto ">
        <div className="flex justify-end">

          <button type="button"
            onClick={generatePDF}
            disabled={isGeneratingPDF}

            className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"><i className="fa-solid fa-file-pdf mx-1"></i>{isGeneratingPDF ? "Generating..." : "PDF"}</button>
        </div>

        <InvoiceDetailsPage
          isLoading={isLoading}
          invoice={invoice}
          
          reportRef={reportRef}
        />

      </div>



    </>
  );
};

export default Page;
