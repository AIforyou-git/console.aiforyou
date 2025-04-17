// components/ui/Modal.js
export default function Modal({ children }) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-6 w-[90%] max-w-xl shadow-lg">
          {children}
        </div>
      </div>
    );
  }
  