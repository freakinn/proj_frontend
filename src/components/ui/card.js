export function Card({ children, className, ...props }) {
    return (
      <div className={`p-4 shadow-md rounded-lg bg-white ${className}`} {...props}>
        {children}
      </div>
    );
  }
  
  export function CardContent({ children, className, ...props }) {
    return (
      <div className={`mt-2 ${className}`} {...props}>
        {children}
      </div>
    );
  }
  