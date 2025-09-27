import React from 'react';

export function Button({ children, className = '', asChild = false, ...props }) {
  const Tag = asChild ? React.Fragment : 'button';

  const content = (
    <button className={`px-3 py-1 rounded-md text-sm ${className}`} {...props}>
      {children}
    </button>
  );

  if (asChild) return children;
  return content;
}

export default Button;
