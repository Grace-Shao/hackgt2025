import React from 'react'

const cx = (...classes) => classes.filter(Boolean).join(' ')

const base =
  'inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 rounded-md'

const variants = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow',
  outline: 'border border-input bg-background hover:bg-accent/50 text-foreground',
  ghost: 'bg-transparent text-foreground hover:bg-accent/40',
}

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-base',
  lg: 'h-12 px-6 text-lg',
}

export function Button({
  children,
  className = '',
  asChild = false,
  variant = 'default',
  size = 'md',
  ...props
}) {
  const classes = cx(base, variants[variant] || variants.default, sizes[size] || sizes.md, className)

  if (asChild && React.isValidElement(children)) {
    const child = React.Children.only(children)
    const childClass = cx(child.props.className || '', classes)
    return React.cloneElement(child, { className: childClass, ...props })
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}

export default Button
