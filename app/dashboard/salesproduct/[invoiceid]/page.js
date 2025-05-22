"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { InvoiceDetails } from "@/app/api/actions/invoiceactions"
import { fetchuser } from '@/app/api/actions/useractions';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

const Page = () => {
  const { data: session } = useSession();
  const params = useParams();
  const id = params.invoiceid;
  const [invoice, setInvoice] = useState([])
  const [user, setUser] = useState([])
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {

    if (id) {
      fetchData()
    }

  }, [id])

  const fetchData = async () => {
    setIsLoading(true);
    const res = await InvoiceDetails(id);
    setInvoice(res || {}); // Expecting a single invoice object


    const ress = await fetchuser(session?.user?.email);
    setUser(ress || {});

    setIsLoading(false);
  };

  return (
    <>
      <div className='flex'>



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
            {invoice && (
              <div className="flex justify-end mb-4">
                <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200">
                  PDF
                </button>
              </div>
            )}
            <div className="  rounded-t-lg sm:px-6 sm:py-4 px-2 py-1">
              <h1 className="sm:text-2xl text-sm font-bold text-center uppercase bg-black py-2 text-white tracking-wider mb-3">INVOICE</h1>
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">

                {/* Invoice Info */}
                <div className="flex flex-row justify-between items-start w-full space-y-4 sm:space-y-0 sm:space-x-6">
                  {/* Logo on the left or placeholder */}
                  <div className="w-20 h-20 sm:w-32 sm:h-32 overflow-hidden rounded-full  flex items-center justify-center">
                    {user?.companylogo?.trim() ? (
                      <img
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
              </table>
            </div>

            {/* Totals Section */}
            <div className=" overflow-x-auto flex justify-end">
              <table className="text-sm w-[45%] sm:w-[300px]">
                <tbody>
                  <tr>
                    <th className="bg-gray-200 p-2 text-xs sm:text-sm">Total</th>
                    <td className="p-2 border text-right text-xs sm:text-sm">₹{invoice?.grandTotal}</td>
                  </tr>
                  {/* <tr>
                    <th className="bg-gray-200 p-2 text-xs sm:text-sm">Amount Paid</th>
                    <td className="p-2 border text-right text-xs sm:text-sm">₹totalReceivedAmount</td>
                  </tr>
                  <tr>
                    <th className="bg-gray-200 p-2 text-xs sm:text-sm">Balance Due</th>
                    <td className="p-2 border text-right text-xs sm:text-sm">₹{invoice?.balance_due_amount}</td>
                  </tr> */}
                </tbody>
              </table>
            </div>



          </div>
        ) : (
          <p>Invoice not found</p>
        )}
      </div>
    </>
  );
};

export default Page;
