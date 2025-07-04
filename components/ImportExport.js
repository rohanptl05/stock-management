"use client";
import React, { useRef, useState } from "react";
import { toast } from "sonner";


const ImportExport = ({ userId }) => {
      const fileRef = useRef();
  const [loading, setLoading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState(false);
  const [summary, setSummary] = useState(null);


  const handleDownload = async (format) => {
    setDownloadFormat(true)
    try {
      const res = await fetch(`/api/export?userId=${userId}&format=${format}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `full_backup_${userId}_${format}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed");
    } finally {
      setDownloadFormat(false)
    }
  };





  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) return toast.error("No file selected");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/import?userId=${userId}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) toast.success(data.message);
      else toast.error(data.message);
    } catch (err) {
      console.error(err);
      toast.error("Import failed");
    }
  };


  return (
     <div className="space-y-8 mt-6 max-w-3xl mx-auto px-4">
  {/* Export Section */}
  <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200 space-y-6">
    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">📤 Export Backup</h2>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <button
        onClick={() => handleDownload("json")}
        disabled={downloadFormat}
        className="bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition text-center"
      >
        {downloadFormat ? "Preparing JSON..." : "Download JSON Backup"}
      </button>

      <button
        onClick={() => handleDownload("csv")}
        disabled={downloadFormat}
        className="bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition text-center"
      >
        {downloadFormat ? "Preparing CSV..." : "Download CSV Backup"}
      </button>
    </div>
  </div>

  {/* Import Section */}
  <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200 space-y-6">
    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">📥 Import Backup</h2>

    <div className="space-y-4 ">
      <label className="block text-sm font-medium text-gray-700">
        Upload ZIP Backup (JSON format only)
      </label>
      <input
        type="file"
        accept=".zip"
        onChange={(e) => setFile(e.target.files[0])}
        className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2 px-6 rounded-lg transition"
      >
        {loading ? "Restoring..." : "Restore Backup"}
      </button>
    </div>
  </div>
</div>
  )
}

export default ImportExport
