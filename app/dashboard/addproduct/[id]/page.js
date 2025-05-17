'use client'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { fetchProductsHistory,updateProductHistory } from '@/app/api/actions/productHistoryactions'
import { useSession } from 'next-auth/react'
import ProductHistoryList from '@/app/components/ProductHistoryList'
import Modal from '@/app/components/Modal'

const Page = () => {
  const { data: session } = useSession();
  const params = useParams(); 
  const id = params.id;       
  const [isLoading, setIsLoading] = useState(false);
  const [historyData, setHistoryData] = useState([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProductQue, setSelectedProductQue] = useState(null);

  useEffect(() => {

    fetchData();
  }, [id]);
  const fetchData = async () => {
    try {

      setIsLoading(false);
      const res = await fetchProductsHistory(id, "active");
      if (res) {

        setHistoryData(res)


      }
    } catch (error) {
      console.error("data not Fetch ", error)
    }
  }

  const EdithandleChange = (e) => {
    const { id, value } = e.target;

    // Update the selectedProductQue state with the new value
    setSelectedProductQue((prev) => ({
      ...prev,
      [id]: value,
    }));
  };


  const EditQuehandleSubmit = async(e) => {
    e.preventDefault();
    // console.log("Updated Quantity:", selectedProductQue?.productQuantity);
    console.log("Updated Quantity:", selectedProductQue);
    // Submit updated quantity here
    const res = await updateProductHistory(selectedProductQue)
    if(res.status === 200){
      alert("update data")
      setIsEditModalOpen(false)
      fetchData();
    }

  };

  return (
    <>
      <div className='h-full w- full'>
        {/* <header></header> */}
        <div className='w-full m-2 text-center '>
          <h1 className='bg-amber-300 p-2 rounded-2xl shadow-2xl shadow-amber-300 whitespace-nowrap'>Product Historys</h1>
        </div>

        <div className='flex'>
          <table className="min-w-full divide-y divide-gray-200 border border-gray-300 shadow-sm rounded-lg overflow-hidden text-sm">
            <thead className="bg-gray-100 border-b text-sm text-gray-700 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2">Product Index</th>
                <th className="px-4 py-2">Product Quantity</th>
                {/* <th className="px-4 py-2">Product Price</th> */}
                {/* <th className="px-4 py-2">Product Category</th> */}
                {/* <th className="px-4 py-2">Product Brand</th> */}
                <th className="px-4 py-2">Date</th>
                {/* <th className="px-4 py-2">Product Description</th> */}
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className='text-center'>
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-4 text-center">
                    <img
                      src="/assets/infinite-spinner.svg"
                      alt="Loading..."
                      className="w-6 h-6 mx-auto"
                    />
                  </td>
                </tr>
              ) : historyData.length > 0 ? (
                historyData.map((product, index) => (
                  <ProductHistoryList

                    key={product._id}
                    index={index}
                    product={product}
                    setSelectedProductQue={setSelectedProductQue}
                    setIsEditModalOpen={setIsEditModalOpen}

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

      </div>


      {/* Quantity edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="EDIT PRODUCT QUANTITY"
        className="max-h-[80vh] sm:max-h-[75vh] overflow-y-auto"
      >
        <div >
          <form className='p-3 ' onSubmit={EditQuehandleSubmit} >
            <div className="mb-4">
              <label htmlFor="newproductQuantity" className="block text-sm font-medium text-gray-700">Product Quantity</label>
              <input
                type="number"
                id="productQuantity"  // Ensure this matches the field name in the object
                value={selectedProductQue?.productQuantity || ''}
                onChange={EdithandleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
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



            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded float-end">Update Product Que.</button>
          </form>
        </div>
        <button
          onClick={() => setIsEditModalOpen(false)}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded float-start"
        >
          Close
        </button>

      </Modal>
    </>
  )
}

export default Page
