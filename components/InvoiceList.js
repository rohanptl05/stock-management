'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // ✅ Correct for App Router
import { invoiceDelete } from '@/app/api/actions/invoiceactions';

const InvoiceList = ({ invoice, setSelectedInvoice, setIsEditModalOpen, fetchData, openEditModal }) => {
  const router = useRouter(); // ✅ useRouter from 'next/navigation'

  const handleDeleted = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this invoice record?");
    if (!confirmDelete) return;

    try {
      const res = await invoiceDelete(invoice._id);
      if (res.status === 200) {
        alert(res.message);
        fetchData();
      } else {
        alert(res.message || "Failed to delete record.");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Something went wrong while deleting.");
    }
  };

  const handleView = () => {
    router.push(`salesproduct/${invoice._id}`); // ✅ programmatic navigation
  };

  return (
    <tr key={invoice._id}>
      <td className="border-b sm:px-4 sm:py-2 px-2 py-1 hidden sm:table-cell whitespace-nowrap font-bold">{invoice.invoiceNumber}</td>
      <td className="border-b sm:px-4 sm:py-2 px-2 py-1 whitespace-nowrap text-center">
  {/* Full client name on desktop */}
  <span className="hidden sm:inline">
    {invoice.client}
  </span>

  {/* Truncated name (max 7 chars) on mobile */}
  <span className="inline sm:hidden">
    {invoice.client.length > 7 ? `${invoice.client.slice(0, 7)}...` : invoice.client}
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
            // setSelectedInvoice(invoice);
            // setIsEditModalOpen(true);
            openEditModal(invoice);
            // setSelectedOrinalInvoice(invoice);
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
