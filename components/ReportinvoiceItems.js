import React from 'react'

const ReportinvoiceItems = ({invoices }) => {
    // console.log("itempage",invoices)
  return (
 

<tr className="sm:table-row hover:bg-gray-50 transition duration-300 border-b sm:border-b  py-5 text-center ">
  {/* Invoice Number */}
  <td className="px-3 py-3 font-medium text-gray-900  sm:table-cell">
   {invoices.invoiceNumber}
  </td>

  <td className="px-3 py-3 font-medium text-gray-900 sm:table-cell">
  {/* Mobile view: truncated */}
  <span className="block sm:hidden">
    {invoices.client.name.length > 10
      ? `${invoices.client.name.slice(0, 8)}...`
      : invoices.client.name}
  </span>

  {/* Desktop view: full name */}
  <span className="hidden sm:inline">
    {invoices.client.name}
  </span>
</td>


  <td className="px-3 py-3 font-medium text-gray-900  sm:table-cell">
   
    {new Date(invoices.date).toLocaleDateString("en-IN", {
      year: "numeric", month: "2-digit", day: "2-digit"
    })}
  </td>

  <td className=" px-3 py-3 font-medium text-gray-900  sm:table-cell">
   
    <span className={`px-2 py-1 text-xs font-semibold rounded-md 
      ${invoices.status === "PAID" ? "bg-green-100 text-green-700 text-xs" :
        invoices.status === "PENDING" ? "bg-yellow-100 text-yellow-700 text-xs" :
        "bg-red-100 text-red-700 text-xs"}`}>
      {invoices.status}
    </span>
  </td>

  <td className="px-3 py-3 font-medium text-gray-900  sm:table-cell">
    {invoices.grandTotal}
  </td>

  <td className="px-3 py-3 font-medium text-gray-900  sm:table-cell">
    {invoices.balance_due_amount}
  </td>
</tr>

   
  )
}

export default ReportinvoiceItems
