import { useState } from "react";

export function AlertDialog({ trigger, title, description, onConfirm }) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    setOpen(false);
    onConfirm();
  };

  return (
    <>
      <span
        onClick={() => setOpen(true)}
        className="cursor-pointer inline-flex items-center justify-center"
      >
        {trigger}
      </span>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-md w-[90%] max-w-sm text-center space-y-4">
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="text-sm text-gray-600">{description}</p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => setOpen(false)}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-sm"
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirm}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
              >
                ログアウトする
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
