import React from 'react'
import { RestoreInvoice } from '@/app/api/actions/invoiceactions';
import { toast } from 'sonner';


const DeActiveinvoices = ({invoice,fetchData}) => {
     const handleRestore = async () => {


        toast.warning("Are you sure you want to delete this record?", {
      action: {
        label: "Yes, Delete",
        onClick: async () => {
            const response = await RestoreInvoice(invoice._id);
                if (response.success) {
                    toast.success("Restore successfully!");
                    
                    fetchData();
                } else {
                    toast.error("Failed to Restore.");
                }
           
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {
          toast.info("Delete cancelled");
        },
      },
    }
    );
          
          
        };
  return (
    <tr className='hover:bg-gray-50 transition duration-300 border-b'>
    <td className="px-4 py-2">{invoice.invoiceNumber}</td>
    <td className="px-4 py-2" title={invoice.client.name}>
  {invoice.client.length > 15 
    ? invoice.client.slice(0, 10) + '...' 
    : invoice.client}
</td>
    <td className="px-4 py-2">{invoice.grandTotal}</td>

    <td className="px-4 py-2">
      {/* actions here */}
      <button type="button" onClick={handleRestore} className="text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 shadow-lg shadow-green-500/50 dark:shadow-lg dark:shadow-green-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"><i className="fa-solid fa-trash-arrow-up"></i></button>
        
    </td>
  </tr>
  )
}

export default DeActiveinvoices
