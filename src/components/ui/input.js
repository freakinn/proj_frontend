export function Input({ className, ...props }) {
    return (
      <input
        className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300 ${className}`}
        {...props}
      />
    );
  }
  