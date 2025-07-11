import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-md bg-[length:200%_100%] bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
