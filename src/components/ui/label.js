export function Label({ children, htmlFor, className, ...props }) {
    return (
      <label
        htmlFor={htmlFor}
        className={`block mb-1 text-sm font-medium text-gray-700 ${className}`}
        {...props}
      >
        {children}
      </label>
    );
  }
  