import { forwardRef } from 'react'

export const GridList = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ style, children, ...props }, ref) => (
  <div
    ref={ref}
    {...props}
    style={{
      ...style,
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '1.5rem',
    }}
    className="pb-8"
  >
    {children}
  </div>
))

export const GridItem = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} style={{ padding: 0 }}>
    {children}
  </div>
)
