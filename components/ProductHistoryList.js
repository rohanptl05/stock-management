import React from 'react'
import {productHistoryDelete} from "@/app/api/actions/productHistoryactions"

const ProductHistoryList = ({product,index,setSelectedProductQue,setIsEditModalOpen,fetchData}) => {

  const handleDeleted = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this record?");
    if (!confirmDelete) return;

    try {
      const res = await productHistoryDelete(product._id);
      if (res.status === 200) {
        alert("Product history successfully deleted.");
        // Optional: trigger a state update or refetch from parent
        // window.location.reload(); // OR lift a refetch handler from the parent
        fetchData();
      } else {
        alert(res.message || "Failed to delete record.");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Something went wrong while deleting.");
    }
  };
  return (
     <tr key={product._id}>
           
            <td className="border-b px-4 py-2 whitespace-nowrap font-bold"> {index  }</td>
            
            <td className="border-b px-4 py-2 whitespace-nowrap">{product.productQuantity}</td>
         
            <td className="border-b px-4 py-2 whitespace-nowrap">
                {new Date(product.date).toLocaleDateString('en-GB')}
            </td>
          
            <td className="border-b px-4 py-2 whitespace-nowrap">
              
                <button onClick={() => { setSelectedProductQue(product); setIsEditModalOpen(true); }} className="bg-yellow-500 text-white px-2 py-1 rounded mx-2"><i className="fa-solid fa-pen-to-square"></i></button>
                <button onClick={() => {handleDeleted()}} className="bg-red-500 text-white px-2 py-1 rounded mx-2"><i className="fa-solid fa-trash"></i></button>
               
            </td>
        </tr>
  )
}

export default ProductHistoryList
