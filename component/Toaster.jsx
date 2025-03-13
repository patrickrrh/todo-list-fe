import { useEffect } from "react";

const Toaster = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-8 left-1/2 transform -translate-x-1/2 
        px-6 py-3 text-white rounded-lg shadow-lg transition-all 
        ${type === "success" ? "bg-green-600" : "bg-red-600"}`}
    >
      {message}
    </div>
  );
};

export default Toaster;
