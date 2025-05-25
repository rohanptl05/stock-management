import React from 'react'
import { RestoreExtraInvoice } from '@/app/api/actions/extraexpenseactions';

const DeActiveExtraExpence = ({ExtraExp,fetchData,index}) => {
    // console.log(ExtraExp)
    const handleRestore = async () => {
                if (window.confirm("Are you sure you want to delete this Extra-exp invoice?")) {
                    const response = await RestoreExtraInvoice(ExtraExp._id);
                    if (response.success) {
                        alert("Restore successfully!");
                        
                        fetchData();
                    } else {
                        alert("Failed to Restore.");
                    }
                }
            };
  return (
    <tr className='hover:bg-gray-50 transition duration-300 border-b'>
    <td className="px-4 py-2">{index + 1 }</td>
    <td className="px-4 py-2" title={ExtraExp.description}>
  {ExtraExp.description.length > 15 
    ? ExtraExp.description.slice(0, 10) + '...' 
    : ExtraExp.description}
</td>
    <td className="px-4 py-2">{ExtraExp.amount}</td>

    <td className="px-4 py-2">
      {/* actions here */}
      <button type="button" onClick={handleRestore} className="text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 shadow-lg shadow-green-500/50 dark:shadow-lg dark:shadow-green-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"><i className="fa-solid fa-trash-arrow-up"></i></button>
        
    </td>
  </tr>
  )
}

export default DeActiveExtraExpence
