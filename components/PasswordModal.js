"use client";
import React, { useState } from "react";
import InputField from "./InputField";

export default function PasswordModal({ onClose, onSubmit, isSubmitting }) {
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(passwords, () => {
      setPasswords({ oldPassword: "", newPassword: "" });
    });
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl w-full max-w-lg space-y-4 shadow-xl border"
      >
        <h2 className="text-lg font-bold text-gray-800">Change Password</h2>
        <InputField
          field="oldPassword"
          name="oldPassword"
          type="password"
          value={passwords.oldPassword}
          onChange={handleChange}
        />
        <InputField
          field="newPassword"
          name="newPassword"
          type="password"
          value={passwords.newPassword}
          onChange={handleChange}
        />
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {isSubmitting ? "Updating..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
