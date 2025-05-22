import React from "react";

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 px-4 sm:px-4 py-6">
  <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
    
    {/* Close Button */}
    <button
      onClick={onClose}
      className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl focus:outline-none"
      aria-label="Close"
    >
      ✖
    </button>

    {/* Modal Title */}
    {title && (
      <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">
        {title}
      </h2>
    )}

    {/* Modal Content */}
    <div className="w-full">{children}</div>
  </div>
</div>

  );
};

export default Modal;
