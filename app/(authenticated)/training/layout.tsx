import { FloatingButtonGroup } from "@/components/FloatingButtonGroup"

export default function TrainingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <FloatingButtonGroup />
    </>
  )
}
