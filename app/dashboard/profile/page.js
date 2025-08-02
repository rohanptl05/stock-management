"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { fetchuser, updateProfile, deleteCompanyLogo, changeUserPassword } from "@/app/api/actions/useractions";
import { Camera } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { toast } from "sonner";
import Image from "next/image";
import InputField from "@/components/InputField";
import PasswordModal from "@/components/PasswordModal";

export default function ProfilePage() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/');
    },
  });

  const router = useRouter();

  const defaultForm = {
    name: "",
    email: "",
    phone: "",
    address: "",
    company: "",
    companyphone: "",
    companyaddress: "",
    image: "",
    companylogo: "",
    _id: "",
  };

  const [form, setForm] = useState(defaultForm);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [passwords, setPasswords] = useState({ oldPassword: "", newPassword: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);



  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchuser(session?.user?.email);
      if (data.success) {
        setForm((prev) => ({
          ...prev,
          ...data.user,
        }));
      }
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  }, [session?.user?.email]);

  useEffect(() => {
    if (session?.user?.email) loadData();
  }, [loadData, session?.user?.email]);

  const imageURL = useCallback(async () => {
    setIsSubmitting(true);
    const res = await updateProfile(form, session?.user?.email);
    if (res.success) {
      toast.success("Image updated successfully");
      loadData();
    }
    setIsSubmitting(false);
  }, [form, session?.user?.email, loadData]);

  useEffect(() => {
    if (imageUrl) {
      imageURL();
      setImageUrl(null);
    }
  }, [imageUrl, imageURL]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const { oldPassword, newPassword } = passwords;
    if (!oldPassword || !newPassword) {
      toast.warning("Please fill both fields");
      return;
    }

    const res = await changeUserPassword(session?.user?.email, oldPassword, newPassword);
    if (res.success) {
      toast.success("Password changed successfully");
      setModalOpen(false);
      setPasswords({ oldPassword: "", newPassword: "" });
    } else {
      toast.error(res.message || "Failed to change password");
    }
  };

  const InputField = ({ field, value, onChange }) => (
    <div>
      <label htmlFor={field} className="block text-sm font-medium text-gray-600 capitalize">{field}</label>
      <input
        id={field}
        name={field}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        type="text"
        placeholder={`Enter ${field}`}
      />
    </div>
  );

  const ReadOnlyField = ({ label, value }) => (
    <div>
      <label className="block text-sm font-medium text-gray-600">{label}</label>
      <input
        value={value}
        disabled
        className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 mt-1"
      />
    </div>
  );

  const Modal = ({ title, children, onClose }) => (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-xl shadow-2xl border border-gray-200">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">{title}</h3>
        {children}
      </div>
    </div>
  );

  const ModalActions = ({ onClose }) => (
    <div className="flex justify-end gap-3 pt-4">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        {isSubmitting ? "Updating..." : "Save"}
      </button>
    </div>
  );

  function UserFormModalContent() {
    const [localForm, setLocalForm] = useState({
      name: form.name || "",
      phone: form.phone || "",
      address: form.address || "",
    });

    const handleLocalChange = (e) => {
      const { name, value } = e.target;
      setLocalForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleUserSave = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      const updated = { ...form, ...localForm };
      const res = await updateProfile(updated, session.user.email);
      if (res.success) {
        setForm(updated);
        toast.success("User updated successfully");
        setUserModalOpen(false);
        loadData();
      }
      setIsSubmitting(false);
    };



    return (
      <form onSubmit={handleUserSave} className="space-y-4">
        {["name", "phone", "address"].map((field) => (
          <InputField
            key={field}
            field={field}
            value={localForm[field]}
            onChange={handleLocalChange}
          />
        ))}
        <ReadOnlyField label="Email" value={form.email} />
        <ModalActions onClose={() => setUserModalOpen(false)} />
      </form>
    );
  }

  function CompanyFormModalContent() {
    const [localForm, setLocalForm] = useState({
      company: form.company || "",
      companyphone: form.companyphone || "",
      companyaddress: form.companyaddress || "",
    });

    const handleLocalChange = (e) => {
      const { name, value } = e.target;
      setLocalForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleCompanySave = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      const updated = { ...form, ...localForm };
      const res = await updateProfile(updated, session.user.email);
      if (res.success) {
        setForm(updated);
        toast.success("Company updated successfully");
        setCompanyModalOpen(false);
        loadData();
      }
      setIsSubmitting(false);
    };

    return (
      <form onSubmit={handleCompanySave} className="space-y-4">
        {["company", "companyphone", "companyaddress"].map((field) => (
          <InputField
            key={field}
            field={field}
            value={localForm[field]}
            onChange={handleLocalChange}
          />
        ))}
        <ModalActions onClose={() => setCompanyModalOpen(false)} />
      </form>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-10 font-sans">
      {/* USER INFO */}
      <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">User Information</h2>
          <button
            onClick={() => setUserModalOpen(true)}
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
          >
            <i className="fa-solid fa-pen-to-square"></i>
          </button>
        </div>
        {isLoading ? (
          <Image width={30} height={30} src="/assets/infinite-spinner.svg" alt="Loading..." />
        ) : (
          <div className="space-y-2">
            <div className="flex justify-center mb-4">
              <CldUploadWidget
                uploadPreset="invoices"
                onSuccess={({ event, info }) => {
                  if (event === "success") {
                    const url = info?.secure_url || info?.url;
                    setImageUrl(url);
                    setForm((prevForm) => ({ ...prevForm, image: url }));
                  }
                }}
              >
                {({ open }) => (
                  <div className="relative cursor-pointer group" onClick={() => open()}>
                    <Image
                      width={128}
                      height={128}
                      src={form.image || "/assets/user.jpg"}
                      alt="Profile"
                      className="w-32 h-32 object-cover rounded-full border-2 border-gray-300"
                    />
                    <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-md group-hover:scale-110 transition">
                      <Camera className="w-4 h-4 text-gray-600" />
                    </div>
                  </div>
                )}
              </CldUploadWidget>
            </div>
            <div><strong>Name:</strong> {form.name}</div>
            <div><strong>Email:</strong> {form.email}</div>
            <div><strong>Phone:</strong> {form.phone}</div>
            <div><strong>Address:</strong> {form.address}</div>
          </div>
        )}
      </div>

  


      {/* PASSWORD CHANGE */}
      <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold text-gray-800">Change Password</h2>
          <button
            onClick={() => setModalOpen(true)}
            className="text-sm bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition"
          >
            <i className="fa-solid fa-pen-to-square"></i>
          </button>
        </div>
      </div>

      {/* MODALS */}
      {userModalOpen && <Modal title="Edit User Info" onClose={() => setUserModalOpen(false)}><UserFormModalContent /></Modal>}
      {companyModalOpen && <Modal title="Edit Company Info" onClose={() => setCompanyModalOpen(false)}><CompanyFormModalContent /></Modal>}
      {modalOpen && (
        <PasswordModal
          isSubmitting={isSubmitting}
          onClose={() => setModalOpen(false)}
          onSubmit={async (passwords, resetFields) => {
            const { oldPassword, newPassword } = passwords;
            if (!oldPassword || !newPassword) {
              toast.warning("Please fill both fields");
              return;
            }

            setIsSubmitting(true);
            const res = await changeUserPassword(session?.user?.email, oldPassword, newPassword);
            if (res.success) {
              toast.success("Password changed successfully");
              setModalOpen(false);
              resetFields();
            } else {
              toast.error(res.message || "Failed to change password");
            }
            setIsSubmitting(false);
          }}
        />
      )}

    </div>
  );
}
