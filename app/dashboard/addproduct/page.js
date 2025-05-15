"use client";

import Modal from '@/app/components/Modal';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

import createProduct from '@/app/api/actions/productactions';

const Page = () => {
  const { data: session } = useSession();
  const [isAddModalOpen, setIsAddModal] = useState(false);
  const [formData, setFormData] = useState({
    user: session?.user?.id,
    productName: '',
    productQuantity: '',
    productPrice: '',
    productCategory: '',
    productBrand: '',
    date: new Date().toISOString().split('T')[0],
    productDescription: '',
  });
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit =async (e) => {
    e.preventDefault();

  
   const response = await createProduct(formData);

  if (response.error) {
    console.log('Error creating product:', response.error);
    alert('Error creating product: ' + response.error);
    return;
  }

  if (response.status === 200) {
    alert(response.message);
    setFormData({
      user: session?.user?.id,
      productName: '',
      productQuantity: '',
      productPrice: '',
      productCategory: '',
      productBrand: '',
      date: new Date().toISOString().split('T')[0],
      productDescription: '',
    });
  }

  setIsAddModal(false);
  };

  return (
    <>
      <div className="flex flex-col items-center  w-full h-full">

        <div className="flex  w-full  p-4 items-center justify-between ">
          <h1 className="text-2xl font-bold mb-4 ">Add Product</h1>
          <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => setIsAddModal(true)}><i className="fa-solid fa-cart-plus mx-1"></i>Add Product</button>
        </div>


      </div>





      {/* Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModal(false)}
        title="ADD PRODUCT"
        className="max-h-[80vh] sm:max-h-[75vh] overflow-y-auto"
      >
        <div >
          <form className='p-3 ' onSubmit={handleSubmit} >
            <div className="mb-4">
              <label htmlFor="productName" className="block text-sm font-medium text-gray-700">Product Name</label>
              <input type="text" id="productName" value={formData.productName} onChange={handleChange} className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div className="mb-4">
              <label htmlFor="productQuantity" className="block text-sm font-medium text-gray-700">Product Quantity</label>
              <input type="number" id="productQuantity" value={formData.productQuantity} onChange={handleChange} className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div className="mb-4">
              <label htmlFor="productPrice" className="block text-sm font-medium text-gray-700">Product Price</label>
              <input type="number" id="productPrice" value={formData.productPrice} onChange={handleChange} className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>

            <div className="mb-4">
              <label htmlFor="productCategory" className="block text-sm font-medium text-gray-700">Product Category</label>
              <input type="text" id="productCategory" value={formData.productCategory} onChange={handleChange} className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div className="mb-4">
              <label htmlFor="productBrand" className="block text-sm font-medium text-gray-700">Product Brand</label>
              <input type="text" id="productBrand" value={formData.productBrand} onChange={handleChange} className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>




            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                id="date"
                value={formData.date} // ✅ controlled input
                onChange={handleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />

            </div>



            <div className="mb-4">
              <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700">Product Description</label>
              <textarea id="productDescription" value={formData.productDescription} onChange={handleChange} rows={4} className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
            </div>
            <button type="submit" onClick={(e) => handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded float-end">Add Product</button>
          </form>
        </div>
        <button
          onClick={() => setIsAddModal(false)}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded float-start"
        >
          Close
        </button>
      </Modal>


    </>
  )
}

export default Page
