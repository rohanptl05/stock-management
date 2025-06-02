"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Modal from "@/components/Modal";
import { fetchRecharge, createRecharge, updateRecharge, deleteRecharge } from "@/app/api/actions/rechargeactions";
import { createRechargeHistory } from "@/app/api/actions/rechargeHistoryactions";
import Link from "next/link";

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
  const [isEditModal, setIsEditModal] = useState(false);
  const [editData, setEditData] = useState({
    _id: "",
    operatorName: "",
    description: "",
    date: new Date(),
  });
  const [AddBalance, setAddBalance] = useState({
    operatorId: "",
    addBalance: 0,
    useBalance: 0,
    description: "",


  });
  const [AddBalanceModal, setAddBalanceModal] = useState(false);
  const [selectedType, setSelectedType] = useState("");




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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await createRecharge(formData);

      if (response.status === 200) {
        setIsAddModal(false);
        fetchRechargeData();
        setFormData({
          user: userId,
          operatorName: "",
          totalBalance: 0,
          remainingBalance: 0,
          previousBalance: 0,
          description: "",
          date: new Date(),
        });
        alert(response.message || "Recharge added successfully.");
      } else {
        // Show error message for duplicates or other failures
        alert(response.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Error creating recharge:", error);
      alert("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };



  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await updateRecharge(editData._id, editData);
      if (response.status === 200) {
        setIsEditModal(false);
        fetchRechargeData();
        setEditData({
          operatorName: "",
          description: "",
          date: new Date(),


        });
        alert(response.message || "Recharge updated successfully.");
      }
      else {
        alert(response.message || "Something went wrong.");
      }
    }
    catch (error) {
      console.error("Error updating recharge:", error);
      alert("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id) => {

    if (!confirm("Are you sure you want to delete this recharge? This action cannot be undone.")) {
      return;
    }
    setLoading(true);
    try {
      const response = await deleteRecharge(id);
      if (response.status === 200) {
        fetchRechargeData();
        alert(response.message || "Recharge deleted successfully.");
      }
      else {
        alert(response.message || "Something went wrong.");
      }
    }
    catch (error) {
      console.error("Error deleting recharge:", error);
      alert("Server error. Please try again.");
    }
    finally {
      setLoading(false);
    }
  }

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


      <div className="mt-4">
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : (
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b">Operator Name</th>
                <th className="px-4 py-2 border-b">Total Balance</th>
                <th className="px-4 py-2 border-b">Remaining Balance</th>
                {/* <th className="px-4 py-2 border-b">Date</th> */}
                <th className="px-4 py-2 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rechargeData.map((recharge) => (
                <tr key={recharge._id}>
                  <td className="px-4 py-2 border-b"> <Link href={`recharge/${recharge._id}`}>{recharge.operatorName} </Link></td>
                  <td className="px-4 py-2 border-b">{recharge.totalBalance}</td>
                  <td className="px-4 py-2 border-b">{recharge.remainingBalance}</td>
                  {/* <td className="px-4 py-2 border-b">{new Date(recharge.date).toLocaleDateString()}</td> */}
                  <td className="px-4 py-2 border-b">
                    {/* //add Balance and recharge history new cretae */}
                    <button
                      onClick={() => {
                        setAddBalance({
                          operatorId: recharge._id,
                        });
                        setAddBalanceModal(true);
                      }}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded mr-2"
                    >
                      Add Balance
                    </button>

                    <button
                      onClick={() => {
                        setEditData({
                          _id: recharge._id,
                          operatorName: recharge.operatorName,
                          description: recharge.description,
                          date: recharge.date,
                        });
                        setIsEditModal(true);
                      }}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded mr-2"
                    >
                      Edit
                    </button>


                    <button
                      onClick={() => handleDelete(recharge._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
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
      </Modal>


      {/* edit modal */}
      <Modal
        isOpen={isEditModal}
        onClose={() => setIsEditModal(false)}
        title="EDIT OPERATOR"
        className="max-h-[80vh] sm:max-h-[75vh] overflow-y-auto"
      >
        <form className="p-3" onSubmit={handleEditSubmit}>
          <div className="mb-4">
            <label htmlFor="operatorName" className="block text-sm font-medium text-gray-700">
              Operator Name
            </label>
            <input
              type="text"
              name="operatorName"
              value={editData.operatorName}
              onChange={(e) => setEditData({ ...editData, operatorName: e.target.value })}
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
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              rows={4}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            ></textarea>
          </div>

          <div className="flex justify-between">
            <button type="button" onClick={() => setIsEditModal(false)} className="bg-red-500 text-white px-4 py-2 rounded">
              Close
            </button>
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Balance Modal */}
      <Modal
        isOpen={AddBalanceModal}
        onClose={() => setAddBalanceModal(false)}
        title="ADD BALANCE"
        className="max-h-[80vh] sm:max-h-[75vh] overflow-y-auto"
      >
        <form
          className="p-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);

            // Validation: Must enter one of the amounts
            if (
              selectedType === "" ||
              (selectedType === "add" && !AddBalance.addBalance) ||
              (selectedType === "use" && !AddBalance.useBalance)
            ) {
              alert("Please select a type and enter the amount.");
              setLoading(false);
              return;
            }
           

            try {
              const response = await createRechargeHistory({
                user: userId,
                operatorId: AddBalance.operatorId,
                addBalance: selectedType === "add" ? AddBalance.addBalance : 0,
                useBalance: selectedType === "use" ? AddBalance.useBalance : 0,
                description: AddBalance.description,
                date: new Date(),
              });


              if (response.status === 200) {
                setAddBalanceModal(false);
                fetchRechargeData();
                setAddBalance({
                  operatorId: "",
                  addBalance: 0,
                  useBalance: 0,
                  description: "",
                });
                setSelectedType(""); // Reset type
                alert(response.message || "Balance added successfully.");
              } else {
                alert(response.message || "Something went wrong.");
              }
            } catch (error) {
              console.error("Error adding balance:", error);
              alert("Server error. Please try again.");
            } finally {
              setLoading(false);
            }
          }}
        >
          {/* Dropdown to select type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setAddBalance({
                  ...AddBalance,
                  addBalance: 0,
                  useBalance: 0,
                });
              }}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm sm:text-sm"
              required
            >
              <option value="">-- Select Type --</option>
              <option value="add">Add Balance</option>
              <option value="use">Use Balance</option>
            </select>
          </div>

          {/* Conditionally render the input based on selected type */}
          {selectedType === "add" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Add Balance</label>
              <input
                type="number"
                value={AddBalance.addBalance}
                onChange={(e) => setAddBalance({ ...AddBalance, addBalance: Number(e.target.value) })}
                required
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
          )}

          {selectedType === "use" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Use Balance</label>
              <input
                type="number"
                value={AddBalance.useBalance}
                onChange={(e) => setAddBalance({ ...AddBalance, useBalance: Number(e.target.value) })}
                required
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={AddBalance.description}
              onChange={(e) => setAddBalance({ ...AddBalance, description: e.target.value })}
              rows={4}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm sm:text-sm"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            {loading ? "Saving..." : "Submit"}
          </button>
        </form>
      </Modal>

    </div>
  );
};

export default Page;
