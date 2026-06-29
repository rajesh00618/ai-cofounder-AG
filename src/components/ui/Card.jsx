export default function Card({ children, className = '', hover = true, ...props }) {
  return (
    <div
      className={`card ${className}`.trim()}
      style={hover ? undefined : { boxShadow: 'none' }}
      {...props}
    >
      {children}
    </div>
  )
}
