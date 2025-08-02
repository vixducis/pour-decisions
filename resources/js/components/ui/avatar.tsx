import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  )
}

interface AvatarFallbackProps extends React.ComponentProps<typeof AvatarPrimitive.Fallback> {
  userId?: number;
}

function AvatarFallback({
  className,
  userId,
  ...props
}: AvatarFallbackProps) {
  const getAvatarColors = (id: number) => {
    const colors = [
      'bg-gradient-to-br from-blue-400 to-purple-400',
      'bg-gradient-to-br from-green-400 to-blue-400',
      'bg-gradient-to-br from-purple-400 to-pink-400',
      'bg-gradient-to-br from-yellow-400 to-orange-400',
      'bg-gradient-to-br from-pink-400 to-red-400',
      'bg-gradient-to-br from-indigo-400 to-purple-400',
      'bg-gradient-to-br from-teal-400 to-green-400',
      'bg-gradient-to-br from-orange-400 to-red-400',
      'bg-gradient-to-br from-cyan-400 to-blue-400',
      'bg-gradient-to-br from-emerald-400 to-teal-400',
    ];
    return colors[id % colors.length];
  };

  const baseClassName = "flex size-full items-center justify-center rounded-full text-white";
  const backgroundClassName = userId !== undefined ? getAvatarColors(userId) : "bg-muted";

  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        baseClassName,
        backgroundClassName,
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
