"use client"
import React from 'react'
import { DeleteExinvoices } from '@/app/api/actions/extraexpenseactions';
import { toast } from 'sonner';

const ExtraExpensesList = ({ exinvoice, index, updateExInvoice, getData }) => {



  const handleDelete = async () => {

  toast.warning("Are you sure you want to delete this record?", {
      action: {
        label: "Yes, Delete",
        onClick: async () => {
           try {
      const res = await DeleteExinvoices(exinvoice._id);
      if (res.status === 200) {
      
        toast.success(" successfully deleted.")
        
        getData();
      } else {
      
        toast.error(res.message || "Failed to delete record.")
      }
    } catch (error) {
      console.error("Delete failed:", error);
      
      toast.error("Something went wrong while deleting.")
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
    <>
      <tr className=" hover:bg-gray-50 transition duration-300 border-b text-center">
     
        <td className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-900">
          {index + 1}
        </td>
        <td className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-900">
          {exinvoice.date
            ? new Date(exinvoice.date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
            : "N/A"}
        </td>
        <td className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-900">
          {exinvoice.expensetype}
        </td>
        <td className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-900" title={exinvoice.description}>
          {exinvoice.description.length > 100
            ? `${exinvoice.description.slice(0, 25)}...`
            : exinvoice.description}
        </td>
        <td className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-900">
          ₹ {exinvoice.amount}
        </td>
        <td className="px-3 py-2 text-xs sm:text-sm font-medium  text-gray-900">
          <button
            onClick={() => updateExInvoice(exinvoice)}
            className="bg-green-600 text-white px-3 py-1 mx-1 rounded-lg text-xs md:text-sm md:px-4 hover:bg-green-700 transition duration-300 shadow-md"
          >
          <i className="fa-solid fa-pen-to-square"></i>
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-3 py-1 mx-1 rounded-lg text-xs md:text-sm md:px-4 hover:bg-red-600 transition duration-300 shadow-md"
          >
          <i className="fa-solid fa-trash"></i>
          </button>
        </td>

      </tr>



    </>
  )
}

export default ExtraExpensesList
