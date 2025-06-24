"use client"
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { fetchuser, updateProfile } from "@/app/api/actions/useractions";
import { Camera } from "lucide-react";
import Image from "next/image";
import { deleteCompanyLogo, deleteProfile } from "@/app/api/actions/useractions";
import { changeUserPassword } from "@/app/api/actions/useractions";
import { toast } from "sonner";

export default function ProfilePage() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/');
    },
  });
  const router = useRouter();
  const [form, setForm] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [publicId, setPublicId] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);


  const [passwordError, setPasswordError] = useState(null);


  useEffect(() => {
    if (!session) {
      router.push("/");
    } else {
      loadData();
    }
  }, [session]);

  useEffect(() => {
    if (imageUrl) {
      console.log("imageUrl", imageUrl);
      imageURL();
      setImageUrl(null);
    }
  }, [imageUrl]);


  const imageURL = async () => {

    const res = await updateProfile(form, session?.user?.email);
    if (res.success) {
      
      loadData();
    }
  };


  const loadData = async () => {
    setIsLoading(true)
    const data = await fetchuser(session?.user?.email);
    if (data) setForm(data);
    setIsLoading(false)
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    setIsLoading(true);
     setIsSubmitting(true);
    const success = await updateProfile(form, session.user.email);
    if (success) {
      toast.success(`${type} updated successfully`);
      if (type === "User") setUserModalOpen(false);
      if (type === "Company") setCompanyModalOpen(false);
      loadData();
    }
    setIsLoading(false)
    setIsSubmitting(false)
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { oldPassword, newPassword } = passwords;
   if (!oldPassword || !newPassword) {
  toast.warning("Please fill both fields");
  setIsSubmitting(false);
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
    setIsSubmitting(false)
  };


  // Reusable Components

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
  <div className="fixed inset-0 bg-opacity-40 flex justify-center items-center z-50">
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
     disabled={isSubmitting}
      className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
    >
      {isSubmitting ? "updating..." : "Save"}
    </button>
  </div>
);

  if (!session) return null;

  return (
     <>
    <div className="p-6 max-w-5xl mx-auto space-y-10 font-sans">
      {/* User Info */}
      <div className="bg-white shadow-lg flex-col-2  rounded-2xl p-8 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">User Information</h2>
          <button
            onClick={() => setUserModalOpen(true)}
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
          >
            <i className="fa-solid fa-pen-to-square"></i>
          </button>
        </div>
        {isLoading ? (<div>
          <Image
            width={2000}
            height={2000}
            src="/assets/infinite-spinner.svg"
            alt="Loading..."
            className="w-6 h-6 mx-auto"
          />
        </div>) : (<div className="flex-col-2 gap-6 text-gray-700">
          <div className="relative col-span-2  flex justify-center sm:justify-start items-center mb-4">


            <div className="relative">
              
              <Image
                width={2000}
                height={2000}
                src={form?.image || "/assets/user.jpg"}
                alt="Profile pic"
                onClick={() => open()}
                title="Click to change Profile"
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = "/assets/user.jpg"; 
                }}

                className="w-32 h-32 object-cover cursor-pointer rounded-full border-2 border-gray-300"
              />

              {/* Change (Camera) Icon */}
              <div
                className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-md hover:scale-110 transition cursor-pointer"
                onClick={() => open(
                  input => {
                    const file = input.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setImageUrl(reader.result);
                      };
                      reader.readAsDataURL(file);
                    }
                  }
                )}
                title="Change Profile"
              >
                <Camera className="w-4 h-4 text-gray-600" />
              </div>
            </div>


         
          </div>
          <div className="flex gap-2 m-2"><strong>Name:</strong> {form.name}</div>
          <div className="flex gap-2 m-2"><strong>Email:</strong> {form.email}</div>
          <div className="flex gap-2 m-2"><strong>Phone:</strong> {form.phone}</div>
          <div className="flex gap-2 m-2"><strong>Address:</strong> {form.address}</div>
        </div>)

        }

      </div>




      {/* password changes */}
      <div className="bg-white shadow-lg flex-col-2  rounded-2xl p-8 border border-gray-200">
        <div className="flex justify-between items-center m-1">
          <h2 className="sm:text-2xl text-sm font-bold text-gray-800">Change Password</h2>
          <button
            onClick={() => setModalOpen(true)}
            className="text-sm bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition"
          >
            <i className="fa-solid fa-pen-to-square"></i>
          </button>
        </div>
     

      </div>

      {modalOpen && (
        <Modal title="Change Password" onClose={() => setModalOpen(false)}>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Old Password</label>
              <input
                type="password"
                name="oldPassword"
                value={passwords.oldPassword}
                onChange={handlePasswordChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1"
              />
            </div>
            <ModalActions onClose={() => setModalOpen(false)} />
          </form>
        </Modal>
      )}
      {/* User Modal */}
      {userModalOpen && (
        <Modal title="Edit User Information" onClose={() => setUserModalOpen(false)}>
          <form onSubmit={(e) => handleSubmit(e, "User")} className="space-y-4">
            {["name", "phone", "address"].map((field) => (
              <InputField key={field} field={field} value={form[field] || ""} onChange={handleChange} />
            ))}
            <ReadOnlyField label="Email" value={form.email} />
            <ModalActions onClose={() => setUserModalOpen(false)} />
          </form>
        </Modal>
      )}

      {/* Company Modal */}
      {companyModalOpen && (
        <Modal title="Edit Company Information" onClose={() => setCompanyModalOpen(false)}>
          <form onSubmit={(e) => handleSubmit(e, "Company")} className="space-y-4">
            {["company", "companyphone", "companyaddress"].map((field) => (
              <InputField key={field} field={field} value={form[field] || ""} onChange={handleChange} />
            ))}
            <ModalActions onClose={() => setCompanyModalOpen(false)} />
          </form>
        </Modal>
      )}




    </div>




   </>
  );
}

