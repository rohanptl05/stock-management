"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Modal from "@/components/Modal";
import { fetchRecharge, createRecharge, updateRecharge, deleteRecharge } from "@/app/api/actions/rechargeactions";
import { createRechargeHistory } from "@/app/api/actions/rechargeHistoryactions";
import Link from "next/link";
import Image from "next/image";

const Page = () => {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });
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
    remainingBalance: 0,


  });
  const [AddBalanceModal, setAddBalanceModal] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);



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
      remainingBalance: name === "totalBalance" ? value : prev.totalBalance
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

  const itemsPerPage = 5;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const paginatedrechargeData = (Array.isArray(rechargeData) ? rechargeData : []).slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil((Array.isArray(rechargeData) ? rechargeData.length : 0) / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="container ">
      <div className="flex justify-between">
        <h1 className="text-4xl font-bold">Recharge</h1>
        <button
          onClick={() => setIsAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-md transition-all"
        >
          New Operator
        </button>
      </div>


      <div className="   sm:min-h-[75vh] h-[62vh] overflow-y-auto mt-3">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300 shadow-sm rounded-lg overflow-hidden text-sm">
          <thead className="bg-gray-100 border-b text-sm text-gray-700 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-2 border-b">Operator Name</th>
              <th className="px-4 py-2 border-b">Total Balance</th>
              <th className="px-4 py-2 border-b">Remaining Balance</th>
              {/* <th className="px-4 py-2 border-b">Date</th> */}
              <th className="px-4 py-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="18" className="px-4 py-4 text-center">
                  <Image
                    width={2000}
                    height={2000}
                    src="/assets/infinite-spinner.svg"
                    alt="Loading..."
                    className="w-6 h-6 mx-auto"
                  />

                </td>
              </tr>
            ) : (paginatedrechargeData.length > 0 ? (
              paginatedrechargeData.map((recharge) => (
                <tr key={recharge._id} className="text-center">
                  <td className="px-4 py-2 border-b">
                    <Link href={`recharge/${recharge._id}?name=${encodeURIComponent(recharge.operatorName)}`}>{recharge.operatorName}</Link>
                  </td>
                  <td className="px-4 py-2 border-b">{recharge.totalBalance}</td>
                  <td className="px-4 py-2 border-b">{recharge.remainingBalance}</td>
                  <td className="px-4 py-2 border-b">
                    <button
                      onClick={() => {
                        setAddBalance({ operatorId: recharge._id, remainingBalance: recharge.remainingBalance });
                        setSelectedType("");
                        setAddBalanceModal(true);
                      }}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded mr-2"
                    >
                      <i className="fa-solid fa-plus-minus"></i>
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
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded mr-2"
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>

                    <button
                      onClick={() => handleDelete(recharge._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))) : (
              <tr>
                <td colSpan="8" className="px-4 py-4 text-center text-gray-500">
                  No Recharge Data found.
                </td>
              </tr>
            )
            )}

          </tbody>
        </table>
      </div>

      {/* pagination */}
      <div className="flex justify-center items-center gap-2 mt-4">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >
          Prev
        </button>

        {[...Array(totalPages)].map((_, pageNum) => (
          <button
            key={pageNum}
            onClick={() => setCurrentPage(pageNum + 1)}
            className={`px-3 py-1 rounded ${currentPage === pageNum + 1 ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            {pageNum + 1}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >
          Next
        </button>
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

      {/* Add and use Balance Modal */}
      {/* Add Balance Modal */}
      <Modal
        isOpen={AddBalanceModal}
        onClose={() => setAddBalanceModal(false)}
        title="ADD BALANCE OR USE BALANCE"
        className="max-h-[80vh] sm:max-h-[75vh] overflow-y-auto"
      >
        <form
          className="p-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);

            // 1) Basic validation: must choose a type and enter a number
            if (
              selectedType === "" ||
              (selectedType === "add" && !AddBalance.addBalance) ||
              (selectedType === "use" && !AddBalance.useBalance)
            ) {
              alert("Please select a type and enter the amount.");
              setLoading(false);
              return;
            }

            // 2) Extra validation: if using, must not exceed remainingBalance
            if (
              selectedType === "use" &&
              AddBalance.useBalance > AddBalance.remainingBalance
            ) {
              alert(
                `You cannot use more than the available balance (${AddBalance.remainingBalance}).`
              );
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
                  remainingBalance: 0,
                });
                setSelectedType("");
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

          {/* “Add Balance” input */}
          {selectedType === "add" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Add Balance</label>
              <input
                type="number"
                value={AddBalance.addBalance}
                onChange={(e) =>
                  setAddBalance({ ...AddBalance, addBalance: Number(e.target.value) })
                }
                required
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
          )}

          {/* “Use Balance” input + real-time warning */}
          {selectedType === "use" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Use Balance</label>
              <input
                type="number"
                value={AddBalance.useBalance}
                onChange={(e) =>
                  setAddBalance({ ...AddBalance, useBalance: Number(e.target.value) })
                }
                required
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
              {AddBalance.useBalance > AddBalance.remainingBalance && (
                <p className="text-sm text-red-600">
                  Cannot use more than {AddBalance.remainingBalance}.
                </p>
              )}
            </div>
          )}

          {/* Description */}
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
