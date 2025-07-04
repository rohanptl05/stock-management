export default function InputField({ field, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label htmlFor={name || field} className="block text-sm font-medium text-gray-600 capitalize">
        {field}
      </label>
      <input
        id={name || field}
        name={name || field}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        type={type}
        placeholder={`Enter ${field}`}
      />
    </div>
  );
}
