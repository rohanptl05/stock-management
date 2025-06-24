import React from 'react'

const ReportinvoiceItems = ({invoices }) => {
    
  return (
 

<tr className="sm:table-row hover:bg-gray-50 transition duration-300 border-b sm:border-b  py-5 text-center ">

  <td className="px-3 py-3 font-medium text-gray-900  sm:table-cell">
   {
  invoices.invoiceNumber

}

  </td>

  <td className="px-3 py-3 font-medium text-gray-900 sm:table-cell">
 
  <span className="block sm:hidden">
    {
  invoices.client.length > 7
    ? (  invoices.client
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')).slice(0, 7) + "..."
    : invoices.client.charAt(0).toUpperCase() + invoices.client.slice(1).toLowerCase()
}
  </span>

 
  <span className="hidden sm:inline">
    {invoices.client}
  </span>
</td>


  <td className="px-3 py-3 font-medium text-gray-900  sm:table-cell">
   
    {new Date(invoices.date).toLocaleDateString("en-IN", {
      year: "numeric", month: "2-digit", day: "2-digit"
    })}
  </td>

 

  <td className="px-3 py-3 font-medium text-gray-900  sm:table-cell">
    {invoices.grandTotal}
  </td>

 
</tr>

   
  )
}

export default ReportinvoiceItems
