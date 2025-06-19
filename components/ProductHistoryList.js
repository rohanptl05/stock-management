import React from 'react'
import {productHistoryDelete} from "@/app/api/actions/productHistoryactions"
import { toast } from 'sonner';

const ProductHistoryList = ({product,index,setSelectedProductQue,setIsEditModalOpen,fetchData}) => {

  const handleDeleted = async () => {
    
    toast.warning("Are you sure you want to delete this record?", {
      action: {
        label: "Yes, Delete",
        onClick: async () => {
           try {
      const res = await productHistoryDelete(product._id);
      if (res.status === 200) {
      
        toast.success("Product history successfully deleted.")
        
        fetchData();
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
     <tr key={product._id}>
           
            <td className="border-b sm:px-4 sm:py-2 px-1 py-1 whitespace-nowrap font-bold"> {index}</td>
            
            <td className="border-b sm:px-4 sm:py-2 px-1 py-1 whitespace-nowrap">{product.productQuantity}</td>
         
            <td className="border-b sm:px-4 sm:py-2 px-1 py-1 whitespace-nowrap">
                {new Date(product.date).toLocaleDateString('en-GB')}
            </td>
          
            <td className="border-b sm:px-4 sm:py-2 px-1 py-1 whitespace-nowrap">
              
                <button onClick={() => { setSelectedProductQue(product); setIsEditModalOpen(true); }} className="bg-yellow-500 text-white px-2 py-1 rounded mx-2"><i className="fa-solid fa-pen-to-square"></i></button>
                <button onClick={() => {handleDeleted()}} className="bg-red-500 text-white px-2 py-1 rounded mx-2"><i className="fa-solid fa-trash"></i></button>
               
            </td>
        </tr>
  )
}

export default ProductHistoryList
