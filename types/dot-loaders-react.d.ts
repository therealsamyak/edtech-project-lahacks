declare module "@dot-loaders/react" {
  import { type CSSProperties, type FC } from "react"

  interface LoaderInlineProps {
    loader?: string
    renderer?: string
    style?: CSSProperties
    className?: string
    children?: React.ReactNode
  }

  export const LoaderInline: FC<LoaderInlineProps>
}
