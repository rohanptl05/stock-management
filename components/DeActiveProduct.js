import React from 'react'
import { RestoreProduct } from '@/app/api/actions/productactions';

const DeActiveProduct = ({ index, product, fetchData }) => {
    // console.log(product)
    const handleRestore = async () => {
        if (window.confirm("Are you sure you want to Restore this Product?")) {
            const response = await RestoreProduct(product._id);
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
            <td className="px-4 py-2">{product.productId}</td>
            <td className="px-4 py-2" title={product.productName}>
                {product.productName.length > 15
                    ? product.productName.slice(0, 10) + '...'
                    : product.productName}
            </td>
            <td className="px-4 py-2">{product.productPrice
            }</td>

            <td className="px-4 py-2">
                {/* actions here */}
                <button type="button" onClick={handleRestore} className="text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 shadow-lg shadow-green-500/50 dark:shadow-lg dark:shadow-green-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"><i className="fa-solid fa-trash-arrow-up"></i></button>

            </td>
        </tr>
    )
}


export default DeActiveProduct
