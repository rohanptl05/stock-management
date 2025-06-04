"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { InvoiceDetails } from "@/app/api/actions/invoiceactions"
import { fetchuser } from '@/app/api/actions/useractions';
import { useSession } from 'next-auth/react';

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import InvoiceDetailsPage from '@/components/InvoiceDetails';


const Page = () => {
  const { data: session } = useSession({
  required: true,
  onUnauthenticated() {
    router.push('/login');
  },
});
  const params = useParams();
  const id = params.invoiceid;
  const [invoice, setInvoice] = useState([])
  const [user, setUser] = useState([])
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


    const ress = await fetchuser(session?.user?.email);
    setUser(ress || {});

    setIsLoading(false);
  };


  const generatePDF = async () => {
    if (!reportRef.current) return;
    setIsGeneratingPDF(true);
    const input = reportRef.current;

    try {
      // 1) Make sure the element is visible and positioned statically for html2canvas
      input.style.display = 'block';
      input.style.position = 'static';

      // 2) Give the browser a tiny moment to reflow/layout
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 3) Capture a high-res canvas of the entire element
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

      // 4) Create a fresh jsPDF with A4 (portrait, mm)
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidthMm = pdf.internal.pageSize.getWidth();   // 210 mm
      const pdfHeightMm = pdf.internal.pageSize.getHeight(); // 297 mm

      // 5) Define top & bottom margins (in mm)
      const topMarginMm = 10;
      const bottomMarginMm = 10;
      // “usable” vertical space on each PDF page (in mm)
      const usableHeightMm = pdfHeightMm - topMarginMm - bottomMarginMm;

      // 6) Helper: px ↔ mm conversion
      const pxToMm = (px) => px * 0.264583;
      const mmToPx = (mm) => mm / 0.264583;

      // 7) Figure out how many canvas‐pixels fit into usableHeightMm after scaling
      // First, find the scale factor that maps canvas‐width → full PDF width
      const imgWidthMm = pxToMm(imgWidthPx);
      const scaleFactor = pdfWidthMm / imgWidthMm;
      // Now, “usable page height” in PDF mm maps back to canvas pixels as:
      //   pageHeightPx = (usableHeightMm / scaleFactor) * (1 / pxToMm)
      //            = usableHeightMm / scaleFactor / 0.264583
      const pageHeightPx = (usableHeightMm / scaleFactor) / 0.264583;

      // 8) Loop through the canvas, slicing off pageHeightPx each time
      let yOffsetPx = 0;
      let pageIndex = 0;

      while (yOffsetPx < imgHeightPx) {
        // 8a) Compute how many pixels to slice on this page
        const sliceHeightPx = Math.min(pageHeightPx, imgHeightPx - yOffsetPx);

        // 8b) Create an off-screen canvas just tall enough for this slice
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = imgWidthPx;
        sliceCanvas.height = Math.floor(sliceHeightPx);
        const ctx = sliceCanvas.getContext('2d');

        // 8c) Draw that slice from the original
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

        // 8d) Convert the slice to a PNG data URL
        const sliceData = sliceCanvas.toDataURL('image/png');

        // 8e) Compute how tall this slice is in PDF‐mm:
        const sliceHeightMm = pxToMm(sliceHeightPx) * scaleFactor;

        // 8f) On the first page, we already have a blank A4; on subsequent, addPage()
        if (pageIndex > 0) pdf.addPage();

        // 8g) Place the slice at (x=0, y=topMarginMm), scaled to full PDF width
        pdf.addImage(
          sliceData,
          'PNG',
          0,
          topMarginMm,
          pdfWidthMm,
          sliceHeightMm
        );

        yOffsetPx += sliceHeightPx;
        pageIndex++;
      }

      // 9) After slicing all pages, put a timestamp on the last one (bottom-right)
      const timestamp = new Date().toLocaleString();
      pdf.setFontSize(8);
      const textWidth = pdf.getTextWidth(timestamp);
      pdf.text(
        timestamp,
        pdfWidthMm - textWidth - 10,
        pdfHeightMm - 10
      );

      // 10) Save/download
      pdf.save('invoice-report.pdf');
    } catch (error) {
      console.error('PDF generation error:', error);
    } finally {
      // 11) Hide the element again
      input.style.display = 'none';
      input.style.position = 'absolute';
      setIsGeneratingPDF(false);
    }
  };




  return (
    <>
      <div className="container mx-auto px-4 mb-4">
        <div className="flex justify-end">

          <button type="button"
            onClick={generatePDF}
            disabled={isGeneratingPDF}

            className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"><i className="fa-solid fa-file-pdf mx-1"></i>{isGeneratingPDF ? "Generating..." : "PDF"}</button>
        </div>

        <InvoiceDetailsPage
          isLoading={isLoading}
          invoice={invoice}
          user={user}
          reportRef={reportRef}
        />

      </div>



    </>
  );
};

export default Page;
