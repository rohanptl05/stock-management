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
  const { data: session } = useSession();
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
    // Show and reset styles
    input.style.display = 'block';
    input.style.position = 'static';

    // Allow layout to stabilize
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Capture high-res canvas
    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: -window.scrollY,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pdfWidth = pdf.internal.pageSize.getWidth();  // 210 mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297 mm

    // Convert canvas pixel dimensions to mm
    const pxToMm = (px) => px * 0.264583;
    const imgWidthMm = pxToMm(canvas.width);
    const imgHeightMm = pxToMm(canvas.height);

    const scaleFactor = pdfWidth / imgWidthMm;
    const scaledHeight = imgHeightMm * scaleFactor;

    // Split across pages if needed
    if (scaledHeight > pdfHeight) {
      const pageHeight = pdfHeight;
      let position = 0;
      let page = 0;

      while (position < scaledHeight) {
        const offsetY = -(position * (canvas.height / scaledHeight));

        pdf.addImage(
          imgData,
          'PNG',
          0,
          offsetY,
          pdfWidth,
          scaledHeight
        );

        position += pageHeight;
        page++;

        if (position < scaledHeight) {
          pdf.addPage();
        } else {
          // Add timestamp to the last page
          const timestamp = new Date().toLocaleString();
          pdf.setFontSize(8);
          const textWidth = pdf.getTextWidth(timestamp);
          pdf.text(timestamp, pdfWidth - textWidth - 10, pdfHeight - 10);
        }
      }
    } else {
      // Single-page case
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, scaledHeight);

      // Timestamp at bottom-right
      const timestamp = new Date().toLocaleString();
      pdf.setFontSize(8);
      const textWidth = pdf.getTextWidth(timestamp);
      pdf.text(timestamp, pdfWidth - textWidth - 10, pdfHeight - 10);
    }

    // Download the file
    pdf.save('invoice-report.pdf');

  } catch (error) {
    console.error("PDF generation error:", error);
  } finally {
    // Hide the component after generation
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
