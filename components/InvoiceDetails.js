
import React from 'react'
import Image from 'next/image';

const InvoiceDetails = ({ isLoading, invoice, user, reportRef }) => {
    return (
        <div>
            {isLoading ? (
                <div className=' justify-center text-center items-center'>

                    <Image
                        width={2000}
                        height={2000}
                        src="/assets/infinite-spinner.svg"
                        alt="Loading..."
                        className="w-6 h-6 mx-auto"
                    />
                </div>

            ) : invoice ? (

                <div className="max-w-4xl w-full mx-auto shadow shadow-gray-400 rounded-lg bg-white text-black px-6 mt-8  sm:px-6 py-6">

                    <div className="  rounded-t-lg sm:px-6 sm:py-4 px-2 py-1">
                        <h1 className="sm:text-2xl text-sm font-bold text-center uppercase bg-black py-2 text-white tracking-wider mb-3">Sai Service</h1>
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">

                            {/* Invoice Info */}
                            <div className="flex flex-row justify-between items-start w-full space-y-4 sm:space-y-0 sm:space-x-6">
                                {/* Logo on the left or placeholder */}
                                <div className="w-20 h-20 sm:w-32 sm:h-32 overflow-hidden rounded-full   flex items-center justify-center">
                                    {user?.companylogo?.trim() ? (
                                        <Image
                                            width={200}
                                            height={200}
                                            src={user.companylogo}
                                            alt="Company Logo"
                                            className="w-32 h-32 object-cover rounded-full border-2 border-gray-300"
                                            onError={(e) => (e.target.style.display = 'none')}
                                        />
                                    ) : (
                                        // Placeholder to maintain layout when logo is missing
                                        <div className="w-32 h-32" />
                                    )}
                                </div>

                                {/* Invoice info and address on the right */}
                                <div className="flex flex-col items-end text-right text-xs sm:text-sm w-full sm:w-auto space-y-2">
                                    <table className="text-xs bg-white text-black rounded shadow sm:text-sm">
                                        <tbody>
                                            <tr>
                                                <th className="bg-gray-200 text-left p-2 text-xs sm:w-32">Invoice #</th>
                                                <td className="p-2 border text-right">{invoice?.invoiceNumber}</td>
                                            </tr>
                                            <tr>
                                                <th className="bg-gray-200 text-left p-2 text-xs sm:text-sm">Issue Date</th>
                                                <td className="p-2 border text-right">
                                                    {invoice?.date
                                                        ? new Date(invoice.date).toLocaleDateString("en-GB")
                                                        : "N/A"}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <address className="text-xs leading-4 not-italic space-y-1 sm:text-sm mt-2">
                                        <p className="font-semibold">{user.company}</p>
                                        {(user.companyaddress || '').split(',').map((line, index) => (
                                            <p key={index} className="text-gray-700">{line.trim()}</p>
                                        ))}
                                        <p className="text-gray-700">
                                            <span className="font-medium">Phone:</span> {user.companyphone}
                                        </p>
                                    </address>
                                </div>
                            </div>



                        </div>
                    </div>

                    {/* Client Info */}
                    <div className="mt-4 border bg-blue-100 text-blue-900 text-xs font-medium p-3 rounded  sm:text-sm ">
                        <p className="font-semibold  text-xs sm:text-sm">Bill To:</p>
                        <p className="text-xs sm:text-sm font-extrabold">{invoice?.client}</p>
                        {/* {isclient?.address.split(',').map((line, index) => (
                <p className="text-xs sm:text-sm" key={index}>{line.trim()}</p>
              ))} */}
                    </div>



                    {/* Items Table */}
                    <div className="my-2  overflow-x-auto">
                        <table className="w-full text-sm border rounded-2xl border-collapse">
                            <thead className="bg-gray-200">
                                <tr className="text-center">

                                    <th className="p-2 text-xs sm:text-sm">No.</th>
                                    <th className="p-2 text-xs sm:text-sm">Item</th>

                                    <th className="p-2 text-xs sm:text-sm">Rate</th>
                                    <th className="p-2 text-xs sm:text-sm">Quantity</th>
                                    <th className="p-2 text-xs sm:text-sm">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice?.items?.map((item, index) => (
                                    <tr key={index} className="text-center">

                                        <td className="p-2 text-xs sm:text-sm">{index + 1}</td>
                                        <td className="p-2 text-xs sm:text-sm whitespace-nowrap">{item.item_name}</td>

                                        <td className="p-2 text-xs sm:text-sm">₹{(item.item_price).toFixed(2)}</td>
                                        <td className="p-2 text-xs sm:text-sm">{(item.item_quantity).toFixed(2)}</td>
                                        <td className="p-2 text-xs sm:text-sm">₹{(item.item_quantity * item.item_price).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-gray-100">
                                    <td colSpan="4" className="p-2 text-right font-semibold text-xs sm:text-sm">
                                        Total :
                                    </td>
                                    <td className="p-2 text-center text-xs sm:text-sm font-bold">
                                        ₹{invoice?.grandTotal?.toFixed(2)}
                                    </td>
                                </tr>
                            </tfoot>

                        </table>
                    </div>




                </div>
            ) : (
                <p>Invoice not found</p>
            )}


            {/* pdf contains */}
            <div
                ref={reportRef}
                style={{
                    backgroundColor: '#ffffff',
                    width: '794px', // A4 width
                    margin: '0 auto',
                    padding: '40px',
                    boxSizing: 'border-box',
                }}
                className="hidden items-center"
            >
                <div className="w-[794px] mx-auto p-4 border border-black text-xs text-black font-medium">
                    {/* Header */}
                    <div className="border-b border-black text-center mb-2">
                        <h1 className="text-xl font-bold uppercase">Sai Sales Service</h1>
                        <p>All Type DTH Recharge service & Sales LED TV, CCTV Camera</p>
                        <p className="text-[10px] font-normal">(કુલર, પંખા વગેરેની સર્વિસ ઉપલબ્ધ છે.)</p>
                        <p className="text-sm mt-1">
                            A.T. Post. Pipalkhed, (Bus stop Pachhal) Shop No. 2, Ta. Vansda Dist. Navsari
                        </p>
                        <p className="font-semibold">Mo. 9979524096, 9023137786</p>
                    </div>

                    {/* Top Meta Section */}
                    <div className="grid grid-cols-2 gap-4 mb-2">
                        <div className="space-y-1">
                            <p>Name: ___________________________________</p>
                            <p>Add.: ___________________________________</p>
                            <p>Mo.: ____________________________________</p>
                        </div>
                        <div className="space-y-1 text-right">
                            <p>Bill No.: <span className="font-bold">201</span></p>
                            <p>Date: ________ - 20</p>
                        </div>
                    </div>

                    {/* Table Header */}
                    <table className="w-full border border-black border-collapse mb-2 text-center">
                        <thead>
                            <tr>
                                <th className="border border-black px-1 py-1 w-[40px]">No.</th>
                                <th className="border border-black px-1 py-1">PRODUCT DESCRIPTION</th>
                                <th className="border border-black px-1 py-1 w-[60px]">Qty.</th>
                                <th className="border border-black px-1 py-1 w-[100px]">Unit Rate</th>
                                <th className="border border-black px-1 py-1 w-[80px]">Amount Rs.</th>
                                <th className="border border-black px-1 py-1 w-[60px]">Ps.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Add items dynamically or leave blank for manual entry */}
                            {[...Array(5)].map((_, i) => (
                                <tr key={i} className="h-[28px]">
                                    <td className="border border-black px-1 py-1">{i + 1}</td>
                                    <td className="border border-black px-1 py-1 text-left"></td>
                                    <td className="border border-black px-1 py-1"></td>
                                    <td className="border border-black px-1 py-1"></td>
                                    <td className="border border-black px-1 py-1"></td>
                                    <td className="border border-black px-1 py-1"></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Footer Bottom Lines */}
                    <div className="flex justify-between items-start mb-1">
                        <p>I.D.: ____________________________________</p>
                        <div className="text-right">
                            <p className="font-semibold">TOTAL</p>
                        </div>
                    </div>

                    <div className="flex justify-between mt-8">
                        <p><em>Received Signature: _______________________</em></p>
                        <p className="font-bold">For, Sai Sales Service</p>
                    </div>
                </div>

            </div>


            {/* <div ref={reportRef}>
<p className='bg-black text-6xl text-white'>Rohan</p>
                </div> */}
        </div>
    )
}

export default InvoiceDetails
