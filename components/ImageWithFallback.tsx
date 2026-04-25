"use client"

import { useState } from "react"
import Image, { type ImageProps } from "next/image"

const FALLBACK_SVG = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==`

interface ImageWithFallbackProps extends Omit<ImageProps, "onError"> {
  fallbackClassName?: string
}

export function ImageWithFallback({
  src,
  alt,
  className,
  fallbackClassName,
  width,
  height,
  fill,
  ...rest
}: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false)

  if (didError) {
    return (
      <div
        className={`inline-flex items-center justify-center bg-gray-100 ${fallbackClassName ?? className ?? ""}`}
        style={!fill ? { width: width ?? "100%", height: height ?? "100%" } : undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={FALLBACK_SVG}
          alt="Error"
          data-original-url={typeof src === "string" ? src : undefined}
        />
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      fill={fill}
      onError={() => setDidError(true)}
      {...rest}
    />
  )
}
