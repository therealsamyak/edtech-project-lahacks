import Link from "next/link"
import { Building2, GraduationCap, ArrowRight } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <header className="mb-10">
        <p className="eyebrow mb-3">Compliance training platform</p>
        <h1 className="mb-4">Welcome to CompliLearn</h1>
        <p className="max-w-xl">
          Register your company, complete compliance training modules, and track your progress — all
          in one place.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/register" className="group reveal">
          <Card className="h-full transition-shadow hover:elev-md">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-2">
                <Building2 className="w-5 h-5 text-accent" aria-hidden="true" />
              </div>
              <CardTitle>Register Company</CardTitle>
              <CardDescription>
                Upload your company documents and generate access credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1" />
            <CardFooter>
              <span className="inline-flex items-center gap-1.5 text-sm text-accent font-medium group-hover:gap-2.5 transition-all">
                Get started <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
            </CardFooter>
          </Card>
        </Link>

        <Link href="/training" className="group reveal">
          <Card className="h-full transition-shadow hover:elev-md">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center mb-2">
                <GraduationCap className="w-5 h-5 text-secondary" aria-hidden="true" />
              </div>
              <CardTitle>Compliance Training</CardTitle>
              <CardDescription>
                Access training modules and complete compliance quizzes
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1" />
            <CardFooter>
              <span className="inline-flex items-center gap-1.5 text-sm text-accent font-medium group-hover:gap-2.5 transition-all">
                Get started <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
            </CardFooter>
          </Card>
        </Link>
      </div>
    </div>
  )
}
