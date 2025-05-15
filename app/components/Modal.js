import React from "react";

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 px-2 sm:px-4 py-6">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl sm:max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
          aria-label="Close"
        >
          ✖
        </button>

        {/* Title */}
        {title && <h2 className="text-xl font-bold mb-4 text-center">{title}</h2>}

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
