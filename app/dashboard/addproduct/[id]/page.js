'use client'
import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { fetchProductsHistory, updateProductHistory } from '@/app/api/actions/productHistoryactions'
import { useSession } from 'next-auth/react'
import ProductHistoryList from '@/components/ProductHistoryList'
import Modal from '@/components/Modal'
import Image from 'next/image'

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
  const name = searchParams.get('name')
  const [isLoading, setIsLoading] = useState(false);
  const [historyData, setHistoryData] = useState([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProductQue, setSelectedProductQue] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetchProductsHistory(id, "active");
      if (res) {
        setHistoryData(res)
        setIsLoading(false);
      }
    } catch (error) {
      console.error("data not Fetch ", error)
    }
  }

  const EdithandleChange = (e) => {
    const { id, value } = e.target;
    setSelectedProductQue((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const EditQuehandleSubmit = async (e) => {
    e.preventDefault();
    console.log("Updated Quantity:", selectedProductQue);
    const res = await updateProductHistory(selectedProductQue)
    if (res.status === 200) {
      alert("update data")
      setIsEditModalOpen(false)
      fetchData();
    }
  };

  // ───── Pagination logic ─────
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedhistoryData = Array.isArray(historyData)
    ? historyData.slice(indexOfFirstItem, indexOfLastItem)
    : [];
  const totalPages = Math.ceil((Array.isArray(historyData) ? historyData.length : 0) / itemsPerPage);

  return (
    <>
      <div className='w-full  '>
        <div className='w-full m-2 text-center'>
          <h1 className='bg-amber-300 p-2 rounded-2xl shadow-2xl shadow-amber-300 whitespace-normal sm:whitespace-nowrap'>
             {name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()} - Activity History
          </h1>
 
        </div>

        <div className=' sm:min-h-[70vh] h-[60vh] '>
          <table className="min-w-full divide-y  divide-gray-200 border border-gray-300 shadow-sm rounded-lg overflow-hidden text-xs sm:text-sm">
            <thead className="bg-gray-100 border-b text-sm text-gray-700 uppercase tracking-wider whitespace-nowrap">
              <tr>
                <th className="sm:px-4 sm:py-2 px-1 py-1">S. No.</th>
                <th className="sm:px-4 sm:py-2 px-1 py-1">Quantity</th>
                <th className="sm:px-4 sm:py-2 px-1 py-1">Date</th>
                <th className="sm:px-4 sm:py-2 px-1 py-1">Actions</th>
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
              ) : paginatedhistoryData.length > 0 ? (
                paginatedhistoryData.map((product, index) => {
                  // Compute a continuous serial number:
                  const serial = indexOfFirstItem + index + 1;

                  return (
                    <ProductHistoryList
                      key={product._id}
                      index={serial}                     // now this is 1,2,3,4... instead of 0,1,0,1
                      product={product}
                      setSelectedProductQue={setSelectedProductQue}
                      setIsEditModalOpen={setIsEditModalOpen}
                      fetchData={fetchData}
                    />
                  );
                })
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

        {/* pagination buttons */}
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
              className={`px-3 py-1 rounded ${currentPage === pageNum + 1
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
                }`}
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

      {/* EDIT PRODUCT QUANTITY Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="EDIT PRODUCT QUANTITY"
        className="max-h-[80vh] sm:max-h-[75vh] overflow-y-auto"
      >
        <div>
          <form className='p-3' onSubmit={EditQuehandleSubmit}>
            <div className="mb-4">
              <label htmlFor="newproductQuantity" className="block text-sm font-medium text-gray-700">
                Product Quantity
              </label>
              <input
                type="number"
                id="productQuantity"
                value={selectedProductQue?.productQuantity || ''}
                onChange={EdithandleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                id="date"
                value={
                  selectedProductQue?.date
                    ? new Date(selectedProductQue.date).toISOString().split('T')[0]
                    : ''
                }
                onChange={EdithandleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <button type="submit" className="bg-green-500 text-white sm:px-4 sm:py-2 px-2 py-1 rounded float-end">
              Update Product Qty
            </button>
          </form>
        </div>
        <button
          onClick={() => setIsEditModalOpen(false)}
          className="mt-4 bg-red-500 text-white sm:px-4 sm:py-2 px-2 py-1 rounded float-start"
        >
          Close
        </button>
      </Modal>
    </>
  )
}

export default Page
