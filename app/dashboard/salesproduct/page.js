'use client'
import React, { useEffect, useState } from 'react'
import { fetchProducts } from '@/app/api/actions/productactions'
import { useSession } from 'next-auth/react'
import { ADDinvoice } from '@/app/api/actions/invoiceactions'
import Modal from '@/components/Modal'
import { fetchInvoices, UpdateInvoice } from "@/app/api/actions/invoiceactions"
import InvoiceList from '@/components/InvoiceList'
import Image from 'next/image'

const Page = () => {
  const { data: session } = useSession({
  required: true,
  onUnauthenticated() {
    router.push('/login');
  },
});
  const [products, setProducts] = useState([])
  const [Invoice, setInvoice] = useState([])
  const [warnings, setWarnings] = useState([])
  const [isAddModalOpen, setIsAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    user: session?.user?.id,
    client: '',
    clientPhone:"",
    clientAddress:"",
    items: [{ item_name: '', item_price: 0, productId: '', item_quantity: 1, total: 0 }],
    grandTotal: 0,
    received_amount: 0,
    balance_due_amount: 0,
    imageURL: '',
  })
  const [currentPage, setCurrentPage] = useState(1);
  const [isselectedInvoice, setSelectedInvoice] = useState([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [originalItemQuantities, setOriginalItemQuantities] = useState([]);


  const openEditModal = (invoice) => {
    setSelectedInvoice(invoice);
    setOriginalItemQuantities(invoice.items.map(item => item.item_quantity));
    setIsEditModalOpen(true);
  };

  useEffect(() => {

    if (session?.user?.id) {
      fetchData()
    }

  }, [session?.user?.id])

  const fetchData = async () => {
    setIsLoading(true)
    const res = await fetchProducts(session?.user?.id, 'active')
    setProducts(Array.isArray(res) ? res : []);

    const ress = await fetchInvoices(session?.user?.id, 'active')
    // console.log("responce invoice", ress)
    setInvoice(ress)
    setIsLoading(false)
    // setProducts(res)
  }

  const handleClientChange = (e) => {
    setFormData({ ...formData, client: e.target.value })

    setSelectedInvoice((prev) => ({
      ...prev,
      client: e.target.value,
    }));
  }



  // grand total
  useEffect(() => {
    if (!isselectedInvoice?.items || !products) return;

    const total = isselectedInvoice.items.reduce((acc, item) => {
      const product = products.find(p => p._id === item.productId);
      return acc + (product ? product.productPrice * item.item_quantity : 0);
    }, 0);

    setSelectedInvoice(prev => ({
      ...prev,
      grandTotal: total.toFixed(2),
    }));
  }, [isselectedInvoice?.items, products]);


  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items]

    if (field === 'productId') {
      const selectedProduct = products.find(p => p._id === value)
      if (selectedProduct) {
        updatedItems[index] = {
          ...updatedItems[index],
          productId: value,
          item_name: selectedProduct.productName,
          item_price: selectedProduct.productPrice,
          total: selectedProduct.productPrice * updatedItems[index].item_quantity
        }
      }
    } else if (field === 'item_quantity') {
      updatedItems[index][field] = value === '' ? '' : parseInt(value)
      const product = products.find(p => p._id === updatedItems[index].productId)
      if (product) {
        updatedItems[index].total = product.productPrice * updatedItems[index].item_quantity
        updatedItems[index].item_price = product.productPrice
        updatedItems[index].item_name = product.productName
      }
    }

    setFormData({ ...formData, items: updatedItems })

    const isValid = updatedItems.every(item => !isNaN(parseInt(item.item_quantity)))
    if (isValid) {
      validateQuantities(updatedItems)
    }
  }
  const handleItemEditChange = (index, field, value) => {
    setSelectedInvoice(prevInvoice => {
      const updatedItems = [...prevInvoice.items];

      // Handle quantity field with proper parsing
      const updatedValue = field === 'item_quantity' ? parseInt(value) || 0 : value;

      // Update the specific field
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: updatedValue,
      };

      // Find the updated product
      const selectedProduct = products.find(p => p._id === updatedItems[index].productId);

      // If product is selected or changed, update name and price
      if (field === 'productId' && selectedProduct) {
        updatedItems[index].item_name = selectedProduct.productName;
        updatedItems[index].item_price = selectedProduct.productPrice;
      }

      // Recalculate the item total
      updatedItems[index].total = selectedProduct
        ? selectedProduct.productPrice * updatedItems[index].item_quantity
        : 0;

      // Recalculate the overall grand total
      const grandTotal = updatedItems.reduce((acc, item) => {
        const prod = products.find(p => p._id === item.productId);
        return acc + (prod ? prod.productPrice * item.item_quantity : 0);
      }, 0);

      return {
        ...prevInvoice,
        items: updatedItems,
        grandTotal: parseFloat(grandTotal.toFixed(2)),
      };
    });
  };





  const validateQuantities = (itemList) => {
    const warningList = itemList.map(item => {
      const product = products.find(p => p._id === item.productId)
      if (product) {
        const availableQty = product.productQuantityremaining

        return item.item_quantity > availableQty
          ? `Only ${availableQty} available`
          : ''
      }
      return ''
    })
    setWarnings(warningList)
  }


  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, {
        productId: '',
        item_quantity: 1,
        total: 0,
        item_name: '',
        item_price: 0
      }]
    })
    setWarnings((prev) => [...prev, '']); // ✅ Add blank warning
  }

  const EditaddItem = () => {
    setSelectedInvoice((prev) => ({
      ...prev,
      items: [...prev.items, { productId: '', item_quantity: 1, item_name: "", item_price: 0 }],
    }));
    setWarnings((prev) => [...prev, '']);
  };



  const removeItem = (index) => {
    const updatedItems = [...formData.items]
    updatedItems.splice(index, 1)
    setFormData({ ...formData, items: updatedItems })
    validateQuantities(updatedItems)
  }

  const EditremoveItem = (index) => {
    const updatedItems = [...isselectedInvoice.items];
    updatedItems.splice(index, 1);

    setSelectedInvoice((prev) => ({
      ...prev,
      items: updatedItems,

    }));

    // Also remove the corresponding warning if it exists
    setWarnings((prev) => {
      const newWarnings = [...prev];
      newWarnings.splice(index, 1);
      return newWarnings;
    });
  };


  const getFilteredOptions = (currentIndex) => {
    const selectedIds = formData.items
      .map((item, idx) => (idx !== currentIndex ? item.productId : null))
      .filter(Boolean)
    return products.filter(p => !selectedIds.includes(p._id))
  }
  const getFilteredEditOptions = (currentIndex) => {
    const selectedIds = isselectedInvoice.items
      .map((item, idx) => (idx !== currentIndex ? item.productId : null))
      .filter(Boolean);
    return products.filter((product) => !selectedIds.includes(product._id));
  };


  const handleSale = async () => {

    if (warnings.some(w => w)) {
      alert('Please fix all quantity warnings before submitting')
      return
    }

    if (
      formData.items.some(
        item => !item.item_quantity || isNaN(item.item_quantity) || parseInt(item.item_quantity) <= 0
      )
    ) {
      alert('Please enter valid quantity for all items.')
      return
    }


    if (!formData.client.trim()) {
      alert('Please enter customer name.')
      return
    }

    if (formData.items.some(item => !item.productId)) {
      alert('Please select all products.')
      return
    }

    if (
      formData.items.some(
        item => !item.item_quantity || isNaN(item.item_quantity) || parseInt(item.item_quantity) <= 0
      )
    ) {
      alert('Please enter valid quantity for all items.')
      return
    }

    const preparedItems = formData.items.map(item => {
      return {
        item_name: item.item_name,
        item_price: item.item_price,
        productId: item.productId,
        item_quantity: item.item_quantity,
        total: item.total
      }
    })

    const grandTotal = preparedItems.reduce((sum, item) => sum + item.total, 0)

    const saleData = {
      client: formData.client,
      clientPhone : formData.clientPhone,
      clientAddress: formData.clientAddress,
      grandTotal,
      items: preparedItems,
      received_amount: 0,
      userId: session?.user?.id
    }

    try {
      const res = await ADDinvoice(saleData)
      if (res) {
        alert('Invoice created successfully!')
        setFormData({
          client: '',
          clientPhone: '',
          clientAddress: '',
          user: session?.user?.id,
          items: [{ productId: '', item_quantity: 1, total: 0, item_name: '', item_price: 0 }],
          grandTotal: 0,
          received_amount: 0,
          balance_due_amount: 0,
          imageURL: ''
        })
        fetchData()
        setIsAddModal(false)
      }
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'Something went wrong')
    }
  }


  const handleSaleEdit = async () => {

    if (warnings.some(w => w)) {
      alert('Fix quantity warnings before submitting.')
      return
    }

    if (
      isselectedInvoice.items.some(
        item => !item.item_quantity || isNaN(item.item_quantity) || parseInt(item.item_quantity) <= 0
      )
    ) {
      alert('Please enter valid quantity for all items.')
      return
    }


    if (!isselectedInvoice.client.trim()) {
      alert('Please enter customer name.')
      return
    }

    if (isselectedInvoice.items.some(item => !item.productId)) {
      alert('Please select all products.')
      return
    }

    if (
      isselectedInvoice.items.some(
        item => !item.item_quantity || isNaN(item.item_quantity) || parseInt(item.item_quantity) <= 0
      )
    ) {
      alert('Please enter valid quantity for all items.')
      return
    }


    // console.log("send",isselectedInvoice)
    const res = await UpdateInvoice(isselectedInvoice);

    if (res.status === 200) {
      fetchData();
      setSelectedInvoice([]);
      setIsEditModalOpen(false);
      alert(res.message);
    } else {
      alert(res.message);
    }

    // console.log("edit sale:", isselectedInvoice)
  }




  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const paginatedInvoice = (Array.isArray(Invoice) ? Invoice : []).slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil((Array.isArray(Invoice) ? Invoice.length : 0) / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };



  return (
    <div className="w-full  mx-auto">
      <div className="flex flex-row justify-between items-center px-4 py-3 rounded-t-lg">
        <h1 className="text-xl sm:text-2xl font-bold text-center sm:text-left mb-2 sm:mb-0 text-black">
          Create Sale Invoice
        </h1>

        <button
          onClick={() => setIsAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-md transition-all"
        >
          <i className="fa-solid fa-cart-plus mr-2"></i>Add Product
        </button>
      </div>

      {/* filter */}
      <div className="flex flex-col items-center justify-center w-full ">
        <div className="flex   w-full p-4">
          <label htmlFor="search" className=' border-gray-300 rounded-md p-2'>Search :</label>
          <input type="text" id="search" name='search'
            // onChange={handleSearch} 
            className="border border-gray-300 rounded-md p-2 w-1/2" placeholder="Search Invoice..." />
        </div>
        <div>

        </div>
      </div>


      <div className='sm:min-h-[62vh] h-[62vh]'>
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300 shadow-sm rounded-lg overflow-hidden text-sm">
          <thead className="bg-gray-100 border-b text-sm text-gray-700 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-2">Invoice Number</th>
              <th className="px-4 py-2">Client Name</th>
              <th className="px-4 py-2">Date</th>
              {/* <th className="px-4 py-2">Product Quantity</th> */}
              <th className="px-4 py-2">Total Amonut</th>
              <th className="px-4 py-2">Actions</th>
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
            ) : paginatedInvoice.length > 0 ? (
              paginatedInvoice.map((invoice) => (
                <InvoiceList
                  key={invoice._id}
                  invoice={invoice}
                  // setSelectedInvoice={setSelectedInvoice}
                  // setIsEditModalOpen={setIsEditModalOpen}
                  openEditModal={openEditModal}
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




      {/* Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModal(false)}
        title="ADD INVOICE"
        className="max-h-[80vh] sm:max-h-[75vh] overflow-y-auto "
      >
        <div className="space-y-6 px-2 py-2 ">
          {/* Customer Name */}
          <div>
            <label className=" font-semibold mb-1 text-sm text-gray-700">
              Customer Name
            </label>
            <input
              type="text"
              name="client"
              value={formData.client}
              onChange={handleClientChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className=" font-semibold mb-1 text-sm text-gray-700">
              Customer Address
            </label>
            <input
              type="text"
              name="clientAddress"
              value={formData.clientAddress}
              onChange={(e)=>setFormData({...formData,clientAddress:e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className=" font-semibold mb-1 text-sm text-gray-700">
              Customer Phone
            </label>
            <input
              type="text"
              name="clientPhone"
              value={formData.clientPhone}
               onChange={(e)=>setFormData({...formData,clientPhone:e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>


          {/* Product Table */}
          <div className="overflow-x-auto px-1 py-1 ">
            <table className="w-full border border-collapse rounded-lg overflow-hidden">
              <thead className="bg-blue-100 text-gray-700 text-sm">
                <tr>
                  <th className="border p-2 text-left">Product</th>
                  <th className="border p-2 text-center">Available</th>
                  <th className="border p-2 text-center">Price</th>
                  <th className="border p-2 text-center">Quantity</th>
                  <th className="border p-2 text-center">Total</th>
                  <th className="border p-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, index) => {
                  const product = products.find(p => p._id === item.productId);
                  const itemTotal = product
                    ? product.productPrice * item.item_quantity
                    : 0;

                  return (
                    <tr key={index} className="bg-white text-sm">
                      {/* Product Selector */}
                      <td className="border p-2">
                        <select
                          className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          value={item.productId}
                          onChange={(e) =>
                            handleItemChange(index, 'productId', e.target.value)
                          }
                        >
                          <option value="">-- Select --</option>
                          {getFilteredOptions(index).map((product) => (
                            <option key={product._id} value={product._id}>
                              {product.productName}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Available Quantity */}
                      <td className="border p-2 text-center">
                        {product
                          ? product.productQuantityremaining
                          : '--'}
                      </td>

                      {/* Price */}
                      <td className="border p-2 text-center">
                        {product ? `₹${product.productPrice}` : '--'}
                      </td>


                      {/* Quantity Input */}
                      <td className="border p-2">
                        <input
                          type="number"
                          min={1}
                          max={product ? product.productQuantityremaining : 0}
                          value={item?.item_quantity || 0}
                          onChange={(e) => {
                            const enteredQty = parseInt(e.target.value);
                            const availableQty = product ? product.productQuantityremaining : 0;

                            const newWarnings = [...warnings];

                            if (enteredQty > availableQty) {
                              newWarnings[index] = `Only ${availableQty} available`;
                            } else {
                              newWarnings[index] = ''; // ✅ Clear the warning if it's valid
                            }

                            setWarnings(newWarnings); // ✅ Always update warnings array
                            // console.log((Warnings))
                            handleItemChange(index, 'item_quantity', enteredQty);
                          }}
                          className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />

                        {/* ✅ Properly display the warning */}
                        {warnings[index] && (
                          <p className="text-red-600 text-xs mt-1">
                            {warnings[index]}
                          </p>
                        )}
                      </td>



                      {/* Total */}
                      <td className="border p-2 text-center font-medium">
                        ₹{itemTotal.toFixed(2)}
                      </td>

                      {/* Remove Button */}
                      <td className="border p-2 text-center">
                        {formData.items.length > 1 && (
                          <button
                            onClick={() => removeItem(index)}
                            className="text-red-500 hover:underline text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {/* Grand Total Row */}
                <tr className="bg-gray-100 font-semibold text-sm">
                  <td colSpan="4" className="border p-2 text-right">
                    Grand Total
                  </td>
                  <td className="border p-2 text-center" colSpan="2">
                    ₹
                    {formData.items
                      .reduce((acc, item) => {
                        const product = products.find(p => p._id === item.productId);
                        return (
                          acc +
                          (product ? product.productPrice * item.item_quantity : 0)
                        );
                      }, 0)
                      .toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Add Row Button */}
          <button
            onClick={addItem}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded shadow hover:bg-gray-300 transition duration-150"
          >
            + Add Product Row
          </button>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setIsAddModal(false)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-150"
            >
              Close
            </button>

            <button
              onClick={handleSale}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition duration-150"
            >
              Create Invoice
            </button>
          </div>
        </div>
      </Modal>


      {/* edit modale */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit INVOICE"
        className="max-h-[80vh] sm:max-h-[75vh] overflow-y-auto "
      >
        <div className="space-y-6 px-2 py-2 ">
          {/* Customer Name */}
          <div>
            <label className=" font-semibold mb-1 text-sm text-gray-700">
              Customer Name
            </label>
            <input
              type="text"
              name="client"
              value={isselectedInvoice.client}
              onChange={handleClientChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className=" font-semibold mb-1 text-sm text-gray-700">
              Customer Address
            </label>
            <input
              type="text"
              name="client"
              value={isselectedInvoice.clientAddress}
              onChange={(e)=>setSelectedInvoice({...isselectedInvoice,clientAddress:e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className=" font-semibold mb-1 text-sm text-gray-700">
              Customer Phone
            </label>
            <input
              type="text"
              name="client"
              value={isselectedInvoice.clientPhone}
              onChange={(e)=>setSelectedInvoice({...isselectedInvoice,clientPhone:e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="font-semibold mb-1 text-sm text-gray-700">
              Issue Date
            </label>
            <input
              type="date"
              name="date"
              id="date"
              value={
                isselectedInvoice.date
                  ? new Date(isselectedInvoice.date).toISOString().slice(0, 10)
                  : ''
              }
              onChange={(e) =>
                setSelectedInvoice((prev) => ({
                  ...prev,
                  date: e.target.value,
                }))
              }
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>


          {/* Product Table */}
          <div className="overflow-x-auto px-1 py-1 ">
            <table className="w-full border border-collapse rounded-lg overflow-hidden">
              <thead className="bg-blue-100 text-gray-700 text-sm">
                <tr>
                  <th className="border p-2 text-left">Product</th>
                  <th className="border p-2 text-center">Available</th>
                  <th className="border p-2 text-center">Price</th>
                  <th className="border p-2 text-center">Quantity</th>
                  <th className="border p-2 text-center">Total</th>
                  <th className="border p-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {isselectedInvoice?.items?.map((item, index) => {


                  const product = products.find(p => p._id === item.productId);
                  const originalQty = originalItemQuantities[index] || 0;
                  const availableQty = product
                    ? product.productQuantityremaining + originalQty
                    : 0;
                  const itemTotal = product ? product.productPrice * item.item_quantity : 0;


                  return (
                    <tr key={index} className="bg-white text-sm">
                      {/* Product Selector */}
                      <td className="border p-2">
                        <select
                          className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          value={item.productId}
                          onChange={(e) =>
                            handleItemEditChange(index, 'productId', e.target.value)
                          }
                        >
                          <option value="">-- Select --</option>
                          {getFilteredEditOptions(index).map((product) => (
                            <option key={product._id} value={product._id}>
                              {product.productName}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Available Quantity */}
                      <td className="border p-2 text-center">
                        {availableQty}
                      </td>

                      {/* Price */}
                      <td className="border p-2 text-center">
                        {product ? `₹${product.productPrice}` : '--'}
                      </td>

                      {/* Quantity Input */}
                      <td className="border p-2">
                        <input
                          type="number"
                          min={1}
                          max={
                            availableQty
                          }
                          value={item.item_quantity}
                          onChange={(e) => {
                            const enteredQty = parseInt(e.target.value || '0');

                            if (enteredQty > availableQty) {
                              setWarnings((prev) => {
                                const newWarnings = [...prev];
                                newWarnings[index] = `Only ${availableQty} available`;
                                return newWarnings;
                              });
                            } else {
                              setWarnings((prev) => {
                                const newWarnings = [...prev];
                                newWarnings[index] = '';
                                return newWarnings;
                              });
                            }

                            handleItemEditChange(index, 'item_quantity', enteredQty);
                          }}
                          className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        {warnings[index] && (
                          <p className="text-red-600 text-xs mt-1">
                            {warnings[index]}
                          </p>
                        )}
                      </td>

                      {/* Total */}
                      <td className="border p-2 text-center font-medium">
                        ₹{itemTotal.toFixed(2)}
                      </td>

                      {/* Remove Button */}
                      <td className="border p-2 text-center">
                        {isselectedInvoice.items.length > 1 && (
                          <button
                            onClick={() => EditremoveItem(index)}
                            className="text-red-500 hover:underline text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-100 font-semibold text-sm">
                  <td colSpan="4" className="border p-2 text-right">
                    Grand Total
                  </td>
                  <td className="border p-2 text-center" colSpan="2">
                    ₹{isselectedInvoice?.grandTotal || '0.00'}
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

          {/* Add Row Button */}
          <button
            onClick={EditaddItem}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded shadow hover:bg-gray-300 transition duration-150"
          >
            + Add Product Row
          </button>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-150"
            >
              Close
            </button>

            <button
              onClick={handleSaleEdit}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition duration-150"
            >
              Invoice Update
            </button>
          </div>
        </div>
      </Modal>


    </div>
  )
}

export default Page
