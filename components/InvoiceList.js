'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
import { invoiceDelete } from '@/app/api/actions/invoiceactions';
import { toast } from 'sonner';

const InvoiceList = ({ invoice, setSelectedInvoice, setIsEditModalOpen, fetchData, openEditModal,setNavigating }) => {
  const router = useRouter(); 

  const handleDeleted = async () => {


  toast.warning("Are you sure you want to delete this record?", {
      action: {
        label: "Yes, Delete",
        onClick: async () => {
       try {
      const res = await invoiceDelete(invoice._id);
      if (res.status === 200) {
        toast.success(res.message);
        fetchData();
      } else {
        toast.error(res.message || "Failed to delete record.");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Something went wrong while deleting.");
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

  const handleView = () => {
    setNavigating(true)
     setTimeout(() => {
      router.push(`salesproduct/${invoice._id}`);
    }, 300);
    
  };

  return (
    <tr key={invoice._id}>
      <td className="border-b sm:px-4 sm:py-2 px-2 py-1 hidden sm:table-cell whitespace-nowrap font-bold">{invoice.invoiceNumber}</td>
      <td className="border-b sm:px-4 sm:py-2 px-2 py-1 whitespace-nowrap text-center">
  
  <span className="hidden sm:inline">
    {
  invoice.client
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

  </span>

 
  <span className="inline sm:hidden">
    {
  invoice.client.length > 7
    ? (  invoice.client
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')).slice(0, 7) + "..."
    : invoice.client.charAt(0).toUpperCase() + invoice.client.slice(1).toLowerCase()
}

 </span>
</td>



      <td className="border-b sm:px-4 sm:py-2 px-2 py-1 whitespace-nowrap ">
        {new Date(invoice.date).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })}
      </td>
      <td className="border-b sm:px-4 sm:py-2 px-2 py-1 whitespace-nowrap hidden sm:table-cell">{invoice.grandTotal}</td>
      <td className="border-b sm:px-4 sm:py-2 px-2 py-1 whitespace-nowrap">
        <button
          onClick={handleView}
          className="bg-blue-500 text-white px-2 py-1 rounded mx-2"
        >
          <i className="fa-solid fa-file-invoice"></i>
        </button>
        <button
          onClick={() => {
           
            openEditModal(invoice);
           
          }}
          className="bg-green-500 text-white px-2 py-1 rounded mx-2"
        >
          <i className="fa-solid fa-pen-to-square"></i>
        </button>
        <button
          onClick={handleDeleted}
          className="bg-red-500 text-white px-2 py-1 rounded mx-2"
        >
          <i className="fa-solid fa-trash"></i>
        </button>
      </td>
    </tr>
  );
};

export default InvoiceList;
