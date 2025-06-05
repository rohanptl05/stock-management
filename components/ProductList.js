import React from 'react'
import Link from 'next/link'
import { productDelete } from "@/app/api/actions/productactions"

const ProductList = ({ product, setSelectedProduct, setIsEditModalOpen, setViewopen, setIsQuantityOpen, fetchData }) => {
    const handleDeleted = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete this record?");
        if (!confirmDelete) return;

        try {
            const res = await productDelete(product._id);
            if (res.status === 200) {
                alert("Product history successfully deleted.");

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
            <td className="border-b sm:px-4 sm:py-2 px-2 py-1 whitespace-nowrap font-bold uppercase"> <Link href={`addproduct/${product._id}?name=${encodeURIComponent(product.productName)}`} className="hover:text-blue-900">{product.productName}</Link></td>

            <td className="border-b sm:px-4 sm:py-2 px-2 py-1 hidden sm:table-cell whitespace-nowrap">{product.productId}</td>
            <td className="border-b sm:px-4 sm:py-2 px-2 py-1 whitespace-nowrap">{product.productQuantity}</td>
            <td className={`border-b border-black sm:px-4 sm:py-2 px-2 py-1 whitespace-nowrap `}>
                {Number(product.productQuantityremaining)}
            </td>
            <td className="border-b sm:px-4 sm:py-2 px-2 py-1 whitespace-nowrap hidden sm:table-cell">{product.productPrice}</td>

            <td className="border-b sm:px-4 sm:py-2 px-2 py-1 whitespace-nowrap">
                <button onClick={() => { setSelectedProduct(product); setIsQuantityOpen(true); }} className="bg-green-500 text-white sm:px-2 sm:py-1 rounded sm:mx-2 px-1 py-0.5  mx-1" title='Add Quantity'><i className="fa-regular fa-square-plus"></i></button>
                <button onClick={() => { setSelectedProduct(product); setViewopen(true) }} className="bg-blue-500 text-white sm:px-2 sm:py-1 rounded sm:mx-2 px-1 py-0.5 mx-1"><i className="fa-solid fa-eye"></i></button>
                <button onClick={() => { setSelectedProduct(product); setIsEditModalOpen(true); }} className="bg-yellow-500 text-white sm:px-2 sm:py-1 rounded sm:mx-2 px-1 py-0.5 mx-1"><i className="fa-solid fa-pen-to-square"></i></button>
                <button onClick={() => { handleDeleted() }} className="bg-red-500 text-white sm:px-2 sm:py-1 rounded sm:mx-2 px-1 py-0.5 mx-1"> <i className="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    )
}

export default ProductList
