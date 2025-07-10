'use client'
import React, { useEffect, useState } from 'react'
import { fetchProducts } from '@/app/api/actions/productactions'
import { useSession } from 'next-auth/react'
import { ADDinvoice } from '@/app/api/actions/invoiceactions'
import Modal from '@/components/Modal'
import { fetchInvoices, UpdateInvoice } from "@/app/api/actions/invoiceactions"
import InvoiceList from '@/components/InvoiceList'
import Image from 'next/image'
import { toast } from 'sonner'

const Page = () => {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/');
    },
  });
  const [products, setProducts] = useState([])
  const [Invoice, setInvoice] = useState([])
  const [OriginalInvoice, setOriginalInvoice] = useState([])
  const [warnings, setWarnings] = useState([])
  const [isAddModalOpen, setIsAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    user: session?.user?.id,
    client: '',
    clientPhone: "",
    clientAddress: "",
    items: [{ item_name: '', item_price: 0, productId: '', item_quantity: 1, total: 0, item_brand: '', item_catagory: '', item_model: '', item_serial: '' }],
    grandTotal: 0,
    received_amount: 0,
    customerID: "",
    balance_due_amount: 0,
    imageURL: '',
    warranty: '',
    note: ''
  })
  const [currentPage, setCurrentPage] = useState(1);
  const [isselectedInvoice, setSelectedInvoice] = useState([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [originalItemQuantities, setOriginalItemQuantities] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [navigating, setNavigating] = useState(false);



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
    setOriginalInvoice(ress)
    setInvoice(ress)
    setIsLoading(false)

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
    const updatedItems = [...formData.items];

    if (field === 'productId') {
      const selectedProduct = products.find(p => p._id === value);
      if (selectedProduct) {
        updatedItems[index] = {
          ...updatedItems[index],
          productId: value,
          item_name: selectedProduct.productName,
          item_price: selectedProduct.productPrice,
          total: selectedProduct.productPrice * updatedItems[index].item_quantity,
          item_brand: selectedProduct.productBrand || '',
          item_catagory: selectedProduct.productCategory || '',
          item_model: selectedProduct.productModel || '',



        };
      }
    } else if (field === 'item_quantity') {
      updatedItems[index][field] = value === '' ? '' : parseInt(value);
      const product = products.find(p => p._id === updatedItems[index].productId);
      if (product) {
        updatedItems[index].total = product.productPrice * updatedItems[index].item_quantity;
        updatedItems[index].item_price = product.productPrice;
        updatedItems[index].item_name = product.productName;
        updatedItems[index].item_model = product.productModel || '';
        updatedItems[index].item_serial = product.productImei || '';
        updatedItems[index].item_brand = product.productBrand || '';
        updatedItems[index].item_catagory = product.productCategory || '';


      }
    } else {

      updatedItems[index][field] = value;
    }

    setFormData({ ...formData, items: updatedItems });

    const isValid = updatedItems.every(item => !isNaN(parseInt(item.item_quantity)));
    if (isValid) {
      validateQuantities(updatedItems);
    }
  };

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
        item_price: 0,
        item_model: '',
        item_serial: '',
        item_brand: '',
        item_catagory: '',
      }]
    })
    setWarnings((prev) => [...prev, '']);
  }

  const EditaddItem = () => {
    setSelectedInvoice((prev) => ({
      ...prev,
      items: [...prev.items, { productId: '', item_quantity: 1, item_name: "", item_price: 0, total: 0, item_model: '', item_serial: '', item_brand: '', item_catagory: '' }],
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


  const handleSale = async (e) => {
    e.preventDefault();

    // setIsSubmitting(true)
    if (warnings.some(w => w)) {
      toast.warning('Please fix all quantity warnings before submitting')
      return
    }

    if (
      formData.items.some(
        item => !item.item_quantity || isNaN(item.item_quantity) || parseInt(item.item_quantity) <= 0
      )
    ) {
      toast.warning('Please enter valid quantity for all items.')
      return
    }


    if (!formData.client.trim()) {
      toast.warning('Please enter customer name.')
      return
    }

    if (formData.items.some(item => !item.productId)) {
      toast.warning('Please select all products.')
      return
    }

    if (
      formData.items.some(
        item => !item.item_quantity || isNaN(item.item_quantity) || parseInt(item.item_quantity) <= 0
      )
    ) {
      toast.warning('Please enter valid quantity for all items.')
      return
    }

    const preparedItems = formData.items.map(item => {
      return {
        item_name: item.item_name,
        item_price: item.item_price,
        productId: item.productId,
        item_quantity: item.item_quantity,
        total: item.total,
        item_model: item.item_model,
        item_serial: item.item_serial,
        item_brand: item.item_brand,
        item_catagory: item.item_catagory,

      }
    })

    const grandTotal = preparedItems.reduce((sum, item) => sum + item.total, 0)

    const saleData = {
      client: formData.client,
      clientPhone: formData.clientPhone,
      clientAddress: formData.clientAddress,
      grandTotal,
      customerID: formData.customerID,
      items: preparedItems,
      received_amount: 0,
      userId: session?.user?.id,
      warranty: formData.warranty,
      note: formData.note
    }
    console.log("objectjhghkg:", saleData)
    try {
      const res = await ADDinvoice(saleData)
      if (res) {
        toast.success('Invoice created successfully!')
        setFormData({
          client: '',
          clientPhone: '',
          clientAddress: '',
          user: session?.user?.id,
          items: [{ productId: '', item_quantity: 1, total: 0, item_name: '', item_price: 0, item_model: '', item_serial: '', item_brand: '', item_catagory: '' }],
          grandTotal: 0,
          received_amount: 0,
          customerID: "",
          balance_due_amount: 0,
          imageURL: '',
          warranty: '',
          note: ''
        })

        setIsAddModal(false)
      }
    } catch (err) {
      console.error(err)
      toast.error(err?.response?.data?.message || 'Something went wrong')
    }
    finally {
      setIsSubmitting(false)
      fetchData()
    }
  }


  const handleSaleEdit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true)

    if (warnings.some(w => w)) {
      toast.warning('Fix quantity warnings before submitting.')
      return
    }

    if (
      isselectedInvoice.items.some(
        item => !item.item_quantity || isNaN(item.item_quantity) || parseInt(item.item_quantity) <= 0
      )
    ) {
      toast.warning('Please enter valid quantity for all items.')
      return
    }


    if (!isselectedInvoice.client.trim()) {
      toast.warning('Please enter customer name.')
      return
    }

    if (isselectedInvoice.items.some(item => !item.productId)) {
      toast.warning('Please select all products.')
      return
    }

    if (
      isselectedInvoice.items.some(
        item => !item.item_quantity || isNaN(item.item_quantity) || parseInt(item.item_quantity) <= 0
      )
    ) {
      toast.warning('Please enter valid quantity for all items.')
      return
    }



    const res = await UpdateInvoice(isselectedInvoice);

    if (res.status === 200) {
      fetchData();
      setSelectedInvoice([]);
      setIsEditModalOpen(false);
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }


    setIsSubmitting(false)
  }



  const handlePhoneChange = (e) => {
    const value = e.target.value;


    if (!/^\d*$/.test(value)) return;


    setSelectedInvoice({ ...isselectedInvoice, clientPhone: value });


    if (value.length !== 10) {
      setError("Phone number must be exactly 10 digits");
    } else {
      setError("");
    }
  };




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

  const handleSearch = async (e) => {
    const searchTerm = e.target.value.trim();


    if (!searchTerm) {
      await fetchData();
      return;
    }

    try {
      const searchData = [...OriginalInvoice].filter((incoices) => {
        const clientName = incoices.client.toLowerCase().includes(searchTerm.toLowerCase());
        const address = incoices.clientAddress.toLowerCase().includes(searchTerm.toLowerCase());
        const Phone = String(incoices.clientPhone || '').toLowerCase().includes(searchTerm);

        return clientName || address || Phone;
      });
      setInvoice(searchData);


    } catch (error) {
      console.error("Error searching clients:", error);
    }

  };


  return (
    <div className="w-full  mx-auto">
      <div className="flex flex-row justify-between items-center px-4 py-3 rounded-t-lg">
        <h1 className="text-xl sm:text-2xl font-bold text-center sm:text-left mb-2 sm:mb-0 text-black">
          Create Sale Invoice
        </h1>

        <button
          onClick={() => setIsAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white sm:px-4 sm:py-2 px-2 py-1 rounded shadow-md transition-all"
        >
          <i className="fa-solid fa-cart-plus mr-2"></i>Add Invoice
        </button>
      </div>

      {/* filter */}
      <div className="flex flex-col items-center justify-center w-full ">
        <div className="flex   w-full p-4">
          <label htmlFor="search" className=' border-gray-300 rounded-md p-2'>Search :</label>
          <input type="text" id="search" name='search'
            onChange={handleSearch}
            className="border border-gray-300 rounded-md p-2 w-1/2" placeholder="Search Invoice..." />
        </div>
        <div>

        </div>
      </div>


      <div className='sm:min-h-[62vh] h-[62vh]'>
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300 shadow-sm rounded-lg overflow-y-auto text-sm">
          <thead className="bg-gray-100 border-b sm:text-sm text-gray-700 uppercase tracking-wider text-[10px] whitespace-nowrap">
            <tr className=''>
              <th className="sm:px-4 sm:py-2 px-2 py-1 hidden sm:table-cell">Invoice Number</th>
              <th className="sm:px-4 sm:py-2 px-2 py-1">Customer Name</th>
              <th className="sm:px-4 sm:py-2 px-2 py-1 ">Date</th>

              <th className="sm:px-4 sm:py-2 px-2 py-1 hidden sm:table-cell">Total Amonut</th>
              <th className="sm:px-4 sm:py-2 px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody className='text-center  whitespace-nowrap text-[10px] sm:text-sm'>
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
                  openEditModal={openEditModal}
                  fetchData={fetchData}
                  setNavigating={setNavigating}
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
        className="max-h-[85vh] overflow-y-auto"
      >
        <div className="space-y-6 px-4 py-4">
          {/* Section: Customer Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-blue-700 border-b pb-1">Customer Details</h2>

            <div className=" grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="py-1">
                <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                <input
                  type="text"
                  name="client"
                  value={formData.client}
                  onChange={handleClientChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="py-1">
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="number"
                  name="clientPhone"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="py-1">
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  name="clientAddress"
                  value={formData.clientAddress}
                  onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="py-1">

                <label className="block text-sm font-medium text-gray-700">Customer ID</label>
                <input
                  type="text"
                  name="customerID"
                  value={formData.customerID}
                  onChange={(e) => setFormData({ ...formData, customerID: e.target.value })}
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />


              </div>
            </div>
          </div>

          {/* Section: Product Items */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-blue-700 border-b pb-1">Product Items</h2>

            {formData.items.map((item, index) => {
              const product = products.find((p) => p._id === item.productId);
              const availableQty = product ? product.productQuantityremaining : 0;
              const itemTotal = product ? product.productPrice * item.item_quantity : 0;

              return (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-blue-600">Product #{index + 1}</h3>
                    {formData.items.length > 1 && (
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-500 text-sm hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Row 1: Product selector, Price, Available */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Product</label>
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- Select Product --</option>
                        {getFilteredOptions(index)
                          .sort((a, b) => a.productName.localeCompare(b.productName))
                          .map((product) => (
                            <option key={product._id} value={product._id}>
                              {product.productName}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Price</label>
                      <div className="bg-gray-100 px-3 py-2 rounded border">{`₹${product?.productPrice ?? '--'}`}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Available</label>
                      <div className="bg-gray-100 px-3 py-2 rounded border text-center">{availableQty}</div>
                    </div>
                  </div>

                  {/* Row 2: Quantity, Total */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Quantity</label>
                      <input
                        type="number"
                        min={1}
                        max={availableQty}
                        value={item.item_quantity || ''}
                        onChange={(e) => {
                          const qty = parseInt(e.target.value);
                          const newWarnings = [...warnings];
                          newWarnings[index] =
                            qty > availableQty ? `Only ${availableQty} available` : '';
                          setWarnings(newWarnings);
                          handleItemChange(index, 'item_quantity', qty);
                        }}
                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      />
                      {warnings[index] && (
                        <p className="text-xs text-red-500 mt-1">{warnings[index]}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Total</label>
                      <div className="bg-gray-100 px-3 py-2 rounded border">{`₹${itemTotal.toFixed(2)}`}</div>
                    </div>
                  </div>

                  {/* Row 3: Serial No & Model */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Serial No./IMEI No.</label>
                      <input
                        type="number"
                        value={item.item_serial || ''}
                        onChange={(e) => handleItemChange(index, 'item_serial', e.target.value)}
                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Model No</label>
                      <input
                        type="text"
                        value={item.item_model || ''}
                        onChange={(e) => handleItemChange(index, 'item_model', e.target.value)}
                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                  </div>
                </div>
              );
            })}

            {/* Add Product Row Button */}
            <button
              onClick={addItem}
              className="text-sm bg-gray-200 px-3 py-2 rounded hover:bg-gray-300 shadow"
            >
              + Add Product Row
            </button>
          </div>

          {/* Section: Extra Details */}
          {/* <div className="space-y-4">
            <h2 className="text-lg font-semibold text-blue-700 border-b pb-1">Invoice Info</h2>


          </div> */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Warranty</label>
            <select
              name="warranty"
              value={formData.warranty || ""}

              onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Warranty</option>
              <option value="3 months">3 Months</option>
              <option value="6 months">6 Months</option>
              <option value="1 year">1 Year</option>
              <option value="2 years">2 Years</option>
              <option value="3 years">3 Years</option>
              <option value="5 years">5 Years</option>
              <option value="Lifetime">Lifetime</option>
            </select>
          </div>
          <div className="mt-3">
            <label htmlFor="note" className="block text-sm font-semibold text-gray-700 mb-1">
              Notes:
            </label>
            <textarea
              name="note"
              id="note"
              rows={4}
              placeholder="Describe..."
              value={formData.note || ''}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            ></textarea>
          </div>


          {/* Footer Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <button
              onClick={() => setIsAddModal(false)}
              className="bg-red-500 text-white px-5 py-2 rounded hover:bg-red-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSale}
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              {isSubmitting ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </div>
      </Modal>



      {/* edit modale */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit INVOICE"
        className="max-h-[85vh] overflow-y-auto"
      >
        <div className="space-y-6 px-4 py-4">
          {/* Section: Customer Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-blue-700 border-b pb-1">Customer Details</h2>

            <div className=" sm:grid-cols-2 gap-4">
              <div className="py-1">
                <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                <input
                  type="text"
                  name="client"
                  value={isselectedInvoice.client}
                  onChange={handleClientChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="py-1">
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="number"
                  name="clientPhone"
                  value={isselectedInvoice.clientPhone}
                  onChange={handlePhoneChange}
                  maxLength={10}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="py-1">
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  name="clientAddress"
                  value={isselectedInvoice.clientAddress}
                  onChange={(e) => setSelectedInvoice({ ...isselectedInvoice, clientAddress: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="py-1" >

                <label className="block text-sm font-medium text-gray-700">Customer ID</label>
                <input
                  type="text"
                  name="customerID"

                  value={isselectedInvoice.customerID}
                  onChange={(e) => setSelectedInvoice({ ...isselectedInvoice, customerID: e.target.value })}
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
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
            </div>
          </div>

          {/* Section: Product Items */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-blue-700 border-b pb-1">Product Items</h2>

            {isselectedInvoice?.items?.map((item, index) => {
              const product = products.find(p => p._id === item.productId);
              const originalQty = originalItemQuantities[index] || 0;
              const availableQty = product
                ? product.productQuantityremaining + originalQty
                : 0;
              const itemTotal = product ? product.productPrice * item.item_quantity : 0;

              return (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-blue-600">Product #{index + 1}</h3>
                    {formData.items.length > 1 && (
                      <button
                        onClick={() => EditremoveItem(index)}
                        className="text-red-500 text-sm hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Row 1: Product selector, Price, Available */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Product</label>
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemEditChange(index, 'productId', e.target.value)}
                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- Select Product --</option>
                        {getFilteredEditOptions(index).map((product) => (
                          <option key={product._id} value={product._id}>
                            {product.productName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Price</label>
                      <div className="bg-gray-100 px-3 py-2 rounded border">{`₹${product?.productPrice ?? '--'}`}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Available</label>
                      <div className="bg-gray-100 px-3 py-2 rounded border text-center"> {availableQty}</div>
                    </div>
                  </div>

                  {/* Row 2: Quantity, Total */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Quantity</label>
                      <input
                        type="number"
                        min={1}
                        max={
                          availableQty
                        }
                        value={item.item_quantity || ''}
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
                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      />
                      {warnings[index] && (
                        <p className="text-xs text-red-500 mt-1">{warnings[index]}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Total</label>
                      <div className="bg-gray-100 px-3 py-2 rounded border">{`₹${itemTotal.toFixed(2)}`}</div>
                    </div>
                  </div>

                  {/* Row 3: Serial No & Model */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Serial No./IMEI No.</label>
                      <input
                        type="number"
                        value={item.item_serial || ''}
                        onChange={(e) => handleItemEditChange(index, 'item_serial', e.target.value)}
                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Model No</label>
                      <input
                        type="text"
                        value={item.item_model || ''}
                        onChange={(e) => handleItemEditChange(index, 'item_model', e.target.value)}
                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Brand </label>
                      <input
                        type="text"
                        value={item.item_brand || ''}
                        onChange={(e) => handleItemEditChange(index, 'item_brand', e.target.value)}
                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Catagory </label>
                      <input
                        type="text"
                        value={item.item_catagory || ''}
                        onChange={(e) => handleItemEditChange(index, 'item_catagory', e.target.value)}
                        className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add Product Row Button */}
            <button
              onClick={EditaddItem}
              className="text-sm bg-gray-200 px-3 py-2 rounded hover:bg-gray-300 shadow"
            >
              + Add Product Row
            </button>
          </div>

          {/* Section: Extra Details */}
          {/* <div className="space-y-4">
            <h2 className="text-lg font-semibold text-blue-700 border-b pb-1">Invoice Info</h2>


          </div> */}

          <div>
            <label className="block text-sm font-medium text-gray-700">Warranty</label>
            <select
              name="warranty"


              value={isselectedInvoice.warranty}
              onChange={(e) => setSelectedInvoice({ ...isselectedInvoice, warranty: e.target.value })}
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Warranty</option>
              <option value="3 months">3 Months</option>
              <option value="6 months">6 Months</option>
              <option value="1 year">1 Year</option>
              <option value="2 years">2 Years</option>
              <option value="3 years">3 Years</option>
              <option value="5 years">5 Years</option>
              <option value="Lifetime">Lifetime</option>
            </select>
          </div>

          <div className="mt-3">
            <label htmlFor="note" className="block text-sm font-semibold text-gray-700 mb-1">
              Notes:
            </label>
            <textarea
              name="note"
              id="note"
              rows={4}
              placeholder="Describe..."
              value={isselectedInvoice.note || ''}
               onChange={(e) => setSelectedInvoice({ ...isselectedInvoice, note: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            ></textarea>
          </div>


          {/* Footer Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="bg-red-500 text-white px-5 py-2 rounded hover:bg-red-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSaleEdit}
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              {isSubmitting ? "updating..." : "Invoice Update"}
            </button>
          </div>
        </div>
      </Modal>





      {navigating && (
        <div className="fixed inset-0  bg-opacity-60 flex items-center justify-center z-50">
          <Image
            src="/assets/6-dots-rotate.svg"
            width={100}
            height={100}
            alt="Loading"
            className="w-10 h-10 animate-bounce"
          />
        </div>
      )}


    </div>
  )
}

export default Page
