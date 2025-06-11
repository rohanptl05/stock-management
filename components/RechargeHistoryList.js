"use client"
import React from 'react'
import {deleteRechargeHistory} from "@/app/api/actions/rechargeHistoryactions"

const RechargeHistoryList = ({ rechargehistory, index,setSelectedRechargeHistory,setIsEditHistoryModalOpen,fetchData }) => {
  // console.log(rechargehistory, "RechargehistoryData")
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this recharge history?")) {
      try {
        const response = await deleteRechargeHistory(rechargehistory._id)
        if (response.status === 200) {
          alert(response.message);
          fetchData();
          // Optionally, you can trigger a refresh of the list or update the state here
        } else {
          alert("Failed to delete recharge history.");
        }
      } catch (error) {
        console.error("Error deleting recharge history:", error);
        alert("An error occurred while deleting recharge history.");
      }
    }
  };
  return (
    <tr key={rechargehistory._id}>
      <td className="border-b sm:px-4 sm:py-2 px-2 py-1 whitespace-nowrap  font-bold"> {index + 1}</td>

      <td className="border-b sm:px-4 sm:py-2 px-2 py-1 whitespace-nowrap ">{rechargehistory?.addBalance?.toFixed(2)}</td>
      <td className="border-b sm:px-4 sm:py-2 px-2 py-1 whitespace-nowrap ">{rechargehistory?.useBalance?.toFixed(2)}</td>
      <td className="border-b sm:px-4 sm:py-2 px-2 py-1 whitespace-nowrap ">
        {rechargehistory?.date ? new Date(rechargehistory.date).toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
          : '-'}
      </td>



      <td className="border-b sm:px-4 sm:py-2 px-2 py-1 whitespace-nowrap ">
        {/* Add any action buttons here, e.g., Edit, Delete */}
        <button
          onClick={() => {setSelectedRechargeHistory(rechargehistory) ; setIsEditHistoryModalOpen(true)}}
          className="bg-green-500 text-white sm:px-4 sm:py-2 px-2 py-1 whitespace-nowrap rounded hover:bg-green-600 mr-2"
        >
        <i className="fa-solid fa-pen-to-square"></i>
        </button>


    
        <button
          onClick={handleDelete}
          className="bg-red-500 text-white sm:px-4 sm:py-2 px-2 py-1 whitespace-nowrap rounded hover:bg-red-600"
        >
          <i className="fa-solid fa-trash"></i>
        </button>

      </td>
    </tr>
  )
}

export default RechargeHistoryList
