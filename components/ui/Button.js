// components/ui/Button.js
export default function Button({ children, onClick, className = "", type = "button", disabled = false }) {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 ${className}`}
      >
        {children}
      </button>
    );
  }
  