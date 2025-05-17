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
    const available = (Number(product.productQuantity) || 0) - (Number(product.productQuantityUse) || 0);

    return (
        <tr key={product._id}>
            <td className="border-b px-4 py-2 whitespace-nowrap font-bold"> <Link href={`addproduct/${product._id}`} className="hover:text-blue-900">{product.productName}</Link></td>

            <td className="border-b px-4 py-2 whitespace-nowrap">{product.productId}</td>
            <td className="border-b px-4 py-2 whitespace-nowrap">{product.productQuantity}</td>
            <td className={`border-b border-black px-4 py-2 whitespace-nowrap ${available < 5 ? 'text-red-500 font-semibold' : ''}`}>
                {available}
            </td>
            <td className="border-b px-4 py-2 whitespace-nowrap">{product.productPrice}</td>

            <td className="border-b px-4 py-2 whitespace-nowrap">
                <button onClick={() => { setSelectedProduct(product); setIsQuantityOpen(true); }} className="bg-green-500 text-white px-2 py-1 rounded mx-2">Add Quantity</button>
                <button onClick={() => { setSelectedProduct(product); setViewopen(true) }} className="bg-blue-500 text-white px-2 py-1 rounded mx-2">View</button>
                <button onClick={() => { setSelectedProduct(product); setIsEditModalOpen(true); }} className="bg-yellow-500 text-white px-2 py-1 rounded mx-2">Edit</button>
                <button onClick={() => { handleDeleted() }} className="bg-red-500 text-white px-2 py-1 rounded mx-2">Delete</button>
            </td>
        </tr>
    )
}

export default ProductList
