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
              name="clientAddress"
              value={isselectedInvoice.clientAddress}
              onChange={(e) => setSelectedInvoice({ ...isselectedInvoice, clientAddress: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="font-semibold mb-1 text-sm text-gray-700">Customer Phone</label>
            <input
              type="text"
              name="clientPhone"
              value={isselectedInvoice.clientPhone}
              onChange={handlePhoneChange}
              maxLength={10}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                }`}
            />
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
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
                          className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 capitalize"
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
            className="bg-gray-200 text-gray-800 sm:px-4 sm:py-2 px-2 py-1 rounded shadow hover:bg-gray-300 transition duration-150"
          >
            + Add Product Row
          </button>


          <div>
            <label className=" font-semibold mb-1 text-sm text-gray-700">
              Customer ID
            </label>
            <input
              type="text"
              name="customerID"

              value={isselectedInvoice.customerID}
              onChange={(e) => setSelectedInvoice({ ...isselectedInvoice, customerID: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="font-semibold mb-1 text-sm text-gray-700">
              PRODUCT WARRANTY:
            </label>
            <select
              name="warranty"
              value={isselectedInvoice.warranty}
              onChange={(e) => setSelectedInvoice({ ...isselectedInvoice, warranty: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Warranty</option>
              <option value="3 months">3 Months</option>
              <option value="6 months">6 Months</option>
              <option value="1 year">1 Year</option>
              <option value="2 years">2 Years</option>
              <option value="3 years">3 Years</option>
              <option value="5 years">5 Years</option>
              <option value="Lifetime">Lifetime Warranty</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="bg-red-500 text-white sm:px-4 sm:py-2 px-2 py-1 rounded hover:bg-red-600 transition duration-150"
            >
              Close
            </button>

            <button
              onClick={handleSaleEdit}
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition duration-150"
            >
              {isSubmitting ? "updating..." : "Invoice Update"}
            </button>
          </div>
        </div>
      </Modal>