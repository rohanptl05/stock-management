"use client";

import Modal from '@/components/Modal';
import { use, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { createProduct, fetchProducts, updateProduct } from '@/app/api/actions/productactions';
import ProductList from '@/components/ProductList';
import { AddProductHistory } from '@/app/api/actions/productHistoryactions';
import Image from 'next/image';

const Page = () => {
  const { data: session } = useSession({
  required: true,
  onUnauthenticated() {
    router.push('/login');
  },
});
  const [isAddModalOpen, setIsAddModal] = useState(false);
  const [formData, setFormData] = useState({
    user: session?.user?.id,
    productName: '',
    productQuantity: '',
    productQuantityremaining: 0,
    productPrice: '',
    productCategory: '',
    productBrand: '',
    date: new Date().toISOString().split('T')[0],
    productDescription: '',
  });
  const [products, setProducts] = useState([]);
  const [OriginalProduct, setOriginalProduct] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewopen, setViewopen] = useState(false);
  const [isQuantityOpen, setIsQuantityOpen] = useState(false);
  const [newQuantity, setNewQuantity] = useState(0);
  // const [serchText,setSearchText]=useState({})
   const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {

    fetchData();
  }, [session?.user?.id]);

  const fetchData = async () => {
    setIsLoading(true);
    const response = await fetchProducts(session?.user?.id, 'active');
    if (response.error) {
      console.log('Error fetching products:', response.error);
      alert('Error fetching products: ' + response.error);
      setIsLoading(false);
      return;
    }
    setProducts(response);
    setOriginalProduct(response);
    setIsLoading(false);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  const EdithandleChange = (e) => {
    const { id, value } = e.target;
    setSelectedProduct(prev => ({
      ...prev,
      [id]: value,
    }));

  };

  const handleQuantityChange = (e) => {
    const { id, value } = e.target;
    setNewQuantity(value);

  };


  const handleSubmit = async (e) => {
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
        productQuantityremaining: 0,
        productPrice: '',
        productCategory: '',
        productBrand: '',
        date: new Date().toISOString().split('T')[0],
        productDescription: '',
      });
    }

    setIsAddModal(false);
    fetchData();
  };

  const EdithandleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await updateProduct(selectedProduct);

      if (response.error) {
        alert(`Error updating product: ${response.error}`);
        return;
      }

      if (response.status === 200) {
        alert(response.message);
        setSelectedProduct(null);
        setIsEditModalOpen(false);
        fetchData(); // Refresh the product list
      } else {
        alert("Unexpected response from server.");
      }
    } catch (error) {
      console.error("Unexpected error during product update:", error);
      alert("Something went wrong while updating the product.");
    }
  };

  const AddQuehandleSubmit = async (e) => {
    e.preventDefault();

    const updatedQuantity = parseFloat(selectedProduct?.productQuantity || 0) + parseFloat(newQuantity || 0);

    if (updatedQuantity < 0) {
      alert("Quantity cannot be negative");
      return;
    }

    const updatedProduct = {
      ...selectedProduct,
      productQuantity: updatedQuantity,
    };

    const updateHistory = {
      ...selectedProduct,
      productQuantity: parseFloat(newQuantity || 0)
    }


    try {
      const res = await updateProduct(updatedProduct);

      const historyData = await AddProductHistory(updateHistory)

      if (res.error) {
        alert('Error updating product: ' + res.error);
        return;
      }


      if (res.status === 200) {
        alert(res.message);
        setIsQuantityOpen(false);
        setSelectedProduct(null);
        setNewQuantity(0);
        fetchData();

        fetchData();
      }
    } catch (error) {
      console.error(error);
      alert("Unexpected error updating product");
    }
  };

  const handleSearch =async (e) => {
   const searchTerm = e.target.value.trim();

  console.log("Search Text:", searchTerm);
  if (!searchTerm) {
      await fetchData();
      return;
    }

       try {
      const searchData = [...OriginalProduct].filter((product) => {
        const productName = product.productName.toLowerCase().includes(searchTerm.toLowerCase());
        const productCategory = product.productCategory.toLowerCase().includes(searchTerm.toLowerCase());
       const productId = String(product.productId || '').toLowerCase().includes(searchTerm);

        return productName || productCategory || productId;
      });
      setProducts(searchData);


    } catch (error) {
      console.error("Error searching clients:", error);
    }

};

  const itemsPerPage = 7;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const paginatedproduct = (Array.isArray(products) ? products : []).slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil((Array.isArray(products) ? products.length : 0) / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };



  return (
    <>
      <div className="flex flex-col  w-full h-full">

        <div className="flex  w-full  p-4 items-center justify-between ">
          <h1 className="sm:text-2xl font-bold mb-2 text-xl">Products</h1>
          <button className="bg-blue-500 text-white sm:px-4 sm:py-2 px-2 py-1 rounded" onClick={() => setIsAddModal(true)}><i className="fa-solid fa-cart-plus mx-1"></i>Add Product</button>
        </div>

        {/* filter */}
        <div className="flex flex-col items-center justify-center w-full sm:text-sm text-xs">
          <div className="flex   w-full p-4">
            <label htmlFor="search" className=' border-gray-300 rounded-md p-2 sm:text-sm text-xs'>Search :</label>
            <input type="text" id="search" name='search' onChange={handleSearch} className="border border-gray-300 rounded-md p-2 w-1/2 sm:text-sm text-xs" placeholder="Search products..." />
          </div>
          <div>

          </div>
        </div>



        {/* Table */}
        <div className="flex flex-col w-full sm:min-h-[60vh] h-[58vh] overflow-auto ">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-300 shadow-sm rounded-lg overflow-hidden  ">
            <thead className="bg-gray-100 border-b text-sm text-gray-700 uppercase tracking-wider whitespace-nowrap text-[10px] sm:text-sm">
              <tr>
                <th className="sm:px-4 sm:py-2 px-2 py-1">Product Name</th>
                <th className="sm:px-4 sm:py-2 px-2 py-1 hidden sm:table-cell">Product ID</th>
                <th className="sm:px-4 sm:py-2 px-2 py-1">Quantity</th>
                <th className="sm:px-4 sm:py-2 px-2 py-1">Remaining</th>
                <th className="sm:px-4 sm:py-2 px-2 py-1 hidden sm:table-cell">Price</th>
                <th className="sm:px-4 sm:py-2 px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody className='text-center text-[12px] sm:text-sm'>
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
              ) : paginatedproduct.length > 0 ? (
                paginatedproduct.map((product) => (
                  <ProductList
                    key={product._id}
                    product={product}
                    setSelectedProduct={setSelectedProduct}
                    setIsEditModalOpen={setIsEditModalOpen}
                    setViewopen={setViewopen}
                    setIsQuantityOpen={setIsQuantityOpen}
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
              <input type="text" id="productName" value={formData.productName} required onChange={handleChange} className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div className="mb-4">
              <label htmlFor="productQuantity" className="block text-sm font-medium text-gray-700">Product Quantity</label>
              <input type="number" id="productQuantity" value={formData.productQuantity} required onChange={handleChange} className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div className="mb-4">
              <label htmlFor="productPrice" className="block text-sm font-medium text-gray-700">Product Price</label>
              <input type="number" id="productPrice" value={formData.productPrice} required onChange={handleChange} className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
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
                value={formData.date}
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



      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="EDIT PRODUCT"
        className="max-h-[80vh] sm:max-h-[75vh] overflow-y-auto"
      >
        <div >
          <form className='p-3 ' onSubmit={EdithandleSubmit} >
            <div className="mb-4">
              <label htmlFor="productName" className="block text-sm font-medium text-gray-700">Product Name</label>
              <input type="text" id="productName" value={selectedProduct?.productName} onChange={EdithandleChange} className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            {/* <div className="mb-4">
              <label htmlFor="productQuantity" className="block text-sm font-medium text-gray-700">Product Quantity</label>
              <input type="number" id="productQuantity" value={selectedProduct?.productQuantity} onChange={EdithandleChange} className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div> */}
            <div className="mb-4">
              <label htmlFor="productPrice" className="block text-sm font-medium text-gray-700">Product Price</label>
              <input type="number" id="productPrice" value={selectedProduct?.productPrice} onChange={EdithandleChange} className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>

            <div className="mb-4">
              <label htmlFor="productCategory" className="block text-sm font-medium text-gray-700">Product Category</label>
              <input type="text" id="productCategory" value={selectedProduct?.productCategory} onChange={EdithandleChange} className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div className="mb-4">
              <label htmlFor="productBrand" className="block text-sm font-medium text-gray-700">Product Brand</label>
              <input type="text" id="productBrand" value={selectedProduct?.productBrand} onChange={EdithandleChange} className="mt
                -1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                id="date"
                value={selectedProduct?.date ? new Date(selectedProduct.date).toISOString().split('T')[0] : ''}
                onChange={EdithandleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />

            </div>

            <div className="mb-4">
              <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700">Product Description</label>
              <textarea id="productDescription" value={selectedProduct?.productDescription} onChange={EdithandleChange} rows={4} className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
            </div>
            <button type="submit" onClick={(e) => EdithandleSubmit} className="bg-green-500 text-white px-4 py-2 rounded float-end">Update Product</button>
          </form>
        </div>
        <button
          onClick={() => setIsEditModalOpen(false)}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded float-start"
        >
          Close
        </button>
      </Modal>



      {/* View Modal */}
      <Modal
        isOpen={viewopen}
        onClose={() => setViewopen(false)}
        title="VIEW PRODUCT"
        className="max-h-[80vh] sm:max-h-[75vh] overflow-y-auto"
      >
        <div className="p-4 space-y-4">
          {[
            { label: 'Product Name', value: selectedProduct?.productName },
            { label: 'Product Quantity', value: selectedProduct?.productQuantity },
            { label: 'Product Price', value: selectedProduct?.productPrice },
            { label: 'Product Category', value: selectedProduct?.productCategory },
            { label: 'Product Brand', value: selectedProduct?.productBrand },
            { label: 'Date', value: new Date(selectedProduct?.date).toLocaleDateString() },
            { label: 'Product Description', value: selectedProduct?.productDescription },
          ].map(({ label, value }, index) => (
            <div key={index} className="flex flex-col">
              <span className="text-gray-500 text-sm font-semibold">{label}</span>
              <div className="text-gray-900 text-base bg-gray-50 border border-gray-200 rounded-md px-3 py-2 mt-1 shadow-sm">
                {value || '—'}
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 pb-4 pt-2">
          <button
            onClick={() => setViewopen(false)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow-sm"
          >
            Close
          </button>
        </div>
      </Modal>


      {/* Quantity Modal */}
      <Modal
        isOpen={isQuantityOpen}
        onClose={() => setIsQuantityOpen(false)}
        title="ADD PRODUCT QUANTITY"
        className="max-h-[80vh] sm:max-h-[75vh] overflow-y-auto"
      >
        <div >
          <form className='p-3 ' onSubmit={AddQuehandleSubmit} >
            <div className="mb-4">
              <label htmlFor="newproductQuantity" className="block text-sm font-medium text-gray-700">Product Quantity</label>
              <input type="number" id="newproductQuantity" onChange={handleQuantityChange} className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>

            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded float-end">Add Product Que.</button>
          </form>
        </div>
        <button
          onClick={() => setIsQuantityOpen(false)}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded float-start"
        >
          Close
        </button>

      </Modal>


    </>
  )
}

export default Page
