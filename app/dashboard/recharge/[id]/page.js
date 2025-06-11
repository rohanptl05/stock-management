'use client'
import React, { useEffect, useState, useRef } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { fetchRechargeHistory, editRechargeHistory } from '@/app/api/actions/rechargeHistoryactions'
import { useSession } from 'next-auth/react'
import Modal from '@/components/Modal'
import Image from 'next/image'
import RechargeHistoryList from '@/components/RechargeHistoryList'
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const Page = () => {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });
  const reportRef = useRef(null);
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const id = params.id                   // e.g. "6428f3a9f1c9b2e3a0a1d123"
  const name = searchParams.get('name')  // e.g. "Airtel" or null
  const [isLoading, setIsLoading] = useState(false);
  const [RechargehistoryData, setRechargeHistoryData] = useState([])
  const [originalRechargehistoryData, setOriginalRechargehistoryData] = useState([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [ADDBalance, setADDBalance] = useState(null);
  const [selectedRechargeHistory, setSelectedRechargeHistory] = useState(null);
  const [IsEditHistoryModalOpen, setIsEditHistoryModalOpen] = useState(false);
  const [initialType, setInitialType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [totalAmountSort, setTotalAmountSort] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);


  useEffect(() => {

    fetchData();
  }, [id]);
  const fetchData = async () => {
    try {

      setIsLoading(true);
      const res = await fetchRechargeHistory(id, "active");
      if (res) {

        setRechargeHistoryData(res)

        setOriginalRechargehistoryData(res);

      }
    } catch (error) {
      console.error("data not Fetch ", error)
    } finally {
      setIsLoading(false);
    }
  }

  const handleEditRechageHistorySubmit = async (e) => {
    e.preventDefault();
    setIsEditHistoryModalOpen(false);
    setIsLoading(true);
    const res = await editRechargeHistory(selectedRechargeHistory._id, selectedRechargeHistory);
    if (res) {
      setRechargeHistoryData(res);
      fetchData();
      setIsLoading(false);
    }
  }












  const handleFilterChange = (e, type) => {
    const value = e.target.value;

    if (type === "status") setSelectedStatus(value);
    console.log("selectedStatus", value)
    if (type === "from") setFromDate(value);
    console.log("fromdate", fromDate)
    if (type === "to") setToDate(value);
    console.log("toDate", toDate)


  };
  useEffect(() => {
    if (!Array.isArray(originalRechargehistoryData)) return;

    let filteredRecharge = [...originalRechargehistoryData];

    // ✅ Status Filter
    if (selectedStatus === "addBalance") {
      filteredRecharge = filteredRecharge.filter(item => item.addBalance > 0);
    } else if (selectedStatus === "useBalance") {
      filteredRecharge = filteredRecharge.filter(item => item.useBalance > 0);
    }

    // ✅ Date Filter
    if (fromDate && toDate) {
      const from = new Date(`${fromDate}T00:00:00`);
      const to = new Date(`${toDate}T23:59:59`);
      filteredRecharge = filteredRecharge.filter(item => {
        const rechargeDate = new Date(item.date);
        return rechargeDate >= from && rechargeDate <= to;
      });
    }


    setRechargeHistoryData(filteredRecharge);
  }, [selectedStatus, fromDate, toDate, originalRechargehistoryData]);












  useEffect(() => {
    if (IsEditHistoryModalOpen && selectedRechargeHistory) {
      if (selectedRechargeHistory.addBalance > 0) {
        setInitialType("add");
      } else if (selectedRechargeHistory.useBalance > 0) {
        setInitialType("use");
      }
    }
  }, [IsEditHistoryModalOpen, selectedRechargeHistory]);














  const itemsPerPage = 8;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // const indexOfFirstItem = (currentPage - 1) * itemsPerPage;



  const paginatedRechargehistoryData = (Array.isArray(RechargehistoryData) ? RechargehistoryData : []).slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil((Array.isArray(RechargehistoryData) ? RechargehistoryData.length : 0) / itemsPerPage);

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
      <div className='h-full w-full "bg-amber-300'>
        {/* <header></header> */}
        <div className="w-full flex flex-wrap justify-between items-center gap-2 p-2">
          <h1 className=" px-4 py-2 rounded-2xl shadow-xl text-sm sm:text-base md:text-lg font-semibold whitespace-nowrap">
            {name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()} Recharge History
          </h1>
          {RechargehistoryData.length > 0 && (<button
            type="button"
            onClick={generatePDF}
            disabled={isGeneratingPDF}
            className={`text-white flex items-center bg-gradient-to-r from-red-400 via-red-500 to-red-600 
                hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 
                dark:focus:ring-red-800 shadow-lg dark:shadow-red-800/80 font-medium 
                rounded-lg text-xs sm:text-sm px-3 py-2 transition-all duration-200
                ${isGeneratingPDF ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            <i className="fa-solid fa-file-pdf mx-1"></i>
            {isGeneratingPDF ? "Generating..." : "PDF"}
          </button>

          )}

        </div>

        {/* filters */}
        <div className="mt-4 flex-wrap bg-amber-100 p-3 m-1 rounded-md shadow flex sm:justify-between px-4 items-center gap-5 sm:gap-4 text-xs sm:text-sm">


          {/* Status */}
          <div className="flex items-center gap-1 min-w-[120px] text-xs sm:text-sm">
            <label htmlFor="status" className="text-gray-700 whitespace-nowrap text-xs sm:text-sm">Status:</label>
            <select
              id="status"
              className="border rounded  px-1 items-center sm:px-2 py-1 h-7 w-full max-w-[100px] text-xs sm:text-sm text-center"
              onChange={(e) => handleFilterChange(e, "status")}
            >
              <option className="text-xs sm:text-sm " value="all">All</option>
              <option className="text-xs sm:text-sm  " value="addBalance">Add</option>
              <option className="text-xs sm:text-sm  " value="useBalance">Used</option>
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

        <div className=' sm:min-h-[70vh] h-[60vh] overflow-x-auto sm:overflow-hidden '>
          <table className="min-w-full divide-y divide-gray-200 border border-gray-300 shadow-sm rounded-lg  sm:text-sm text-[10px] overflow-x-auto  ">
            <thead className="bg-gray-100 border-b text-sm text-gray-700 uppercase tracking-wider">
              <tr>
                <th className="sm:px-4 sm:py-2 px-2 py-1 whitespace-nowrap">Index</th>
                <th className="sm:px-4 sm:py-2 px-2 py-1 whitespace-nowrap"> Add balance</th>
                <th className="sm:px-4 sm:py-2 px-2 py-1 whitespace-nowrap">Use balanace</th>
                <th className="sm:px-4 sm:py-2 px-2 py-1 whitespace-nowrap">Date</th>
                <th className="sm:px-4 sm:py-2 px-2 py-1 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className='text-center'>
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
              ) : paginatedRechargehistoryData.length > 0 ? (
                paginatedRechargehistoryData.map((rechargehistory, index) => (

                  <RechargeHistoryList
                    key={rechargehistory._id}
                    index={indexOfFirstItem + index}
                    rechargehistory={rechargehistory}
                    setIsEditHistoryModalOpen={setIsEditHistoryModalOpen}
                    setSelectedRechargeHistory={setSelectedRechargeHistory}
                    fetchData={fetchData}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 py-4 text-center text-gray-500">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

        </div>

        {/* pagination */}
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
      </div>





      {/* pdf contains */}

      <div ref={reportRef} className="bg-white min-w-[794px] min-h-[1123px] w-[994px] mx-auto p-6 text-center hidden">
       <div style={{ backgroundColor: 'white', margin: 'auto', textAlign: 'center', borderRadius: '1rem', border: '1px solid black', overflow: 'hidden' }}>
      <div>
        <h1 style={{ padding: '0.5rem 1rem', borderRadius: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', fontSize: '1.125rem', fontWeight: '600', whiteSpace: 'nowrap' }}>
          {name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()} Recharge History
        </h1>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.875rem', color: 'black', border: '1px solid black' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ fontWeight: '500' }}>Status:</span>
          <span>{selectedStatus || '—'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ fontWeight: '500' }}>Date From:</span>
          <span>{fromDate || '—'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span style={{ fontWeight: '500' }}>To:</span>
          <span>{toDate || '—'}</span>
        </div>
      </div>

      <div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.625rem', border: '1px solid #d1d5db' }}>
          <thead style={{ backgroundColor: '#f3f4f6', borderBottom: '1px solid #d1d5db', textTransform: 'uppercase', fontSize: '0.875rem', color: '#374151' }}>
            <tr>
              <th style={{ padding: '0.5rem', whiteSpace: 'nowrap' }}>Index</th>
              <th style={{ padding: '0.5rem', whiteSpace: 'nowrap' }}>Add Balance</th>
              <th style={{ padding: '0.5rem', whiteSpace: 'nowrap' }}>Use Balance</th>
              <th style={{ padding: '0.5rem', whiteSpace: 'nowrap' }}>Date</th>
             
            </tr>
          </thead>
          <tbody style={{ textAlign: 'center' }}>
            {isLoading ? (
              <tr>
                <td colSpan="18" style={{ padding: '1rem' }}>
                  <Image
                    width={24}
                    height={24}
                    src="/assets/infinite-spinner.svg"
                    alt="Loading..."
                  />
                </td>
              </tr>
            ) : RechargehistoryData.length > 0 ? (
              RechargehistoryData.map((rechargehistory, index) => (
                <tr key={rechargehistory._id}>
                  <td style={{ borderBottom: '1px solid #d1d5db', padding: '0.5rem', whiteSpace: 'nowrap', fontWeight: 'bold' }}>{index + 1}</td>
                  <td style={{ borderBottom: '1px solid #d1d5db', padding: '0.5rem', whiteSpace: 'nowrap' }}>{rechargehistory?.addBalance}</td>
                  <td style={{ borderBottom: '1px solid #d1d5db', padding: '0.5rem', whiteSpace: 'nowrap' }}>{rechargehistory?.useBalance}</td>
                  <td style={{ borderBottom: '1px solid #d1d5db', padding: '0.5rem', whiteSpace: 'nowrap' }}>
                    {rechargehistory?.date ? new Date(rechargehistory.date).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }) : '-'}
                  </td>
                  
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ padding: '1rem', color: '#6b7280' }}>No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
      </div>







      {/* Quantity edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="EDIT PRODUCT QUANTITY"
        className="max-h-[80vh] sm:max-h-[75vh] overflow-y-auto"
      >
        <div >
          <form className='p-3 '
          // onSubmit={EditQuehandleSubmit}
          >
            <div className="mb-4">
              <label htmlFor="newproductQuantity" className="block text-sm font-medium text-gray-700">Product Quantity</label>
              <input
                type="number"
                id="productQuantity"  // Ensure this matches the field name in the object
                // value={selectedProductQue?.productQuantity || ''}
                // onChange={EdithandleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                id="date"
                // value={
                //   selectedProductQue?.date
                //     ? new Date(selectedProductQue.date).toISOString().split('T')[0]
                //     : ''
                // }
                // onChange={EdithandleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />


            </div>



            <button type="submit" className="bg-green-500 text-white sm:px-4 sm:py-2 px-2 py-1 whitespace-nowrap rounded float-end">Update Product Que.</button>
          </form>
        </div>
        <button
          // onClick={() => setIsEditModalOpen(false)}
          className="mt-4 bg-red-500 text-white sm:px-4 sm:py-2 px-2 py-1 whitespace-nowrap rounded float-start"
        >
          Close
        </button>

      </Modal>


      {/* history eddit amount */}
      <Modal
        isOpen={IsEditHistoryModalOpen}
        onClose={() => setIsEditHistoryModalOpen(false)}
        title="EDIT Amount"
        className="max-h-[80vh] sm:max-h-[75vh] overflow-y-auto"
      >
        <div>
          <form className="p-3"
            onSubmit={handleEditRechageHistorySubmit}
          >
            {/* Conditionally render Add Balance input */}
            {initialType === "add" && (
              <div className="mb-4">
                <label htmlFor="addBalance" className="block text-sm font-medium text-gray-700">
                  Add Balance
                </label>
                <input
                  type="number"
                  name="addBalance"
                  id="addBalance"
                  value={selectedRechargeHistory?.addBalance ?? ""}
                  onChange={(e) =>
                    setSelectedRechargeHistory({
                      ...selectedRechargeHistory,
                      addBalance: Number(e.target.value),
                    })
                  }
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
            )}

            {initialType === "use" && (
              <div className="mb-4">
                <label htmlFor="useBalance" className="block text-sm font-medium text-gray-700">
                  Use Balance
                </label>
                <input
                  type="number"
                  name="useBalance"
                  id="useBalance"
                  value={selectedRechargeHistory?.useBalance ?? ""}
                  onChange={(e) =>
                    setSelectedRechargeHistory({
                      ...selectedRechargeHistory,
                      useBalance: Number(e.target.value),
                    })
                  }
                  className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
            )}



            {/* Date input */}
            <div className="mb-4">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                id="date"
                value={
                  selectedRechargeHistory?.date
                    ? new Date(selectedRechargeHistory.date).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setSelectedRechargeHistory({
                    ...selectedRechargeHistory,
                    date: new Date(e.target.value).toISOString(),
                  })
                }
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={selectedRechargeHistory?.description}
                onChange={(e) => setSelectedRechargeHistory({ ...selectedRechargeHistory, description: e.target.value })}
                rows={4}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm sm:text-sm"
              ></textarea>
            </div>

            <button type="submit" className="bg-green-500 text-white sm:px-4 sm:py-2 px-2 py-1 whitespace-nowrap rounded float-end">
              Update Amount
            </button>
          </form>
        </div>

        <button
          onClick={() => setIsEditHistoryModalOpen(false)}
          className="mt-4 bg-red-500 text-white sm:px-4 sm:py-2 px-2 py-1 whitespace-nowrap rounded float-start"
        >
          Close
        </button>
      </Modal>

    </>
  )
}

export default Page
