export default function Button({ href, tone = 'navy', className = '', children, type = 'button', ...props }) {
  const classes = `button button--${tone} ${className}`.trim();
  return href
    ? <a href={href} className={classes} {...props}>{children}</a>
    : <button type={type} className={classes} {...props}>{children}</button>;
}
