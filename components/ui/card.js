export function Card({ children, className = '', ...props }) {
  return (
    <div className={`rounded-xl shadow-md ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`p-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export default Card;
