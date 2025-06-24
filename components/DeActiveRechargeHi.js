import React from 'react'
import { toast } from 'sonner';
import { RestoreRecharge } from '@/app/api/actions/rechargeHistoryactions';

const DeActiveRechargeHi = ({index,recgargeHi,fetchData}) => {
    const handleRestore = async () => {
          toast.warning("Are you sure you want to Restore this record?", {
      action: {
        label: "Yes, Restore",
        onClick: async () => {
        const response = await RestoreRecharge(recgargeHi._id);
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
          toast.info("Restore cancelled");
        },
      },
    }
    );
       
          
       
    };
  return (
    <tr className='hover:bg-gray-50 transition duration-300 border-b'>
 
      <td className="px-4 py-2" title={recgargeHi.operatorName}>
{recgargeHi.operatorName}
      </td>
      <td className="px-4 py-2">{recgargeHi.addBalance}</td>
      <td className="px-4 py-2">{recgargeHi.useBalance}</td>

      <td className="px-4 py-2">
      
        <button type="button" 
        onClick={handleRestore} 
        className="text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 shadow-lg shadow-green-500/50 dark:shadow-lg dark:shadow-green-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"><i className="fa-solid fa-trash-arrow-up"></i></button>

      </td>
    </tr>
  )
}

export default DeActiveRechargeHi
