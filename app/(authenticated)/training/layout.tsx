import { AssistantPopover } from "@/components/AssistantPopover"

export default function TrainingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AssistantPopover />
    </>
  )
}
