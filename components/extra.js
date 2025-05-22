'use client'
import React, { useEffect, useState } from 'react'
import { fetchProducts } from '@/app/api/actions/productactions'
import { useSession } from 'next-auth/react'
import { ADDinvoice } from '@/app/api/actions/invoiceactions'

const Page = () => {
  const { data: session } = useSession()
  const [products, setProducts] = useState([])
  const [warnings, setWarnings] = useState([])
  const [formData, setFormData] = useState({
    client: "",
    user: typeof window !== "undefined" ? sessionStorage.getItem("id") : "",
    items: [
      { item_name: '', item_price: '', productId: '', item_quantity: 1, total: 0 }
    ],
    grandTotal: 0,
    received_amount: 0,
    balance_due_amount: 0,
    imageURL: ""
  })

  useEffect(() => {
    if (session?.user?.id) {
      fetchData()
    }
  }, [session?.user?.id])

  const fetchData = async () => {
    const res = await fetchProducts(session?.user?.id, 'active')
    setProducts(res)
  }

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
      }
    }

    setFormData(prev => ({ ...prev, items: updatedItems }))

    const isValid = updatedItems.every(item => !isNaN(parseInt(item.item_quantity)))
    if (isValid) {
      validateQuantities(updatedItems)
    }
  }

  const addItem = () => {
    const newItems = [...formData.items, {
      productId: '',
      item_name: '',
      item_price: '',
      item_quantity: 1,
      total: 0
    }]
    setFormData(prev => ({ ...prev, items: newItems }))
  }

  const removeItem = (index) => {
    const newItems = [...formData.items]
    newItems.splice(index, 1)
    setFormData(prev => ({ ...prev, items: newItems }))
    validateQuantities(newItems)
  }

  const validateQuantities = (itemList) => {
    const warningList = []
    itemList.forEach((item, index) => {
      const product = products.find(p => p._id === item.productId)
      if (product && item.item_quantity > product.productQuantity) {
        warningList[index] = `Only ${product.productQuantity} available`
      } else {
        warningList[index] = ''
      }
    })
    setWarnings(warningList)
  }

  const handleSale = async () => {
    if (warnings.some(w => w)) {
      alert('Fix quantity warnings before submitting.')
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

    if (formData.items.some(item => !item.item_quantity || isNaN(item.item_quantity) || parseInt(item.item_quantity) <= 0)) {
      alert('Please enter valid quantity for all items.')
      return
    }

    const preparedItems = formData.items.map(item => ({
      item_name: item.item_name,
      item_price: item.item_price,
      productId: item.productId,
      item_quantity: item.item_quantity,
      total: item.total
    }))

    const grandTotal = preparedItems.reduce((sum, item) => sum + item.total, 0)

    const saleData = {
      client: formData.client,
      grandTotal,
      items: preparedItems,
      user: session?.user?.id
    }

    console.log("Final saleData to send:", saleData)

    // try {
    //   const res = await ADDinvoice(saleData)
    //   if (res) {
    //     alert('Invoice created successfully!')
    //     setFormData({
    //       client: "",
    //       user: session?.user?.id,
    //       items: [
    //         { item_name: '', item_price: '', productId: '', item_quantity: 1, total: 0 }
    //       ],
    //       grandTotal: 0,
    //       received_amount: 0,
    //       balance_due_amount: 0,
    //       imageURL: ""
    //     })
    //     fetchData()
    //   }
    // } catch (err) {
    //   console.error(err)
    //   alert(err?.response?.data?.message || 'Something went wrong')
    // }
  }

  const getFilteredOptions = (currentIndex) => {
    const selectedIds = formData.items
      .map((item, idx) => idx !== currentIndex && item.productId)
      .filter(Boolean)
    return products.filter(p => !selectedIds.includes(p._id))
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Sale Invoice</h1>

      <div className="mb-4">
        <label className="block font-medium mb-1">Customer Name</label>
        <input
          type="text"
          className="border p-2 w-full"
          value={formData.client}
          name="client"
          onChange={(e) =>
            setFormData(prev => ({ ...prev, client: e.target.value }))
          }
        />
      </div>

      <table className="w-full border border-collapse mb-4">
        <thead className="bg-gray-200 text-left">
          <tr>
            <th className="border p-2">Product</th>
            <th className="border p-2 text-center">Available</th>
            <th className="border p-2 text-center">Price</th>
            <th className="border p-2 text-center">Quantity</th>
            <th className="border p-2 text-center">Total</th>
            <th className="border p-2 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {formData.items.map((item, index) => {
            const product = products.find(p => p._id === item.productId)
            const itemTotal = product ? product.productPrice * item.item_quantity : 0

            return (
              <tr key={index} className="bg-white">
                <td className="border p-2">
                  <select
                    className="border p-1 w-full"
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
                <td className="border p-2 text-center">
                  {product ? product.productQuantity : '--'}
                </td>
                <td className="border p-2 text-center">
                  {product ? `₹${product.productPrice}` : '--'}
                </td>
                <td className="border p-2">
                  <input
                    type="number"
                    min={1}
                    className="border p-1 w-full"
                    value={item.item_quantity}
                    onChange={(e) =>
                      handleItemChange(index, 'item_quantity', e.target.value)
                    }
                  />
                  {warnings[index] && (
                    <p className="text-red-600 text-xs">{warnings[index]}</p>
                  )}
                </td>
                <td className="border p-2 text-center">
                  ₹{itemTotal.toFixed(2)}
                </td>
                <td className="border p-2 text-center">
                  {formData.items.length > 1 && (
                    <button
                      onClick={() => removeItem(index)}
                      className="text-red-600 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            )
          })}

          <tr className="bg-gray-100 font-semibold">
            <td colSpan="4" className="border p-2 text-right">
              Grand Total
            </td>
            <td className="border p-2 text-center" colSpan="2">
              ₹{formData.items.reduce((acc, item) => {
                const product = products.find(p => p._id === item.productId)
                return acc + (product ? product.productPrice * item.item_quantity : 0)
              }, 0).toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>

      <button
        onClick={addItem}
        className="bg-gray-300 text-black px-4 py-2 rounded mb-4"
      >
        + Add Product Row
      </button>

      <div className="text-right">
        <button
          onClick={handleSale}
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          Create Invoice
        </button>
      </div>
    </div>
  )
}

export default Page
