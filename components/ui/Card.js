// components/ui/Card.js
export default function Card({ children, className = "" }) {
    return (
      <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
        {children}
      </div>
    );
  }
  