"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Modal from "@/components/Modal";
import { fetchRecharge, createRecharge } from "@/app/api/actions/rechargeactions";

const Page = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [isAddModal, setIsAddModal] = useState(false);
  const [rechargeData, setRechargeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    user: userId,
    operatorName: "",
    totalBalance: 0,
    remainingBalance: 0,
    previousBalance: 0,
    description: "",
    date: new Date(),
  });



  const fetchRechargeData = async () => {
    setLoading(true);
    try {
      const data = await fetchRecharge(session.user.id, "active");
      if (data) setRechargeData(data);
    } catch (error) {
      console.error("Error fetching recharge data:", error);
    } finally {
      setLoading(false);
    }
  };
    useEffect(() => {
     fetchRechargeData();
  }, [userId]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const response = await createRecharge(formData);
//       if (response.status === 200) {
//         setIsAddModal(false);
//         fetchRechargeData();
//         setFormData({
//           user: userId,
//           operatorName: "",
//           totalBalance: 0,
//           remainingBalance: 0,
//           previousBalance: 0,
//           description: "",
//           date: new Date(),
//         });
//         alert(response.message || "Recharge added successfully.");
//       }
//     } catch (error) {
//       console.error("Error creating recharge:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

  return (
    <div className="container p-3">
      <div className="flex justify-between">
        <h1 className="text-4xl font-bold">Recharge</h1>
        <button
          onClick={() => setIsAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-md transition-all"
        >
          New Operator
        </button>
      </div>

      {/* <Modal
        isOpen={isAddModal}
        onClose={() => setIsAddModal(false)}
        title="ADD OPERATOR"
        className="max-h-[80vh] sm:max-h-[75vh] overflow-y-auto"
      >
        <form className="p-3" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="operatorName" className="block text-sm font-medium text-gray-700">
              Operator Name
            </label>
            <input
              type="text"
              name="operatorName"
              value={formData.operatorName}
              onChange={handleChange}
              required
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="totalBalance" className="block text-sm font-medium text-gray-700">
              Add Balance
            </label>
            <input
              type="number"
              name="totalBalance"
              value={formData.totalBalance}
              onChange={handleChange}
              required
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            ></textarea>
          </div>

          <div className="flex justify-between">
            <button type="button" onClick={() => setIsAddModal(false)} className="bg-red-500 text-white px-4 py-2 rounded">
              Close
            </button>
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
              Add Operator
            </button>
          </div>
        </form>
      </Modal> */}
    </div>
  );
};

export default Page;
