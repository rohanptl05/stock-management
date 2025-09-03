
import React from 'react'
import Image from 'next/image';
import { numberToWords } from './app_currency_in_words_numberToWord.js';



const InvoiceDetails = ({ isLoading, invoice, reportRef }) => {




    const totalQuantity = () => invoice?.items?.reduce((acc, item) => acc + item.item_quantity, 0) || 0;
    const priceInWords = numberToWords(invoice?.grandTotal);

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
                        minHeight: "1123px",
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
                                <p style={{ textAlign: 'center', margin: '1px 0', fontSize: '12px' }}>
                                    All Type DTH Recharge Service & Sales LED TV, CCTV Camera
                                </p>
                                <p style={{ textAlign: 'center', color: '#b91c1c', margin: '1px 0', fontSize: '12px' }}>
                                    (કુલાર, પંખા, ઈલેક્ટ્રોનિક્સ વસ્તુઓ મળશે.)
                                </p>
                            </div>
                            <div style={{ marginBottom: "1px", fontSize: '12px' }}>
                                A.T. Post. Pipalkhed, (Bus stop Pachhal) Shop No. 2, Ta. Vansda Dist. Navsari.
                            </div>
                            <div style={{ fontSize: '12px' }}>CONT. : 9979524096, 9023137786</div>
                        </div>


                        <div style={{ border: "2px solid #222", margin: "12px", borderRadius: '2px', overflow: 'visible', minHeight: '1455px', position: 'relative' }}>

                            <div
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    fontSize: 12,
                                    padding: "5px 25px",
                                    boxSizing: "border-box",
                                }}
                            >
                                {/* Bill To Section */}
                                <div style={{ width: "60%", paddingRight: 16 }}>
                                    <strong style={{ display: "flex", marginBottom: 4, fontSize: 9 }}>BILL TO.</strong>
                                    <p style={{ wordSpacing: 1, letterSpacing: 0.5, margin: "4px 0", fontWeight: "bold", fontSize: 15 }}>
                                        {(invoice.client ?? "_________________")
                                            .toLowerCase()
                                            .split(" ")
                                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                            .join(" ")}
                                    </p>
                                    <p style={{ margin: "4px 0" }}>
                                        <strong>Address: </strong>
                                        {(invoice?.clientAddress ?? "_________________")
                                            .toLowerCase()
                                            .split(" ")
                                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                            .join(" ")}
                                    </p>
                                    <p style={{ margin: "4px 0" }}>
                                        <strong>Mo.: </strong>{invoice?.clientPhone ?? "________________"}
                                    </p>
                                </div>

                                {/* Invoice Info Section */}
                                <table style={{ width: "35%", fontSize: 12, borderCollapse: "collapse" }}>
                                    <tbody>
                                        <tr>
                                            <td
                                                style={{
                                                    padding: 6,
                                                    border: "1px solid #aaa",
                                                    fontWeight: "bold",
                                                    textAlign: "left",
                                                    width: "55%",
                                                }}
                                            >
                                                Invoice No.:
                                            </td>
                                            <td style={{ padding: 6, border: "1px solid #aaa", textAlign: "right" }}>
                                                {invoice?.invoiceNumber || "201"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td
                                                style={{
                                                    padding: 6,
                                                    border: "1px solid #aaa",
                                                    fontWeight: "bold",
                                                    textAlign: "left",
                                                }}
                                            >
                                                Date:
                                            </td>
                                            <td style={{ padding: 6, border: "1px solid #aaa", textAlign: "right" }}>
                                                {invoice?.date ? new Date(invoice.date).toLocaleDateString("en-GB") : "- / - / 20"}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>



                            <table
                                style={{
                                    borderCollapse: "separate", // must use separate for custom borders
                                    borderSpacing: 0,
                                    marginTop: 8,
                                    marginBottom: 8,
                                    fontSize: 12,
                                    width: "100%",
                                    tableLayout: "fixed",
                                    padding: "5px 25px",
                                    boxSizing: "border-box",
                                    flexGrow: 1,
                                    minHeight: "300px",
                                    height: "1050px"
                                }}
                            >
                                <thead>
                                    <tr>
                                        <th style={{
                                            border: "1px solid #aaa",
                                            padding: 6,
                                            textAlign: "center",
                                            width: "4%",
                                            backgroundColor: "#f5f5f5",
                                            fontWeight: "bold",
                                        }}>Sl. No.</th>
                                        <th style={{
                                            border: "1px solid #aaa",
                                            padding: 6,
                                            textAlign: "center",
                                            width: "36%",
                                            backgroundColor: "#f5f5f5",
                                            fontWeight: "bold",
                                        }}>
                                            Description of Goods
                                        </th>
                                        <th style={{
                                            border: "1px solid #aaa",
                                            padding: 6,
                                            textAlign: "center",
                                            width: "8%",
                                            backgroundColor: "#f5f5f5",
                                            fontWeight: "bold",
                                        }}>Quantity</th>
                                        <th style={{
                                            border: "1px solid #aaa",
                                            padding: 6,
                                            textAlign: "right",
                                            width: "11%",
                                            backgroundColor: "#f5f5f5",
                                            fontWeight: "bold",
                                        }}>Rate</th>
                                        <th style={{
                                            border: "1px solid #aaa",
                                            padding: 6,
                                            textAlign: "right",
                                            width: "16%",
                                            backgroundColor: "#f5f5f5",
                                            fontWeight: "bold",
                                        }}>Amount</th>
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

                                    padding: "12px",
                                    fontFamily: 'Arial, sans-serif',
                                    fontSize: 14,
                                    color: '#222',
                                    backgroundColor: '#fff',
                                    // boxShadow: '0 0 12px rgba(0,0,0,0.1)',
                                    // borderRadius: 4,
                                    // boxSizing: 'border-box',
                                    // position: 'relative' // for signature positioning inside container if needed
                                }}
                            >
                                {/* Customer and Bill Amount Section */}
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: 10,
                                        padding: '0 5px',
                                        fontSize: 12,
                                    }}
                                >
                                    <div>
                                        <strong>Customer I.D.: </strong> {invoice?.customerID || '_________________________'}
                                    </div>
                                    <div style={{ textAlign: 'right', fontSize: 13, backgroundColor: 'lightblue' , padding: '6px 6px', borderRadius: '4px' }}>
                                        <strong>Bill Amount: </strong> {priceInWords || '0'}
                                    </div>
                                </div>
                                {/* Bank Details */}
                                <div
                                    style={{
                                        padding: '5px 12px',
                                        marginBottom: 10,
                                        fontSize: 10,
                                        lineHeight: 1.5,
                                        color: '#444',
                                        border: '1px solid #ddd',
                                        borderRadius: 4,
                                        maxWidth: 370,
                                    }}
                                    >
                                    <div><strong>Bank Name :</strong> BANK OF INDIA, BRANCH-RUMLA.</div>
                                    <div>Bank A/c No. : 00000000000</div>
                                    <div>RTGS/IFSC Code : SBIN0004914</div>
                                </div>

                                    </div>
                                {/* Signature Section */}
                                <div
                                    style={{
                                        marginBottom: 2,
                                        borderTop: '1px solid #ccc',
                                        padding: "3px 10px",
                                        display: 'flex',
                                        justifyContent: 'space-between',

                                        fontSize: 12
                                    }}
                                >
                                       
                                    <div style={{ marginTop: "0px", fontSize: "15px" ,borderRight: '1px solid #ccc',paddingRight: '30px', }}>
                                        <strong>Declaration :</strong><br />
                                        1. Goods once sold will not be taken back or exchanged.<br />
                                        2. Payment Terms : 0<br />
                                        3. Delay in payment interest & other charges will be charged @24%.<br />
                                        4. Risk and responsibility ceases as soon as the goods leave our premises.<br />
                                        5. "Subject to CHIKHLI Jurisdiction only." E.&O.E
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '1px', fontSize: 12 ,}}>
                                        <span style={{ marginBottom: '115px' }}></span>
                                        <strong>Received Signature </strong>
                                    </div>
                                    <div style={{ textAlign: 'right', fontSize: 13,borderLeft: '1px solid #ccc', paddingLeft: '90px' }}>
                                         <div style={{ marginBottom: '70px' }}></div>
                                        For, SAI SERVICE<br />
                                        <span style={{ color: '#2252cc', fontWeight: 'bold' }}>SAI SERVICE</span><br />
                                        {/* <span style={{ fontStyle: 'italic', fontWeight: 'bold' }}>PROPRIETOR</span><br /> */}
                                        <span>(Authorized Signatory)</span><br />
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
