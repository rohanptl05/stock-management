
import React from 'react'
import Image from 'next/image';



const InvoiceDetails = ({ isLoading, invoice, reportRef }) => {




    const totalQuantity = () => invoice?.items?.reduce((acc, item) => acc + item.item_quantity, 0) || 0;

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


  <div
                ref={reportRef}
                style={{
                   
                    minWidth: "794px",
                    minHeight: "1000px",
                    width: "994px",
                  
                    padding: "8px",
                  
                    margin: "auto",
                  background: "#fff",
                }}

                // className={`bg-white min-w-[794px] min-h-[950px] w-[994px] p-1 text-black mx-auto  rounded shadow-lg  `}
                
            >


                <div

                    style={{
                        Width: "950px",
                        Height: "1000px",
                        background: "#fff",
                        margin: "auto",
                        // border: "1px solid #bbb",
                        fontFamily: "Arial, sans-serif",
                        fontSize: "10px",
                        color: "#222",
                        boxSizing: "border-box",
                    }}


                >

                    <div style={{ textAlign: "center", marginBottom: "7px" }}>
                        <div
                            style={{
                                color: "#db302a",
                                fontWeight: "bold",
                                fontSize: "10px",
                                marginBottom: "1px",
                            }}
                        >
                            || OM SAI ||
                        </div>
                        <div
                            style={{
                                fontWeight: "bold",
                                fontSize: "40px",
                                letterSpacing: "1px",
                                color: "#2552cc",
                                marginBottom: "1px",
                            }}
                        >
                            SAI SERVICE
                        </div>
                        <div>
                            <p style={{ textAlign: 'center', margin: '1px 0', fontSize: '11px' }}>
                                All Type DTH Recharge Service & Sales LED TV, CCTV Camera
                            </p>
                            <p style={{ textAlign: 'center', color: '#b91c1c', margin: '1px 0', fontSize: '11px' }}>
                                (કુલાર, પંખા, ઈલેક્ટ્રોનિક્સ વસ્તુઓ મળશે.)
                            </p>
                        </div>
                        <div style={{ marginBottom: "1px", fontSize: '11px' }}>
                            A.T. Post. Pipalkhed, (Bus stop Pachhal) Shop No. 2, Ta. Vansda Dist. Navsari.
                        </div>
                        <div style={{ fontSize: '11px' }}>CONT. : 9979524096, 9023137786</div>
                    </div>
                    {/* <hr style={{ margin: "9px 0" }} /> */}

                    <div style={{ border: "2px solid #222", margin: "12px", borderRadius: '2px', overflow: 'hidden', minHeight: '1200px', position: 'relative' }}>

                        <div style={{ width: "100%", display: "flex", justifyContent: "space-between", fontSize: '12px', padding: '10px' }}>


                            <div style={{ width: "60%", padding: '1px' }}>
                                <strong>BILL TO.</strong>
                                <strong> <p style={{ wordSpacing: '1px', letterSpacing: '0.5px' }}> {(invoice.client ?? '_________________')
                                    .toLowerCase()
                                    .split(' ')
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(' ')}</p></strong>
                                <p><strong>Address : </strong>{(invoice?.clientAddress || '_________________')
                                    .toLowerCase()
                                    .split(' ')
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(' ')}</p>
                                <p><strong>Mo. : </strong> {invoice?.clientPhone || '________________'}</p>
                            </div>

                            <table style={{ width: "17%", fontSize: "12px", borderCollapse: "collapse" }}>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: "3px", border: "1px solid #aaa", fontWeight: "bold", textAlign: "left" }}>
                                            Invoice No.:
                                        </td>
                                        <td style={{ padding: "3px", border: "1px solid #aaa", textAlign: "right" }}>
                                            {invoice?.invoiceNumber || '201'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: "3px", border: "1px solid #aaa", fontWeight: "bold", textAlign: "left" }}>
                                            Date:
                                        </td>
                                        <td style={{ padding: "3px", border: "1px solid #aaa", textAlign: "right" }}>
                                            {invoice?.date ? new Date(invoice.date).toLocaleDateString('en-GB') : '- / - / 20'}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                        </div>


                        <table
                            style={{

                                borderCollapse: "collapse",
                                marginTop: "12px",
                                marginBottom: "15px",
                                fontSize: "12px",
                                width: "100%",
                                tableLayout: "fixed",
                                height: "850px",
                            }}
                        >
                            <thead>
                                <tr>
                                    <th style={{ border: "1px solid #aaa", padding: "6px", textAlign: "center", width: "4%" }}>Sl. No.</th>
                                    <th style={{ border: "1px solid #aaa", padding: "6px", textAlign: "center", width: "36%" }}>
                                        Description of Goods
                                    </th>
                                    <th style={{ border: "1px solid #aaa", padding: "6px", textAlign: "center", width: "8%" }}>Quantity</th>
                                    <th style={{ border: "1px solid #aaa", padding: "6px", textAlign: "right", width: "11%" }}>Rate</th>
                                    <th style={{ border: "1px solid #aaa", padding: "6px", textAlign: "right", width: "16%" }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(invoice?.items || []).map((item, index) => (
                                    <tr key={index}>
                                        <td style={{ borderLeft: "1px solid #ccc", borderRight: "1px solid #ccc" }}><span style={{ fontSize: '12px', display: 'flex', justifyContent: 'center' }}>{index + 1}</span></td>
                                        <td style={{ borderLeft: "1px solid #ccc", borderRight: "1px solid #ccc", padding: "6px" }}>
                                            <div>
                                                <div style={{ fontSize: '14px' }}>
                                                    {item.item_name
                                                        .toLowerCase()
                                                        .split(' ')
                                                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                        .join(' ')}
                                                </div>

                                                {item?.item_model && (
                                                    <div style={{ color: 'gray', fontSize: '12px', paddingLeft: '8px' }}>
                                                        (Model No: {item.item_model})
                                                    </div>
                                                )}

                                                {item?.item_serial && (
                                                    <div style={{ fontSize: '12px', paddingLeft: '8px', }}>
                                                        Serial no./IMEI No.: {item.item_serial}
                                                    </div>
                                                )}
                                                <div style={{ display: 'flex', gap: '8px', color: 'gray', fontSize: '10px', paddingLeft: '6px' }}>
                                                    {item?.item_brand && <div>{item.item_brand}</div>}
                                                    {item?.item_catagory && <div>{item.item_catagory}</div>}
                                                </div>

                                                {invoice?.note && (
                                                    <div style={{ fontSize: '13px', paddingLeft: '6px', color: "gray" }}>
                                                        (Notes : {invoice?.note})
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ borderRight: "1px solid #ccc", padding: "6px", textAlign: "center" }}>{item.item_quantity}</td>
                                        <td style={{ borderRight: "1px solid #ccc", padding: "6px", textAlign: "right" }}>₹{item.item_price.toFixed(2)}</td>
                                        <td style={{ borderRight: "1px solid #ccc", padding: "6px", textAlign: "right" }}>₹{(item.item_quantity * item.item_price).toFixed(2)}</td>
                                    </tr>
                                ))}
                                {/* Blank Rows */}
                                {Array.from({ length: Math.max(20 - (invoice?.items?.length || 0), 0) }).map((_, i) => (
                                    <tr key={`blank-${i}`}>
                                        <td style={{ borderLeft: "1px solid #ccc", borderRight: "1px solid #ccc", padding: "6px", textAlign: "center" }}>&nbsp;</td>
                                        <td style={{ borderRight: "1px solid #ccc", padding: "6px", textAlign: "center" }}>&nbsp;</td>
                                        <td style={{ borderRight: "1px solid #ccc", padding: "6px", textAlign: "center" }}>&nbsp;</td>
                                        <td style={{ borderRight: "1px solid #ccc", padding: "6px", textAlign: "center" }}>&nbsp;</td>
                                        <td style={{ borderRight: "1px solid #ccc", padding: "6px", textAlign: "center" }}>&nbsp;</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot style={{ border: "1px solid #ccc" }}>
                                <tr>
                                    <td colSpan={2}
                                        style={{
                                            padding: '6px',
                                            fontWeight: 'bold',
                                            textAlign: 'left',
                                            backgroundColor: '#f9f9f9',
                                        }}
                                    >
                                        Warranty: {invoice?.warranty || 'N/A'}
                                    </td>
                                    <td colSpan={1}
                                        style={{
                                            padding: '6px',
                                            fontWeight: 'bold',
                                            textAlign: 'left',
                                            backgroundColor: '#f9f9f9',
                                            justifyContent: 'center',
                                            display: 'flex',
                                            borderRight: "1px solid #ccc",
                                            borderLeft: "1px solid #ccc",
                                        }}>

                                        {totalQuantity(invoice) || 0}
                                    </td>
                                    <td
                                        style={{
                                            borderRight: "1px solid #ccc",
                                            padding: '6px',
                                            textAlign: 'right',
                                            fontWeight: 'bold',
                                            backgroundColor: '#f3f3f3',
                                        }}
                                    >
                                        TOTAL:
                                    </td>
                                    <td
                                        style={{
                                            padding: '6px',
                                            textAlign: 'right',
                                            fontWeight: 'bold',
                                            backgroundColor: '#f3f3f3',
                                        }}
                                    >
                                        ₹{invoice?.grandTotal?.toFixed(2) || '0.00'}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>


                        <div
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                width: '100%',
                                marginTop: '1px',
                                fontSize: '12px',
                                padding: '17px',
                                // background: '#fff', // optional: ensures it's visible
                                boxSizing: 'border-box'
                            }}
                        >
                            <div
                                style={{
                                    // display: 'flex',
                                    justifyContent: 'space-between',
                                    // marginTop: '3px',
                                    fontSize: '12px',
                                    marginBottom: '15px',
                                  
                                }}
                            >
                                <p>
                                    Customer I.D.: {invoice?.customerID || '_________________________'}
                                </p>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginTop: '40px',
                                    fontSize: '12px',
                                }}
                            >
                                <div>
                                    <strong>Received Signature :</strong>
                                </div>
                                <div style={{ textAlign: 'right', fontSize: '13px' }}>
                                    For, SAI SERVICE<br />
                                    <span style={{ color: '#2252cc', fontWeight: 'bold' }}>
                                        SAI SERVICE
                                    </span>
                                    <br />
                                    <span style={{ fontStyle: 'italic', fontWeight: 'bold' }}>
                                        PROPRIETOR
                                    </span>
                                    <br />
                                    <span>(Authorized Signatory)</span>
                                </div>
                            </div>
                        </div>




                    </div>
                </div>
            </div>



            ) : (
                <p>Invoice not found</p>
            )}



            {/* pdf generation logic */}

          



        </div >
    )
}

export default InvoiceDetails
