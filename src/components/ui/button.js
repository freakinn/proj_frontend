export function Button({ children, onClick, className, ...props }) {
    return (
      <button
        onClick={onClick}
        className={`px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
  