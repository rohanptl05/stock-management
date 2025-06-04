"use client"
import React, { useEffect, useState } from 'react';
import { FaBoxOpen, FaWallet, FaHistory, FaShoppingCart } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import { fetchProducts } from '@/app/api/actions/productactions';
import { fetchRecharge } from '@/app/api/actions/rechargeactions';
import {fetchInvoices} from "@/app/api/actions/invoiceactions"

const Page = () => {
  const { data: session } = useSession({
  required: true,
  onUnauthenticated() {
    router.push('/login');
  },
});
  const [productQueueCount, setProductQueueCount] = useState(0);

  const [rechargeBalance, setRechargeBalance] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [product, setProduct] = useState([])
  const [recharge, setRecharge] = useState([])
  useEffect(() => {

    fetchData();
  }, [session?.user?.id]);

  const fetchData = async () => {

    const productResponse = await fetchProducts(session?.user?.id, "active");
    const rechargerResponce = await fetchRecharge(session?.user?.id, "active");
    const invoiceResponse = await fetchInvoices(session?.user?.id, "active");
    if(invoiceResponse.length > 0){

      setTotalOrders(invoiceResponse.length);
    }else{
      setTotalOrders(0)
    }
    // console.log("object",response)
    if (productResponse.length > 0) {
      setProductQueueCount(productResponse.length);
      const lowestProduct = productResponse.filter((p) => p.productQuantityremaining < 5)
      setProduct(lowestProduct)
    } else {
      setProductQueueCount(0);
      setProduct([]);
    }
    if (rechargerResponce.length > 0) {
      setRecharge(rechargerResponce)
      console.log("object", rechargerResponce)
    } else {
      setRecharge([]);
    }



  }

  return (
    <>
      <div className="min-h-screen  bg-gray-50 p-6">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">Shop Dashboard</h1>

      <h2 className='text-center p-3 rounded-3xl'>Product &amp;&amp; Invoice</h2>

        <div className=" grid grid-cols-2 md:grid-cols- gap-6">
          {/* Product Queue */}
          <div className="bg-white p-4 rounded-xl shadow-lg flex items-center gap-4">
            <FaBoxOpen className="text-blue-600 text-3xl" />
            <div>
              <h2 className="text-lg font-semibold">Product Queue</h2>
              <p className="text-gray-600">{productQueueCount} items</p>
            </div>
          </div>



          {/* Total Orders */}
          <div className="bg-white p-4 rounded-xl shadow-lg flex items-center gap-4">
            <FaShoppingCart className="text-purple-600 text-3xl" />
            <div>
              <h2 className="text-lg font-semibold">Total Orders</h2>
              <p className="text-gray-600">{totalOrders}</p>
            </div>
          </div>
        </div>

        {/* //rechage */}
        <h2 className="text-center p-3 rounded-3xl">Recharge Balance</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-3">
          {recharge.length > 0 ? (
            recharge.map((item, i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-lg flex items-center gap-4">
                <FaWallet className="text-green-600 text-3xl" />
                <div>
                  <h2 className="text-lg font-semibold">{item.operatorName} Balance</h2>
                  <p className="text-gray-600">₹ {item.remainingBalance}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-4 rounded-xl shadow-lg flex items-center gap-4">
              <FaWallet className="text-red-600 text-3xl" />
              <div>
                <h2 className="text-lg font-semibold">Recharge Balance</h2>
                <p className="text-gray-600">No Recharge Available</p>
              </div>
            </div>
          )}
        </div>



        <div className="mt-10 bg-white p-6 rounded-xl shadow-md h-[30vh] overflow-y-auto">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-700">
            <FaHistory className="text-gray-500" />
            Alert Product Remaining Que.
          </h3>
          <ul className="list-disc pl-6 text-sm text-gray-600">
            {product.length > 0 ?
              product.map((item, i) =>
                <li key={i} className="mb-2 ">
                  {item.productName} - Remaining: {item.productQuantityremaining}
                </li>
              ) : (
                <li>No products with low stock.</li>
              )}
            <li></li>

          </ul>
        </div>
      </div>
    </>
  )
}

export default Page
