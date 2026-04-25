export type QuizQuestion = {
  question: string
  options: string[]
  correct: number
}

export type TrainingSection = {
  id: string
  title: string
  topic: string
  duration: string
  summary: string
  detail: string
  visuals: { caption: string; tone: "accent" | "secondary" | "positive" }[]
  highlights: string[]
  quizQuestions: QuizQuestion[]
}

export const mockSections: TrainingSection[] = [
  {
    id: "gdpr",
    title: "Data Privacy & GDPR Compliance",
    topic: "Privacy",
    duration: "8 min read",
    summary:
      "Understanding how to handle personal data, customer information, and ensuring compliance with GDPR. Covers data collection, storage, processing, and deletion requirements.",
    detail:
      "GDPR establishes strict rules for how organizations collect, store, and process personal data of EU residents. As an employee, you are responsible for handling customer information lawfully — collecting only what is necessary, retaining it only as long as needed, and respecting individuals' rights to access, correct, or delete their data. When in doubt, ask before sharing data outside your team. The cost of a violation is significant, but the cost of trust lost is greater.",
    visuals: [
      { caption: "Lawful bases for processing", tone: "accent" },
      { caption: "Data subject rights", tone: "secondary" },
      { caption: "Retention and deletion", tone: "positive" },
    ],
    highlights: [
      "Collect the minimum data necessary for the purpose.",
      "Honor deletion requests within 30 days.",
      "Report breaches to the DPO within 72 hours.",
    ],
    quizQuestions: [
      {
        question: "What does GDPR stand for?",
        options: [
          "General Data Protection Regulation",
          "Global Data Privacy Rules",
          "Government Data Protection Rights",
          "General Database Protection Rights",
        ],
        correct: 0,
      },
      {
        question: "How long can you store customer data without an active business reason?",
        options: [
          "Indefinitely",
          "Up to 1 year",
          "Only as long as necessary for the stated purpose",
          "Until the customer asks for deletion",
        ],
        correct: 2,
      },
      {
        question: "What is the right to erasure?",
        options: [
          "Deleting spam emails",
          "A customer's right to request deletion of their data",
          "Removing old company files",
          "Erasing audit logs after a year",
        ],
        correct: 1,
      },
    ],
  },
  {
    id: "workplace-safety",
    title: "Workplace Safety & Harassment Prevention",
    topic: "People",
    duration: "6 min read",
    summary:
      "Creating a safe and respectful workplace environment. Recognizing harassment, reporting procedures, and fostering an inclusive culture that values every team member.",
    detail:
      "A safe workplace is built daily by every member of the team. This module explains what behaviors qualify as harassment, how to recognize subtle forms of exclusion, and how to use reporting channels confidently and confidentially. Bystander intervention is encouraged — if you see something, you can say something, in the way that feels safest to you.",
    visuals: [
      { caption: "Recognizing harassment", tone: "secondary" },
      { caption: "Reporting channels", tone: "accent" },
      { caption: "Inclusive culture", tone: "positive" },
    ],
    highlights: [
      "Reports can be made anonymously through the HR portal.",
      "Retaliation against reporters is itself a violation.",
      "Bystander intervention is encouraged and protected.",
    ],
    quizQuestions: [
      {
        question: "What should you do if you witness harassment?",
        options: [
          "Ignore it",
          "Report to HR or use the anonymous portal",
          "Wait to see if it happens again",
          "Confront the person publicly",
        ],
        correct: 1,
      },
      {
        question: "Workplace safety is whose responsibility?",
        options: ["Only managers", "Only HR", "Everyone on the team", "Only the safety officer"],
        correct: 2,
      },
    ],
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity Best Practices",
    topic: "Security",
    duration: "7 min read",
    summary:
      "Protecting company assets and data from cyber threats. Covers password management, phishing awareness, secure communication, and incident response protocols.",
    detail:
      "Most security incidents start with a single click. This module helps you spot phishing attempts, choose strong passwords, use multi-factor authentication effectively, and respond appropriately if you suspect an account or device has been compromised. The IT team would rather you over-report than under-report.",
    visuals: [
      { caption: "Phishing red flags", tone: "accent" },
      { caption: "Password & MFA hygiene", tone: "positive" },
      { caption: "Incident response", tone: "secondary" },
    ],
    highlights: [
      "Use a password manager and unique passwords per service.",
      "Verify unexpected requests on a second channel.",
      "Report suspicious emails to security@ within 24 hours.",
    ],
    quizQuestions: [
      {
        question: "How often should you change your password?",
        options: [
          "Every 30 days",
          "Every 90 days",
          "Only when compromised, with strong unique passwords",
          "Never",
        ],
        correct: 2,
      },
      {
        question: "What is phishing?",
        options: [
          "A type of computer virus",
          "Fraudulent messages designed to steal information",
          "A network monitoring tool",
          "A way to back up data",
        ],
        correct: 1,
      },
    ],
  },
]

export function getSection(id: string): TrainingSection | undefined {
  return mockSections.find((s) => s.id === id)
}
