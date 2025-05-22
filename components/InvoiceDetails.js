
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
                        <h1 className="sm:text-2xl text-sm font-bold text-center uppercase bg-black py-2 text-white tracking-wider mb-3">Sai Services</h1>
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
                    width: '794px', // Fixed width for A4 size
                    margin: '0 auto',
                    padding: '40px', // Equivalent to 1.5cm
                    boxSizing: 'border-box',
                }}
                className="shadow-lg hidden items-center "
            >
                <div className="rounded-t-lg w-[650px] m-auto">
                    <h1 className="text-2xl font-extrabold text-center items-center uppercase bg-black py-2 text-white tracking-wider mb-6 ">
                        Sai Services
                    </h1>

                    <div className="flex justify-between items-start mb-6 gap-4">
                        {/* Company Logo */}
                        <div className="w-28 h-28 overflow-hidden rounded-full border border-black flex items-center justify-center">
                            {user?.companylogo?.trim() ? (
                                <img
                                    src={user.companylogo}
                                    alt="Company Logo"
                                    className="w-full h-full object-cover"
                                    onError={(e) => (e.target.style.display = 'none')}
                                />
                            ) : (
                                <div className="w-full h-full" />
                            )}
                        </div>

                        {/* Company Info */}
                        <div className="text-right text-xs space-y-2">
                            <table className="text-xs bg-white text-black border border-black w-full">
                                <tbody>
                                    <tr>
                                        <th className="p-2 border border-black text-left">Invoice #</th>
                                        <td className="p-2 border border-black text-right">{invoice?.invoiceNumber}</td>
                                    </tr>
                                    <tr>
                                        <th className="p-2 border border-black text-left">Issue Date</th>
                                        <td className="p-2 border border-black text-right">
                                            {invoice?.date ? new Date(invoice.date).toLocaleDateString("en-GB") : "N/A"}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <address className="mt-2 not-italic text-xs space-y-1">
                                <p className="font-semibold">{user.company}</p>
                                {(user.companyaddress || '').split(',').map((line, index) => (
                                    <p key={index} className="text-black">{line.trim()}</p>
                                ))}
                                <p className="text-black">
                                    <span className="font-medium">Phone:</span> {user.companyphone}
                                </p>
                            </address>
                        </div>
                    </div>

                    {/* Bill To Section */}
                    <div className="border border-black text-black text-xs font-medium p-3 rounded mb-6">
                        <p className="font-semibold">Bill To:</p>
                        <p className="font-extrabold">{invoice?.client}</p>
                    </div>

                    {/* Items Table */}
                    <table className="w-full text-sm border border-black border-collapse mb-6">
                        <thead className="bg-white text-black">
                            <tr className="text-center">
                                <th className="p-2 text-xs border border-black">No.</th>
                                <th className="p-2 text-xs border border-black">Item</th>
                                <th className="p-2 text-xs border border-black">Rate</th>
                                <th className="p-2 text-xs border border-black">Quantity</th>
                                <th className="p-2 text-xs border border-black">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice?.items?.map((item, index) => (
                                <tr key={index} className="text-center">
                                    <td className="p-2 text-xs border border-black">{index + 1}</td>
                                    <td className="p-2 text-xs border border-black">{item.item_name}</td>
                                    <td className="p-2 text-xs border border-black">₹{item.item_price.toFixed(2)}</td>
                                    <td className="p-2 text-xs border border-black">{item.item_quantity.toFixed(2)}</td>
                                    <td className="p-2 text-xs border border-black">₹{(item.item_quantity * item.item_price).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="4" className="p-2 text-right font-semibold text-xs border border-black">
                                    Total:
                                </td>
                                <td className="p-2 text-center font-bold text-xs border border-black">
                                    ₹{invoice?.grandTotal?.toFixed(2)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>


            {/* <div ref={reportRef}>
<p className='bg-black text-6xl text-white'>Rohan</p>
                </div> */}
        </div>
    )
}

export default InvoiceDetails
