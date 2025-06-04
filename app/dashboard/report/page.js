"use client"
import React, { useEffect, useState, useRef } from 'react'
import { fetchInvoices } from '@/app/api/actions/invoiceactions';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ReportinvoiceItems from "@/components/ReportinvoiceItems"
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Image from 'next/image';


const Page = () => {
  const { data: session } = useSession({
  required: true,
  onUnauthenticated() {
    router.push('/login');
  },
});
  const router = useRouter();
  const reportRef = useRef(null);
  const [invoices, setInvoices] = useState([]);
  const [originalInvoices, setOriginalInvoices] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  // const [dueAmountSort, setDueAmountSort] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalAmountSort, setTotalAmountSort] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isLoading,setisLoading] =useState(false)

  useEffect(() => {

    if (session?.user?.id) {
      fetchData()
    }

  }, [session?.user?.id])
  const fetchData = async () => {
    setisLoading(true)
    const res = await fetchInvoices(session?.user?.id, "active");
    setInvoices(res)
    setOriginalInvoices(res)
    setisLoading(false)
  }

  const handleFilterChange = (e, type) => {
    const value = e.target.value;

    if (type === "status") setSelectedStatus(value);
    if (type === "totalAmount") setTotalAmountSort(value);
    // if (type === "dueAmount") setDueAmountSort(value);
    if (type === "from") setFromDate(value);
    if (type === "to") setToDate(value);
    if (type === "search") setSearchTerm(value);
  };

  useEffect(() => {
   if (!Array.isArray(originalInvoices)) return;

    let filteredInvoices = [...originalInvoices];

    // Status Filter
    if (selectedStatus !== "all") {
      filteredInvoices = filteredInvoices.filter(invoice => invoice.status === selectedStatus);
    };


    // Date Filter — only if both are set
    if (fromDate && toDate) {
      const from = new Date(`${fromDate}T00:00:00`);
      const to = new Date(`${toDate}T23:59:59`);

      filteredInvoices = filteredInvoices.filter(invoice => {
        const invoiceDate = new Date(invoice.date);
        return invoiceDate >= from && invoiceDate <= to;
      });
    }


    // Sorting by Total Amount
    if (totalAmountSort === "Low") {
      filteredInvoices.sort((a, b) => a.grandTotal - b.grandTotal);
    } else if (totalAmountSort === "High") {
      filteredInvoices.sort((a, b) => b.grandTotal - a.grandTotal);
    }

    // Sorting by Due Amount
    // if (dueAmountSort === "Low") {
    //   filteredInvoices.sort((a, b) => a.balance_due_amount - b.balance_due_amount);
    // } else if (dueAmountSort === "High") {
    //   filteredInvoices.sort((a, b) => b.balance_due_amount - a.balance_due_amount);
    // }

    // 🔍 Search Filter
    if (searchTerm.trim() !== "") {
      const lowerSearch = searchTerm.toLowerCase();
      filteredInvoices = filteredInvoices.filter(invoice =>
        invoice.invoiceNumber?.toString().toLowerCase().includes(lowerSearch) ||
        invoice.client?.toLowerCase().includes(lowerSearch) ||
        invoice.status?.toLowerCase().includes(lowerSearch)
      );
    }

    setInvoices(filteredInvoices);
  }, [originalInvoices, selectedStatus, totalAmountSort, fromDate, toDate, searchTerm]);



  const itemsPerPage = 10; // Set the number of items per page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const paginatedInvoices = (Array.isArray(invoices) ? invoices : []).slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil((Array.isArray(invoices) ? invoices.length : 0) / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };



  const generatePDF = async () => {
    if (!reportRef.current) return;

    setIsGeneratingPDF(true);
    const input = reportRef.current;

    try {
      // Make visible and reset position
      input.style.display = 'block';
      input.style.position = 'static';
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: -window.scrollY
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

      const imgProps = {
        width: canvas.width,
        height: canvas.height
      };

      const pxToMm = (px) => px * 0.264583;
      const imgWidthMm = pxToMm(imgProps.width);
      const imgHeightMm = pxToMm(imgProps.height);

      const scaleFactor = pdfWidth / imgWidthMm;
      const finalWidth = imgWidthMm * scaleFactor;
      const finalHeight = imgHeightMm * scaleFactor;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, finalHeight);

      // ➕ Add timestamp in bottom-right corner
      const timestamp = new Date().toLocaleString();
      pdf.setFontSize(8); // small font
      const margin = 10;
      const textWidth = pdf.getTextWidth(timestamp);
      pdf.text(timestamp, pdfWidth - textWidth - margin, pdfHeight - margin);

      pdf.save('invoice-report.pdf');
    } catch (error) {
      console.error("PDF generation error:", error);
    } finally {
      input.style.display = 'none';
      input.style.position = 'absolute';
      setIsGeneratingPDF(false);
    }
  };



  return (
    <>
      <div className="container w-full ">


        <div className="flex justify-between items-center mt-1 text-center bg-amber-100 p-2 sm:p-2 rounded-lg shadow-lg">
          <h1 className="sm:text-2xl text-xl font-bold w-full">Report</h1>

          <button type="button"
            onClick={generatePDF}
            disabled={isGeneratingPDF}

            className="text-white flex items-center  bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-lg sm:text-sm text-xs px-2 py-2.5 text-center me-2 mb-2"><i className="fa-solid fa-file-pdf mx-1 "></i>{isGeneratingPDF ? "Generating..." : "PDF"}</button>
        </div>
        <div >

          {/* filters */}
          <div className="mt-4 flex-wrap bg-amber-100 p-3 m-1 rounded-md shadow flex sm:justify-between px-4 items-center gap-5 sm:gap-4 text-xs sm:text-sm">
            {/* Search */}
            <div className="flex items-center gap-1 min-w-[130px]">
              <label htmlFor="search" className="text-gray-700 whitespace-nowrap">Search:</label>
              <input
                type="text"
                id="search"
                onChange={(e) => handleFilterChange(e, "search")}
                placeholder="Search"
                className="border rounded px-2 py-1 h-6 w-full max-w-[130px]"
              />
            </div>

            {/* Status */}
            <div className="flex items-center gap-1 min-w-[120px] text-xs sm:text-sm">
              <label htmlFor="status" className="text-gray-700 whitespace-nowrap text-xs sm:text-sm">Status:</label>
              <select
                id="status"
                className="border rounded  px-1 items-center sm:px-2 py-1 h-7 w-full max-w-[100px] text-xs sm:text-sm text-center"
                onChange={(e) => handleFilterChange(e, "status")}
              >
                <option className="text-xs sm:text-sm " value="all">All</option>
                <option className="text-xs sm:text-sm  " value="PAID">Paid</option>
                <option className="text-xs sm:text-sm  " value="PENDING">Pending</option>
              </select>
            </div>

            {/* Total Amount */}
            <div className="flex items-center gap-1 min-w-[150px] text-xs sm:text-sm">
              <label htmlFor="amount" className="text-gray-700 whitespace-nowrap text-xs sm:text-sm">Total:</label>
              <select
                id="amount"
                className="border rounded px-2 py-1 h-7 w-full max-w-[110px] text-xs sm:text-sm"
                onChange={(e) => handleFilterChange(e, "totalAmount")}
              >
                <option className="text-xs sm:text-sm " value="">None</option>
                <option className="text-xs sm:text-sm " value="Low">Low to High</option>
                <option className="text-xs sm:text-sm " value="High">High to Low</option>
              </select>
            </div>

         

            {/* From Date */}
            <div className="flex items-center gap-1 min-w-[150px]">
              <label htmlFor="from" className="text-gray-700 whitespace-nowrap text-xs sm:text-sm">From:</label>
              <input
                type="date"
                id="from"
                className="border rounded px-2 py-1 h-7 w-full max-w-[130px] text-xs sm:text-sm"
                onChange={(e) => handleFilterChange(e, "from")}
              />
            </div>

            {/* To Date */}
            <div className="flex items-center gap-1 min-w-[150px]">
              <label htmlFor="to" className="text-gray-700 whitespace-nowrap text-xs sm:text-sm">To:</label>
              <input
                type="date"
                id="to"
                disabled={!fromDate}
                className="border rounded px-2 py-1 h-7 w-full max-w-[130px] text-xs sm:text-sm"
                onChange={(e) => handleFilterChange(e, "to")}
              />
            </div>
          </div>




         

            <div className="overflow-x-auto  sm:w-full sm:overflow-visible sm:min-h-[68vh] h-[45vh]">
              <table className="w-[300px] sm:w-full text-xs sm:text-sm">

                <thead className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 uppercase text-sm ">
                  <tr>
                    <th className="px-4 py-2  border-b text-xs sm:text-sm">Invoice No. #</th>
                    <th className="px-4 py-2  border-b text-xs sm:text-sm">Client Name</th>
                    <th className="px-4 py-2  border-b text-xs sm:text-sm">Date</th>
                    <th className="px-4 py-2 border-b  text-xs sm:text-sm">Status</th>
                    <th className="px-4 py-2  border-b text-xs sm:text-sm">Total Amout</th>

                  </tr>
                </thead>
                <tbody>



                   {isLoading ? (
                               <tr>
                                 <td colSpan="18" className="px-4 py-4 text-center">
                                   <Image
                                     width={2000}
                                     height={2000}
                                     src="/assets/infinite-spinner.svg"
                                     alt="Loading..."
                                     className="w-6 h-6 mx-auto"
                                   />
                                 </td>
                               </tr>
                             ) : paginatedInvoices.length > 0 ? 
                           (paginatedInvoices.map((Reportinvoice, index) => (
                    <ReportinvoiceItems key={Reportinvoice._id} invoices={Reportinvoice} />

                 ) )):(
                    <tr>
                <td colSpan="8" className="px-4 py-4 text-center text-gray-500">
                  No products found.
                </td>
              </tr>
                  )
                }


                </tbody>
              </table>
            </div>

       
        </div>

        {/* button paginations */}
        <div className="flex justify-center items-center gap-2 mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, pageNum) => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum + 1)}
              className={`px-3 py-1 rounded ${currentPage === pageNum + 1 ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              {pageNum + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>



        {/* pdf contains */}

        <div ref={reportRef} className="bg-white min-w-[794px] min-h-[1123px] w-[994px] mx-auto p-6 text-center hidden">
          <div className="bg-white mx-auto text-center rounded-2xl border border-black overflow-hidden shadow-none">
            <h2 className="text-2xl font-bold mb-4 text-black">Invoice Report</h2>

            {/* Filter display */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 bg-white p-4 justify-between rounded-md mb-4 text-sm text-black border border-black">
              <div className="flex items-center space-x-1">
                <span className="font-medium">Search:</span>
                <span>{searchTerm || "—"}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-medium">Status:</span>
                <span>{selectedStatus || "—"}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-medium">Total:</span>
                <span>
                  {totalAmountSort === "Low"
                    ? "Low to High"
                    : totalAmountSort === "High"
                      ? "High to Low"
                      : "—"}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-medium">Date From:</span>
                <span>{fromDate || "—"}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-medium">To:</span>
                <span>{toDate || "—"}</span>
              </div>
            </div>

            {invoices && invoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-center text-sm table-auto border border-black">
                  <thead className="bg-white text-black uppercase border-b border-black">
                    <tr>
                      <th className="px-2 py-2 whitespace-nowrap border-r border-black">Invoice No. #</th>
                      <th className="px-2 py-2 whitespace-nowrap border-r border-black">Client Name</th>
                      <th className="px-2 py-2 whitespace-nowrap border-r border-black">Date</th>
                      <th className="px-2 py-2 whitespace-nowrap border-r border-black">Status</th>
                      <th className="px-2 py-2 whitespace-nowrap">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice, index) => (
                      <tr key={invoice?._id} className="bg-white text-black border-t border-black">
                        <td className="px-2 py-2 whitespace-nowrap border-r border-black">
                          {invoice?.invoiceNumber}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap border-r border-black">
                          {invoice?.client}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap border-r border-black">
                          {new Date(invoice?.date).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap border-r border-black">
                          <span className="text-xs font-semibold">{invoice?.status}</span>
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap">
                          {invoice?.grandTotal}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-black mt-4">No invoices available</p>
            )}
          </div>
        </div>



      </div>
    </>
  )
}

export default Page