"use client"
import React, { useState, useEffect } from 'react'
import { fetchInvoices } from '@/app/api/actions/invoiceactions'
import { GETExpenseDeactiveted } from '@/app/api/actions/extraexpenseactions'
import { fetchProducts } from '@/app/api/actions/productactions'
import { useSession } from 'next-auth/react'
import DeActiveinvoices from '@/components/DeActiveinvoices'
import Image from 'next/image'

import DeActiveProduct from '@/components/DeActiveProduct'
import DeActiveExtraExpence from '@/components/DeActiveExtraExpence'

const ITEMS_PER_PAGE = 6

const RecycleBinPage = () => {
    const [invoices, setInvoices] = useState([])
    const [product, setProduct] = useState([])
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null)
    const { data: session, status: sessionStatus } = useSession({
  required: true,
  onUnauthenticated() {
    router.push('/login');
  },
});
    const [ExtraExpense, setExtraExpense] = useState([])

    // Pagination state
    const [invoicePage, setInvoicePage] = React.useState(1)
    const [productPage, setProductPage] = React.useState(1)
    const [ExtraexpPage, setExtraexpPage] = React.useState(1)

    const fetchInvoicess = async () => {
        setIsLoading(true)
        try {
            const userId = session?.user?.id
            const response = await fetchInvoices(userId, "deactivated")
            if (response.error) {
                setError(response.error)
            } else {
                //   console.log(response)

                setInvoices(Array.isArray(response) ? response : [])

            }
            const res = await GETExpenseDeactiveted(userId);
            if (res.error) {
                setError(res.error)
            }
            else {

                setExtraExpense(Array.isArray(res) ? res : [])


            }

            const prod = await fetchProducts(userId, "deactivated")
            if (prod) {
                // console.log(prod)

                setProduct(Array.isArray(prod) ? prod : [])
            }

        } catch (error) {
            setError("Failed to fetch invoices")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (session) {
            fetchInvoicess()
        }
    }, [session])

    // Pagination logic
    const paginate = (data, page) => {
        const start = (page - 1) * ITEMS_PER_PAGE
        return data.slice(start, start + ITEMS_PER_PAGE)
    }

    const totalInvoicePages = Math.ceil(invoices.length / ITEMS_PER_PAGE)
    const totalProductPages = Math.ceil(product.length / ITEMS_PER_PAGE)
    const totalExtraExpPages = Math.ceil(ExtraExpense.length / ITEMS_PER_PAGE)


    if (sessionStatus === "loading") {
        return <h1>Loading...</h1>;
    }
    return (
        <div className="container   mx-auto px-4 py-6">
            <h1 className="sm:text-3xl text:xl font-bold text-center bg-emerald-500 text-white py-3 rounded-md shadow mb-6">
                Recycle Bin
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6  rounded-lg text-xs sm:text-sm ">
                {/* Invoices Table */}
                <div className="shadow-lg rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-blue-900 text-white px-3 py-2 sm:px-4 sm:py-3">
                        <h2 className="text-base sm:text-lg font-semibold">Invoices</h2>
                    </div>

                    {/* Table Scroll */}
                    <div className="sm:w-full h-[62vh]">
                        <table className=" w-full text-[10px] sm:text-sm text-center text-gray-200">
                            <thead className="bg-blue-800 uppercase text-[11px] sm:text-xs">
                                <tr>
                                    <th className="px-2 py-2 sm:px-4 sm:py-3">Invoice No.#</th>
                                    <th className="px-2 py-2 sm:px-4 sm:py-3">Client Name</th>
                                    <th className="px-2 py-2 sm:px-4 sm:py-3">Total</th>
                                    <th className="px-2 py-2 sm:px-4 sm:py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-black">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="18" className="px-4 py-4 text-center">
                                            <Image
                                                width={2000}
                                                height={2000}
                                                src="/assets/infinite-spinner.svg"
                                                alt="Loading..."
                                                className="w-6 h-6 mx-auto"
                                            />
                                        </td>
                                    </tr>
                                ) : invoices.length > 0 ? (paginate(invoices, invoicePage).map((invoice, index) => (
                                    <DeActiveinvoices key={invoice._id || index} invoice={invoice} fetchData={fetchInvoicess} />
                                ))) : (
                                    <tr>
                                        <td colSpan="8" className="px-4 py-4 text-center text-gray-500">
                                            No Invoice found.
                                        </td>
                                    </tr>
                                )}

                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center items-center p-3 gap-2 text-[11px] sm:text-sm">
                        <button
                            onClick={() => setInvoicePage(p => Math.max(p - 1, 1))}
                            disabled={invoicePage === 1 || invoices.length === 0}
                            className="px-2 py-1 sm:px-3 sm:py-1 bg-blue-700 text-white rounded disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <span className="text-white">{invoicePage} / {totalInvoicePages || 1}</span>
                        <button
                            onClick={() => setInvoicePage(p => Math.min(p + 1, totalInvoicePages))}
                            disabled={invoicePage === totalInvoicePages || invoices.length === 0}
                            className="px-2 py-1 sm:px-3 sm:py-1 bg-blue-700 text-white rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>


                {/* Received Amount Table */}
                <div className="shadow-lg rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-yellow-500  text-white px-3 py-2 sm:px-4 sm:py-3">
                        <h2 className="text-base sm:text-lg font-semibold">Product Items</h2>
                    </div>
                    <div className="sm:w-full h-[62vh]">
                        <table className=" w-full text-[10px] sm:text-sm text-center ">
                            <thead className="bg-yellow-200 uppercase text-[11px] sm:text-xs">
                                <tr>
                                    <th className="px-2 py-2 sm:px-4 sm:py-3">Invoice No.#</th>
                                    <th className="px-2 py-2 sm:px-4 sm:py-3">Product Name</th>
                                    <th className="px-2 py-2 sm:px-4 sm:py-3">Quenty</th>
                                    <th className="px-2 py-2 sm:px-4 sm:py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-yellow-200">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="18" className="px-4 py-4 text-center">
                                            <Image
                                                width={2000}
                                                height={2000}
                                                src="/assets/infinite-spinner.svg"
                                                alt="Loading..."
                                                className="w-6 h-6 mx-auto"
                                            />
                                        </td>
                                    </tr>
                                ) : product.length > 0 ? (paginate(product, productPage).map((product, index) => (
                                    // <DeActiveProductlist key={product._id || index} />
                                    <DeActiveProduct key={product._id || index} product={product} fetchData={fetchInvoicess} />
                                ))) : (
                                    <tr>
                                        <td colSpan="4" className="py-4 text-center text-sm text-gray-700">
                                            No product  found
                                        </td>
                                    </tr>
                                )}

                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Controls */}
                    <div className="flex justify-center items-center p-4 gap-2">
                        <button
                            onClick={() => setProductPage(p => Math.max(p - 1, 1))}
                            disabled={productPage === 1 || product.length === 0}
                            className="px-3 py-1 bg-yellow-500 text-white rounded disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <span className="text-gray-900">{productPage} / {totalProductPages || 1}</span>
                        <button
                            onClick={() => setProductPage(p => Math.min(p + 1, totalProductPages))}
                            disabled={productPage === totalProductPages || product.length === 0}
                            className="px-3 py-1 bg-yellow-500 text-white rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>

                </div>












                {/* 3rd Extra Expence */}
                <div className="shadow-lg rounded-lg overflow-hidden">
                    <div className="bg-purple-500 text-white px-3 py-2 sm:px-4 sm:py-3">
                        <h2 className="text-base sm:text-lg font-semibold">Extra-Expence Amount</h2>
                    </div>
                    <div className="overflow-x-auto h-[62vh]">
                        <table className="w-full text-sm text-center text-gray-800">
                            <thead className="bg-purple-300  uppercase text-[11px] sm:text-xs">
                                <tr>
                                    <th className="px-2 py-2 sm:px-4 sm:py-3">Invoice No.#</th>
                                    <th className="px-2 py-2 sm:px-4 sm:py-3">Expence Type</th>
                                    <th className="px-2 py-2 sm:px-4 sm:py-3">Amount</th>
                                    <th className="px-2 py-2 sm:px-4 sm:py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-yellow-200">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="18" className="px-4 py-4 text-center">
                                            <Image
                                                width={2000}
                                                height={2000}
                                                src="/assets/infinite-spinner.svg"
                                                alt="Loading..."
                                                className="w-6 h-6 mx-auto"
                                            />
                                        </td>
                                    </tr>
                                ) : ExtraExpense.length > 0 ? paginate(ExtraExpense, ExtraexpPage).map((ExtraExp, index) => (

                                    <DeActiveExtraExpence key={ExtraExp._id || index} index={index} ExtraExp={ExtraExp} fetchData={fetchInvoicess} />

                                )) : (
                                    <tr>
                                        <td colSpan="4" className="py-4 text-center text-sm text-gray-700">
                                            No Extra-expence amount found
                                        </td>
                                    </tr>
                                )}

                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Controls */}
                    <div className="flex justify-center items-center p-4 gap-2">
                        <button
                            onClick={() => setExtraexpPage(p => Math.max(p - 1, 1))}
                            disabled={ExtraexpPage === 1 || ExtraExpense.length === 0}
                            className="px-3 py-1 bg-purple-500 text-white rounded disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <span className="text-gray-900">{ExtraexpPage} / {totalExtraExpPages || 1}</span>
                        <button
                            onClick={() => setExtraexpPage(p => Math.min(p + 1, totalExtraExpPages))}
                            disabled={ExtraexpPage === totalExtraExpPages || ExtraExpense.length === 0}
                            className="px-3 py-1 bg-purple-500 text-white rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default RecycleBinPage