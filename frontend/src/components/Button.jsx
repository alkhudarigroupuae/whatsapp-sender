export function Button({ as, variant = 'primary', size = 'md', className = '', ...props }) {
  const Component = as || 'button'
  return <Component {...props} className={`btn btn-${variant} btn-${size} ${className}`.trim()} />
}

