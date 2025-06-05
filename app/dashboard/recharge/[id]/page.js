'use client'
import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { fetchRechargeHistory, editRechargeHistory } from '@/app/api/actions/rechargeHistoryactions'
import { useSession } from 'next-auth/react'
import Modal from '@/components/Modal'
import Image from 'next/image'
import RechargeHistoryList from '@/components/RechargeHistoryList'

const Page = () => {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const id = params.id                   // e.g. "6428f3a9f1c9b2e3a0a1d123"
  const name = searchParams.get('name')  // e.g. "Airtel" or null
  const [isLoading, setIsLoading] = useState(false);
  const [RechargehistoryData, setRechargeHistoryData] = useState([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [ADDBalance, setADDBalance] = useState(null);
  const [selectedRechargeHistory, setSelectedRechargeHistory] = useState(null);
  const [IsEditHistoryModalOpen, setIsEditHistoryModalOpen] = useState(false);
  const [initialType, setInitialType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);


  useEffect(() => {

    fetchData();
  }, [id]);
  const fetchData = async () => {
    try {

      setIsLoading(true);
      const res = await fetchRechargeHistory(id, "active");
      if (res) {

        setRechargeHistoryData(res)
        // console.log("object", res)

        setIsLoading(false);
      }
    } catch (error) {
      console.error("data not Fetch ", error)
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

  return (
    <>
      <div className='h-full w-full'>
        {/* <header></header> */}
        <div className='w-full m-2 text-center '>
          <h1 className='bg-amber-300 p-2 rounded-2xl shadow-2xl shadow-amber-300 whitespace-nowrap'>{name} Recharge Historys</h1>
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
