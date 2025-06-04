"use client"
import React, { useState, useEffect, useRef } from 'react'
import Modal from '@/components/Modal'
import { ADDExpense, GETExpense, EditExpense } from '@/app/api/actions/extraexpenseactions'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import ExtraExpensesList from '@/components/ExtraExpensesList'
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Image from 'next/image'

const Page = () => {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });
  const userId = session?.user?.id;
  const [formData, setFormData] = useState({
    amount: "",
    date: "",
    type: "",
    description: "",
  });
  const reportRef = useRef(null);

  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [Exinvoices, setExInvoices] = useState([]);
  const [originalExinvoices, setOriginalExinvoices] = useState([]);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectExinvoice, setSelectExinvoice] = useState(null);
  const [editModalOpen, seteditModalOpen] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [monthlyTotalAmount, setMonthlyTotalAmount] = useState(0);
  const [totalAmountSort, setTotalAmountSort] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const getData = async () => {
    setIsLoading(true)
    const userId = session?.user?.id;
    if (userId) {
      setUser(userId);
      const response = await GETExpense(userId, "active");
      if (response) {
        setExInvoices(response);
        setOriginalExinvoices(response)


        const total = response.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
        setTotalAmount(total);

        // 📅 Filter & calculate current month amount
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const currentMonthTotal = response
          .filter((item) => {
            const itemDate = new Date(item.date);
            return (
              itemDate.getMonth() === currentMonth &&
              itemDate.getFullYear() === currentYear
            );
          })
          .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

        setMonthlyTotalAmount(currentMonthTotal);
        setIsLoading(false)
      } else {
        alert("Failed to fetch user data.");
      }
    } else {
      alert("User ID not found.");
    }
  };

  useEffect(() => {
    getData();
  }, [session]);




  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      formData.user = userId;
      if (formData.user) {



        const response = await ADDExpense(formData);
        if (!response) {
          alert("Failed to add expense.");
          return;
        }
        if (response.success) {
          alert("Expense added successfully.");
          getData();
        }

        setFormData({ amount: "", date: "", type: "", description: "" });
        setModalOpen(false);
      } else {
        alert("User ID not found.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleeditSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await EditExpense(selectExinvoice._id, selectExinvoice);
      if (!response) {
        alert("Failed to edit expense.");
        return;
      }
      if (response.success) {
        alert("Expense edited successfully.");
        getData();
      }
      // setSelectExinvoice({ amount: "", date: "", type: "", description: "" });
      seteditModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };


  const editopenModal = (exinvoice) => {
    setSelectExinvoice(exinvoice ? { ...exinvoice } : null);
    seteditModalOpen(true);

  }


  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const paginatedInvoices = (Array.isArray(Exinvoices) ? Exinvoices : []).slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil((Array.isArray(Exinvoices) ? Exinvoices.length : 0) / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleFilterChange = (e, type) => {
    const value = e.target.value;


    if (type === "totalAmount") setTotalAmountSort(value);
    if (type === "from") setFromDate(value);
    if (type === "to") setToDate(value);
    if (type === "search") setSearchTerm(value);
  };

  useEffect(() => {
    if (!originalExinvoices) return;

    let filteredExInvoices = [...originalExinvoices];



    // Date Filter — only if both are set
    if (fromDate && toDate) {
      const from = new Date(`${fromDate}T00:00:00`);
      const to = new Date(`${toDate}T23:59:59`);


      filteredExInvoices = filteredExInvoices.filter(invoice => {
        const invoiceDate = new Date(invoice.date);
        return invoiceDate >= from && invoiceDate <= to;
      });
    }


    // Sorting by Total Amount
    if (totalAmountSort === "Low") {
      filteredExInvoices.sort((a, b) => a.amount - b.amount);
    } else if (totalAmountSort === "High") {
      filteredExInvoices.sort((a, b) => b.amount - a.amount);
    }

    // Sorting by Due Amount


    // 🔍 Search Filter
    if (searchTerm.trim() !== "") {
      const lowerSearch = searchTerm.toLowerCase();
      filteredExInvoices = filteredExInvoices.filter(invoice =>
        invoice.expensetype?.toString().toLowerCase().includes(lowerSearch) ||
        invoice.description?.toLowerCase().includes(lowerSearch)
      );
    }

    setExInvoices(filteredExInvoices);
    const total = Exinvoices.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    setTotalAmount(total);
  }, [totalAmountSort, fromDate, toDate, searchTerm]);
  useEffect(() => {
    const total = Exinvoices.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    setTotalAmount(total);
  }, [Exinvoices])


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
      <div className='container  '>
        <div className='flex justify-between items-center mt-1  bg-amber-100 p-1 rounded-lg shadow-lg'>

          <div className='flex justify-between items-center m-1'>
            <h1 className='sm:text-2xl  font-bold'>Extra Expenses</h1>

          </div>
          <div className='flex justify-between items-center m-1'>
            {/* <h1 className='text-xl font-bold'>Total Amount: ₹0</h1> */}

            <button type="button" onClick={() => { setModalOpen(true) }} className="text-gray-900 m-1 bg-gradient-to-r from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 font-medium rounded-lg text-xs sm:text-sm sm:px-5 px-2.5 sm:py-2.5 py-1.5 text-center me-2 mb-2">+ ADD EXPENECES</button>
            <button type="button"
              onClick={generatePDF}
              disabled={isGeneratingPDF}
              className="text-white  bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-lg text-xs sm:text-sm sm:px-5 px-2.5 sm:py-2.5 py-1.5 text-center me-2 mb-2"><i className="fa-solid fa-file-pdf mx-1"></i>{isGeneratingPDF ? "Generating..." : "PDF"}</button>
          </div>
        </div>

        {/* <div className="mt-4 bg-amber-100 p-4 rounded-lg shadow-lg"> */}
        <div className="flex flex-col gap-2 mt-2 bg-amber-100 p-2 sm:flex-row sm:flex-wrap sm:justify-between sm:items-start text-xs sm:text-sm">
          {/* Search */}
          <div className=" sm:w-auto flex  sm:flex-row items-center gap-2">
            <label htmlFor="search" className=" font-medium text-gray-700 text-xs sm:text-sm">Search:</label>
            <input
              type="text"
              id="search"
              onChange={(e) => handleFilterChange(e, "search")}
              placeholder="Search"
              className="border rounded-lg px-3 py-2 w-full sm:w-60 text-xs sm:text-sm"
            />
          </div>

          {/* Date Filter */}
          <div className=" sm:w-auto flex  sm:flex-row items-center justify-between gap-2">
            <label htmlFor="from" className=" font-medium text-gray-700 text-xs sm:text-sm">From:</label>
            <input
              type="date"
              id="from"
              className="border rounded-lg px-3 py-2 sm:w-40 text-xs sm:text-sm "
              onChange={(e) => handleFilterChange(e, "from")}
            />
            <label htmlFor="to" className="font-medium text-gray-700 text-xs sm:text-sm">To:</label>
            <input
              type="date"
              id="to"
              className="border rounded-lg px-3 py-2  sm:w-40 text-xs sm:text-sm"
              disabled={!fromDate}
              onChange={(e) => handleFilterChange(e, "to")}
            />
          </div>

          {/* Total Amount Sort */}
          <div className=" sm:w-auto flex  sm:flex-row items-center gap-2 text-xs sm:text-sm">
            <label htmlFor="amount" className=" font-medium text-gray-700 text-xs sm:text-sm">Amount</label>
            <select
              id="amount"
              className="border rounded-lg px-3 py-2 w-[120px] sm:w-48 text-xs sm:text-sm"
              onChange={(e) => handleFilterChange(e, "totalAmount")}
            >
              <option className='text-xs sm:text-sm' value="">None</option>
              <option className='text-xs sm:text-sm' value="Low">Low to High</option>
              <option className='text-xs sm:text-sm' value="High">High to Low</option>
            </select>
          </div>
        </div>

        {/* </div> */}



        <div className="w-full mt-2 sm:min-h-[55vh] h-[45vh] shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-[600px] sm:w-full border-collapse  text-xs sm:text-sm">
            <thead className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 uppercase tracking-wider">
              <tr className='text-xs sm:text-sm text-center'>
                <th className="px-3 py-2 border-b whitespace-nowrap">Invoice #</th>
                <th className="px-3 py-2 border-b whitespace-nowrap">Date</th>
                <th className="px-3 py-2 border-b whitespace-nowrap">Type</th>
                <th className="px-3 py-2 border-b whitespace-nowrap">Description</th>
                <th className="px-3 py-2 border-b whitespace-nowrap">Amount</th>
                <th className="px-3 py-2 border-b whitespace-nowrap">Actions</th>
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
              ) : paginatedInvoices.length > 0 ? (
                paginatedInvoices.map((exinvoice, index) => (
                  <ExtraExpensesList
                    key={exinvoice._id}
                    exinvoice={exinvoice}
                    index={Exinvoices.length - ((currentPage - 1) * itemsPerPage + index) - 1}
                    updateExInvoice={editopenModal}
                    getData={getData}
                  />
                ))) : (
                <tr>
                  <td colSpan="8" className="px-4 py-4 text-center text-gray-500">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>



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
        {totalAmount > 0 && <div className='flex justify-between items-center mt-2 bg-blue-400 p-2 rounded-lg shadow-lg'>
          <div>Total Amount: ₹{totalAmount.toLocaleString()}</div>
          <div>This Month: ₹{monthlyTotalAmount.toLocaleString()}</div>
        </div>}


      </div>




      {selectExinvoice && selectExinvoice._id && (
        <Modal isOpen={editModalOpen} onClose={() => seteditModalOpen(false)} title="Edit Expense">
          <div className="max-w-lg mx-auto m-4 p-6 bg-white rounded-lg shadow-lg">
            <form onSubmit={handleeditSubmit} className="space-y-6">

              {/* Amount */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  id="amount"
                  placeholder="Edit Amount"
                  value={selectExinvoice.amount}
                  onChange={(e) =>
                    setSelectExinvoice((prev) => ({ ...prev, amount: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                />
              </div>

              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  value={
                    selectExinvoice?.date
                      ? new Date(selectExinvoice.date).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setSelectExinvoice((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                />
              </div>

              {/* Expense Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Expense Type
                </label>
                <input
                  type="text"
                  id="type"
                  placeholder="Edit Type"
                  value={selectExinvoice.expensetype}
                  onChange={(e) =>
                    setSelectExinvoice((prev) => ({ ...prev, expensetype: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  placeholder="Edit Description"
                  value={selectExinvoice.description}
                  onChange={(e) =>
                    setSelectExinvoice((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows="3"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-200 resize-none"
                ></textarea>
              </div>

              {/* Buttons */}
              <div className="flex justify-between pt-2">
                <button
                  type="reset"
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-md transition"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
                >
                  Update Expense
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}







      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Add Extra Expense">

        <div className="max-w-lg mx-auto m-2 p-1 rounded-lg shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount Input */}
            <div>
              <label className="block text-gray-700">Amount (₹)</label>
              <input
                type="number"
                // value={amount}
                name='amount'
                onChange={handleChange}
                required
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                placeholder="Enter amount"
              />
            </div>

            <div>

              <label className="block text-gray-700">Date</label>
              <input
                type="date"
                value={formData.date || new Date().toISOString().split("T")[0]}
                onChange={handleChange}
                name='date'
                required
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                placeholder="Enter amount"
              />


            </div>

            {/* Suggestions Dropdown */}
            <div>
              <label className="block text-gray-700">Expense Type</label>
              <input
                type="text"
                // value={type}
                name='type'
                onChange={handleChange}
                required
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                placeholder='Expense Type'
              />

            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-700">Description</label>
              <textarea
                // value={description}
                onChange={handleChange}
                name='description'
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                placeholder="Enter details (optional)"
                rows="3"
              ></textarea>
            </div>

            {/* Buttons */}
            <div className="flex justify-between">
              <button
                type="reset"
                // onClick={() => { setAmount(""); setDescription(""); setSuggestion(""); }}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition"
              >
                Reset
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                Add Expense
              </button>
            </div>
          </form>

        </div>



      </Modal>


      {/* pdf contains */}

      <div ref={reportRef} className="bg-white min-w-[794px] min-h-[1123px] w-[994px] mx-auto p-6 text-center hidden">
        {/* pdg contains */}
        {Exinvoices && Exinvoices.length > 0 ? (
          <div className="w-full overflow-x-auto mt-2 shadow-md rounded-lg">
            <h1 className='bg-blue font-extrabold text-2xl m-4'>Extra-Expenses-Report</h1>
            <table className="w-full border min-w-[600px] text-center">
              <thead className=" text-black uppercase text-sm tracking-wider border bg-white border-black">
                <tr>
                  <th className="px-3 py-2 text-xs sm:text-sm border-b border-black">Invoice #</th>
                  <th className="px-3 py-2 text-xs sm:text-sm border-b border-black">Date</th>
                  <th className="px-3 py-2 text-xs sm:text-sm border-b border-black">Type</th>
                  <th className="px-3 py-2 text-xs sm:text-sm border-b border-black">Description</th>
                  <th className="px-3 py-2 text-xs sm:text-sm border-b border-black">Amount</th>
                </tr>
              </thead>
              <tbody>
                {Exinvoices.map((exinvoice, index) => (
                  <tr key={index} className="border-b border-black">
                    <td className="px-3 py-2 text-xs sm:text-sm font-medium text-black">
                      {index + 1}
                    </td>
                    <td className="px-3 py-2 text-xs sm:text-sm font-medium text-black">
                      {exinvoice.date
                        ? new Date(exinvoice.date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                        : "N/A"}
                    </td>
                    <td className="px-3 py-2 text-xs sm:text-sm font-medium text-black">
                      {exinvoice.expensetype}
                    </td>
                    <td className="px-3 py-2 text-xs sm:text-sm font-medium text-black" title={exinvoice.description}>
                      {exinvoice.description.length > 100
                        ? `${exinvoice.description.slice(0, 25)}...`
                        : exinvoice.description}
                    </td>
                    <td className="px-3 py-2 text-xs sm:text-sm font-medium text-black">
                      ₹ {exinvoice.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          ""
        )}
      </div>


    </>
  )
}

export default Page