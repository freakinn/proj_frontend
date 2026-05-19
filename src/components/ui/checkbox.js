export function Checkbox({ className, ...props }) {
    return (
      <input
        type="checkbox"
        className={`h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring focus:ring-blue-300 ${className}`}
        {...props}
      />
    );
  }
  