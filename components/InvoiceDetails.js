
import React from 'react'
import Image from 'next/image';


const InvoiceDetails = ({ isLoading, invoice, user, reportRef }) => {
    const cellHeader = {
        padding: '6px',
        borderTop: '1px solid #000',
        borderLeft: '1px solid #000',
        borderRight: '1px solid #000',
        borderBottom: '1px solid #000',
        backgroundColor: '#fee2e2',
        textAlign: 'center',
    };

    const cellBody = {
        padding: '6px',
        borderRight: '1px solid #000',
        textAlign: 'center',
        // borderLeft: '1px solid #000', // Remove left border for first column
        // borderBottom: "none",
        //   borderRight: 'none', // Remove right border for last column
    };


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

                <div className="max-w-3xl mx-auto border border-red-700 text-[10px] sm:text-sm font-[Cambria] bg-white text-black py-4 rounded-lg min-h-[822px]"> {/* A4 height approx 1122px at 96dpi */}
                    {/* Header */}
                    <div className="text-center border-b border-red-700 ">
                        <p className='text-right px-2'>Mo. 9979524096, 9023137786</p>
                        <h1 className="text-red-700 text-lg font-bold uppercase tracking-wide">Sai Service</h1>
                        <p className="text-[10px] font-semibold">All Type DTH Recharge Service & Sales LED TV, CCTV Camera</p>
                        <p className="text-[10px] text-red-700">(કુલાર, પંખા, ઈલેક્ટ્રોનિક્સ વસ્તુઓ મળશે.)</p>
                        <p className="mt-1 font-semibold border-t border-b w-full">A.T. Post. Pipalkhed, (Bus stop Pachhal) Shop No. 2, Ta. Vansda Dist. Navsari.</p>
                        <div className="flex justify-between  ">
                            <div className="space-y-1 p-2   text-left">
                                <p><span className="font-bold">Name:</span> {invoice?.client || '________________________'}</p>
                                <p><span className="font-bold">Add.:</span> {invoice?.clientAddress || '________________________'}</p>
                                <p><span className="font-bold">Mo.:</span> {invoice?.clientPhone || '________________'}</p>
                            </div>
                            <div className="text-right border-l px-2 ">
                                <p><span className="font-bold">Bill No:</span> <span className="text-lg font-bold">{invoice?.invoiceNumber || '201'}</span></p>
                                <p><span className="font-bold">Date:</span> {invoice?.date ? new Date(invoice.date).toLocaleDateString("en-GB") : "- / - / 20"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="mt-3 p-2">
                        <table className="w-full border border-collapse text-center">
                            <thead>
                                <tr className="bg-red-100 text-[11px]">
                                    <th className="border p-1">No.</th>
                                    <th className="border p-1">PRODUCT DESCRIPTION</th>
                                    <th className="border p-1">Qty.</th>
                                    <th className="border p-1">Unit Rate</th>
                                    <th className="border p-1">Amount<br />Rs.</th>
                                </tr>
                            </thead>
                            <tbody className="min-h-[300px]">
                                {invoice?.items?.map((item, index) => (
                                    <tr key={index}>
                                        <td className="border-l p-1">{index + 1}</td>
                                        <td className="border-l p-1 text-left">{item.item_name}</td>
                                        <td className="border-l p-1">{item.item_quantity}</td>
                                        <td className="border-l p-1">₹{item.item_price.toFixed(2)}</td>
                                        <td className="border-l p-1">₹{(item.item_price * item.item_quantity).toFixed(2)}</td>
                                    </tr>
                                ))}
                                {/* Add blank rows to fill space */}
                                {Array.from({ length: Math.max(10 - (invoice?.items?.length || 0), 0) }).map((_, i) => (
                                    <tr key={`empty-${i}`}>
                                        <td className="border-l p-1">&nbsp;</td>
                                        <td className="border-l p-1">&nbsp;</td>
                                        <td className="border-l p-1">&nbsp;</td>
                                        <td className="border-l p-1">&nbsp;</td>
                                        <td className="border-l p-1">&nbsp;</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    {/* First cell spans columns No., Description, Qty., and Unit Rate */}
                                    <td
                                        colSpan={4}
                                        style={{
                                            border: '1px solid #000',
                                            padding: '6px',
                                            textAlign: 'right',
                                            fontWeight: 'bold',
                                            backgroundColor: '#f3f3f3', // optional, to distinguish the total row
                                        }}
                                    >
                                        TOTAL:
                                    </td>

                                    {/* Fifth cell under “Amount Rs.” holds the total value */}
                                    <td
                                        style={{
                                            border: '1px solid #000',
                                            padding: '6px',
                                            textAlign: 'center', // or 'right' if you prefer
                                            fontWeight: 'bold',
                                            backgroundColor: '#f3f3f3',
                                        }}
                                    >
                                        ₹{invoice?.grandTotal?.toFixed(2) || '0.00'}
                                    </td>
                                </tr>
                            </tfoot>

                        </table>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between mt-2 text-xs p-4">
                        <p className="font-bold">I.D.: _________________________</p>
                        <p className="font-bold">TOTAL: ₹{invoice?.grandTotal?.toFixed(2) || "0.00"}</p>
                    </div>
                    <div className="mt-2 p-4">
                        <p className="text-xs"><span className="font-bold">WARRANTY:</span> _______________________________________</p>
                    </div>
                    <div className="flex justify-between items-end mt-4 text-xs p-4">
                        <p className="italic">Received Signature…</p>
                        <p className="font-bold">For, Sai Sales Service</p>
                    </div>
                </div>


            ) : (
                <p>Invoice not found</p>
            )}


            {/* pdf contains */}



            <div ref={reportRef}
            // style={{ display: 'none' }}
            className={`bg-white min-w-[794px] min-h-[1123px] w-[994px] p-8 text-black mx-auto  rounded shadow-lg hidden  `}
            >
                <div

                    style={{
                        width: '794px',         // Fixed A4 width (96 dpi)
                        height: '1123px',       // Fixed A4 height
                        margin: '0 auto',
                        border: '1px solid #b91c1c',
                        fontFamily: 'Cambria, serif',
                        fontSize: '12px',
                        backgroundColor: '#ffffff',
                        color: '#000',
                        wordSpacing: '2px',
                        letterSpacing: '0.5px',
                        boxSizing: 'border-box',
                        position: 'relative',
                        marginTop: '20px',
                        padding: '0',
                        overflow: 'hidden',     // Prevent any overflow
                    }}
                >
                    {/* Header */}
                    <div style={{ paddingBottom: '10px' }}>
                        <p style={{ textAlign: 'right', margin: 0, padding: 10 }}>Mo. 9979524096,9023137786</p>
                        <h1
                            style={{
                                color: '#b91c1c',
                                fontSize: '20px',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                margin: '5px 0',
                                textTransform: 'uppercase',
                            }}
                        >
                            Sai Service
                        </h1>
                        <p style={{ textAlign: 'center', fontWeight: 'bold', margin: '2px 0' }}>
                            All Type DTH Recharge Service & Sales LED TV, CCTV Camera
                        </p>
                        <p style={{ textAlign: 'center', color: '#b91c1c', margin: '2px 0' }}>
                            (કુલાર, પંખા, ઈલેક્ટ્રોનિક્સ વસ્તુઓ મળશે.)
                        </p>
                        <p
                            style={{
                                textAlign: 'center',
                                borderTop: '1px solid #000',
                                borderBottom: '1px solid #000',
                                padding: '5px 0',
                                margin: '10px 0',
                                fontWeight: 'bold',
                                itemsAlign: 'center',
                            }}
                        >
                            A.T. Post. Pipalkhed, (Bus stop Pachhal) Shop No. 2, Ta. Vansda Dist. Navsari.
                        </p>

                        {/* Info Row */}
                        <div
                            style={{
                                padding: '10px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'stretch', // ensure both children stretch to same height
                                borderTop: '1px solid #000', // optional horizontal top border if needed
                                borderBottom: '1px solid #000', // optional horizontal bottom border if needed
                            }}
                        >
                            {/* Client Info */}
                            <div style={{ width: '60%', textAlign: 'left', paddingRight: '10px' }}>
                                <p style={{ wordSpacing: '2px', letterSpacing: '0.5px' }}><strong>Name:</strong> {invoice?.client || '________________________'}</p>
                                <p><strong>Add.:</strong> {invoice?.clientAddress || '________________________'}</p>
                                <p><strong>Mo.:</strong> {invoice?.clientPhone || '________________'}</p>
                            </div>

                            {/* Invoice Info */}
                            <div
                                style={{
                                    width: '40%',
                                    paddingLeft: '10px',
                                    borderLeft: '1px solid #000',
                                    textAlign: 'right',
                                }}
                            >
                                <p>
                                    <strong>Bill No:</strong>{' '}
                                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                        {invoice?.invoiceNumber || '201'}
                                    </span>
                                </p>
                                <p>
                                    <strong>Date:</strong>{' '}
                                    {invoice?.date ? new Date(invoice.date).toLocaleDateString('en-GB') : '- / - / 20'}
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Table */}
                    <div style={{ marginTop: '20px', padding: '0 10px' }}>
                        <table
                            style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                border: '1px solid #000',
                                textAlign: 'center',
                            }}
                        >
                            <thead>
                                <tr style={{ backgroundColor: '#fee2e2', fontSize: '12px' }}>
                                    <th style={cellHeader}>No.</th>
                                    <th style={cellHeader}>PRODUCT DESCRIPTION</th>
                                    <th style={cellHeader}>Qty.</th>
                                    <th style={cellHeader}>Unit Rate</th>
                                    <th style={cellHeader}>Amount Rs.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(invoice?.items || []).map((item, index) => (
                                    <tr key={index}>
                                        <td style={cellBody}>{index + 1}</td>
                                        <td style={{ ...cellBody, textAlign: 'left' }}>{item.item_name}</td>
                                        <td style={cellBody}>{item.item_quantity}</td>
                                        <td style={cellBody}>₹{item.item_price.toFixed(2)}</td>
                                        <td style={cellBody}>
                                            ₹{(item.item_quantity * item.item_price).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                                {/* Blank Rows */}
                                {Array.from({ length: Math.max(10 - (invoice?.items?.length || 0), 0) }).map((_, i) => (
                                    <tr key={`blank-${i}`}>
                                        <td style={cellBody}>&nbsp;</td>
                                        <td style={cellBody}>&nbsp;</td>
                                        <td style={cellBody}>&nbsp;</td>
                                        <td style={cellBody}>&nbsp;</td>
                                        <td style={cellBody}>&nbsp;</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    {/* First cell spans columns No., Description, Qty., and Unit Rate */}
                                    <td
                                        colSpan={4}
                                        style={{
                                            border: '1px solid #000',
                                            padding: '6px',
                                            textAlign: 'right',
                                            fontWeight: 'bold',
                                            backgroundColor: '#f3f3f3', // optional, to distinguish the total row
                                        }}
                                    >
                                        TOTAL:
                                    </td>

                                    {/* Fifth cell under “Amount Rs.” holds the total value */}
                                    <td
                                        style={{
                                            border: '1px solid #000',
                                            padding: '6px',
                                            textAlign: 'center', // or 'right' if you prefer
                                            fontWeight: 'bold',
                                            backgroundColor: '#f3f3f3',
                                        }}
                                    >
                                        ₹{invoice?.grandTotal?.toFixed(2) || '0.00'}
                                    </td>
                                </tr>
                            </tfoot>

                        </table>
                    </div>

                    {/* Footer Totals */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: '20px',
                            fontSize: '12px',
                            padding: '12px',

                        }}
                    >
                        <p>I.D.: _________________________</p>

                    </div>

                    {/* Warranty */}
                    <div style={{ marginTop: '10px', padding: '12px', }}>
                        <p>
                            <strong>WARRANTY:</strong> _______________________________________
                        </p>
                    </div>

                    {/* Signature */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-end',
                            marginTop: '40px',
                            fontSize: '12px',
                            padding: '10px',
                        }}
                    >
                        <p style={{ fontStyle: 'italic' }}>Received Signature…</p>
                        <p style={{ fontWeight: 'bold' }}>For, Sai Sales Service</p>
                    </div>
                </div>

            </div>
        </div >
    )
}

export default InvoiceDetails
