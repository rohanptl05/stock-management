
import React from 'react'
import Image from 'next/image';


const InvoiceDetails = ({ isLoading, invoice, reportRef }) => {
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
                                <p>
                                    <span className="font-bold">Name : </span>{' '}
                                    {(invoice.client ?? '_________________')
                                        .toLowerCase()
                                        .split(' ')
                                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                        .join(' ')}
                                </p>
                                <p><span className="font-bold">Address : </span> {(invoice?.clientAddress || '_________________')
                                    .toLowerCase()
                                    .split(' ')
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(' ')}</p>
                                <p><span className="font-bold">Mobile No. : </span> {invoice?.clientPhone || '_________________'}</p>
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
                                        <td className="border-l p-1 text-left px-2">
                                            <div>
                                                {item.item_name
                                                    .toLowerCase()
                                                    .split(' ')
                                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                    .join(' ')}



                                            </div >
                                            <div>

                                                {item?.item_model && (
                                                    <div className="text-sm text-gray-600 px-2">Model No :{item.item_model}</div>
                                                )}
                                            </div>
                                            <div>
                                                {item?.item_brand && (
                                                    <div className="text-sm  px-2"> Serial no./IMEI No. : {item.item_serial} </div>
                                                )}

                                            </div>
                                            <div className='flex'>

                                                {item?.item_brand && (
                                                    <div className="text-sm text-gray-600 px-2">{item.item_brand}</div>
                                                )}
                                                {item?.item_catagory && (
                                                    <div className="text-sm text-gray-600 px-2">{item.item_catagory}</div>
                                                )}
                                            </div>
                                            <div>
                                                {invoice?.note && (
                                                    <div className="text-sm  px-2 text-gray-600"> (Notes : {invoice?.note}) </div>
                                                )}

                                            </div>

                                        </td>


                                        <td className="border-l p-1">{item.item_quantity}</td>
                                        <td className="border-l p-1">₹{item.item_price.toFixed(2)}</td>
                                        <td className="border-l p-1">₹{(item.item_price * item.item_quantity).toFixed(2)}</td>
                                    </tr>

                                ))}

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
                                    {/* Warranty column - spans first 2 columns */}
                                    <td colSpan={3}
                                        style={{
                                            border: '1px solid #000',
                                            padding: '6px',
                                            fontWeight: 'bold',
                                            textAlign: 'left',
                                            backgroundColor: '#f9f9f9',
                                        }}
                                    >
                                        Warranty: {invoice?.warranty || 'N/A'}
                                    </td>

                                    {/* Empty filler cell for spacing */}


                                    {/* TOTAL label cell */}
                                    <td
                                        style={{
                                            border: '1px solid #000',
                                            padding: '6px',
                                            textAlign: 'right',
                                            fontWeight: 'bold',
                                            backgroundColor: '#f3f3f3',
                                        }}
                                    >
                                        TOTAL:
                                    </td>

                                    {/* TOTAL amount cell */}
                                    <td
                                        style={{
                                            border: '1px solid #000',
                                            padding: '6px',
                                            textAlign: 'center',
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
                        <p className="font-bold"> Customer I.D.:{(invoice?.customerID || '_________________________')} </p>

                    </div>
                    {/* <div className="flex justify-between mt-2 text-xs p-4">
                        <p className="font-bold">WARRANTY: {(invoice?.warranty || '_________________________')}</p>
                    </div> */}
                    <div className="flex justify-between items-end mt-4 text-xs p-4">
                        <p className="italic">Received Signature…</p>
                        <p className="font-bold"> <span className='font-extrabold text-xl'>For</span>, Sai Service</p>
                    </div>
                </div>


            ) : (
                <p>Invoice not found</p>
            )}


            {/* pdf contains */}



            <div ref={reportRef}

                className={`bg-white min-w-[794px] min-h-[1000px] w-[994px] p-8 text-black mx-auto  rounded shadow-lg   hidden`}
            >
                <div

                    style={{
                        width: '794px',
                        height: '1000px',
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
                        overflow: 'hidden',
                        fontWeight: 'bold',
                        textAlign: 'center'

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
                                // borderBottom: '1px solid #000',
                                padding: '1px 0',
                                margin: '10px 0',
                                fontWeight: 'bold',
                                itemsAlign: 'center',
                                justifyItems: 'center'

                            }}
                        >
                            A.T. Post. Pipalkhed, (Bus stop Pachhal) Shop No. 2, Ta. Vansda Dist. Navsari.
                        </p>

                        {/* Info Row */}
                        <div
                            style={{
                                padding: '0 10px ',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'stretch',
                                borderTop: '1px solid #000',
                                borderBottom: '1px solid #000',
                            }}
                        >
                            {/* Client Info */}
                            <div style={{ width: '60%', textAlign: 'left', paddingRight: '10px', padding: '2px', fontSize: '13px' }}>
                                <p style={{ wordSpacing: '2px', letterSpacing: '0.5px' }}><strong>Name : </strong>   {(invoice.client ?? '_________________')
                                    .toLowerCase()
                                    .split(' ')
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(' ')}</p>
                                <p><strong>Address : </strong>{(invoice?.clientAddress || '_________________')
                                    .toLowerCase()
                                    .split(' ')
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(' ')}</p>
                                <p><strong>Mobile : </strong> {invoice?.clientPhone || '________________'}</p>
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
                            <tbody style={{ fontSize: '14px' }}>
                                {(invoice?.items || []).map((item, index) => (
                                    <tr key={index}>
                                        <td style={cellBody}>{index + 1}</td>
                                        <td style={{ ...cellBody, textAlign: 'left' }}>
                                            <div>
                                                {item.item_name
                                                    .toLowerCase()
                                                    .split(' ')
                                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                    .join(' ')}
                                            </div>

                                            {/* Model Number */}
                                            {item?.item_model && (
                                                <div style={{ color: 'gray', fontSize: '13px', paddingLeft: '8px' }}>
                                                    Model No: {item.item_model}
                                                </div>
                                            )}

                                            {/* Serial Number */}
                                            {item?.item_serial && (
                                                <div style={{ fontSize: '13px', paddingLeft: '8px' }}>
                                                    Serial no./IMEI No.: {item.item_serial}
                                                </div>
                                            )}
                                            {/* Brand & Category */}
                                            <div style={{ display: 'flex', gap: '8px', color: 'gray', fontSize: '13px', paddingLeft: '8px' }}>
                                                {item?.item_brand && <div>{item.item_brand}</div>}
                                                {item?.item_catagory && <div>{item.item_catagory}</div>}
                                            </div>

                                            {invoice?.note && (
                                                <div style={{ fontSize: '13px', paddingLeft: '8px', color: "gray" }}>
                                                    (Notes : {invoice?.note})
                                                </div>
                                            )}
                                        </td>


                                        <td style={cellBody}>{item.item_quantity}</td>
                                        <td style={cellBody}>₹{item.item_price.toFixed(2)}</td>
                                        <td style={cellBody}>
                                            ₹{(item.item_quantity * item.item_price).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                                {/* Blank Rows */}
                                {Array.from({ length: Math.max(12 - (invoice?.items?.length || 0), 0) }).map((_, i) => (
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
                                    {/* Warranty column - spans first 2 columns */}
                                    <td colSpan={3}
                                        style={{
                                            border: '1px solid #000',
                                            padding: '6px',
                                            fontWeight: 'bold',
                                            textAlign: 'left',
                                            backgroundColor: '#f9f9f9',
                                        }}
                                    >
                                        Warranty: {invoice?.warranty || 'N/A'}
                                    </td>

                                    {/* Empty filler cell for spacing */}


                                    {/* TOTAL label cell */}
                                    <td
                                        style={{
                                            border: '1px solid #000',
                                            padding: '6px',
                                            textAlign: 'right',
                                            fontWeight: 'bold',
                                            backgroundColor: '#f3f3f3',
                                        }}
                                    >
                                        TOTAL:
                                    </td>

                                    {/* TOTAL amount cell */}
                                    <td
                                        style={{
                                            border: '1px solid #000',
                                            padding: '6px',
                                            textAlign: 'center',
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
                        <p>Customer I.D.: {(invoice?.customerID || '_________________________')}</p>

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
                        <p style={{ fontWeight: 'bold' }}>For, Sai Service</p>
                    </div>
                </div>

            </div>
        </div >
    )
}

export default InvoiceDetails
