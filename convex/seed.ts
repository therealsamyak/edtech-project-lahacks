import { mutation } from "./_generated/server"

export const wipeAndReseed = mutation({
  args: {},
  handler: async (ctx) => {
    let batch
    do {
      batch = await ctx.db.query("userDocuments").take(100)
      for (const doc of batch) {
        await ctx.db.delete(doc._id)
      }
    } while (batch.length > 0)

    do {
      batch = await ctx.db.query("trainingModules").take(100)
      for (const doc of batch) {
        await ctx.db.delete(doc._id)
      }
    } while (batch.length > 0)

    do {
      batch = await ctx.db.query("documents").take(100)
      for (const doc of batch) {
        await ctx.db.delete(doc._id)
      }
    } while (batch.length > 0)

    do {
      batch = await ctx.db.query("complianceDocuments").take(100)
      for (const doc of batch) {
        await ctx.db.delete(doc._id)
      }
    } while (batch.length > 0)

    const documentId = await ctx.db.insert("complianceDocuments", {
      name: "Acme Corporation",
      uuid: "comp-a7f3e9d2-4c8b-11ef-9a2c-0242ac120002",
      slug: "acme-corporation-2026",
      passphrase: "secure-dolphin-cascade-2026",
      createdAt: Date.now(),
    })

    const modules = [
      {
        title: "Data Privacy & GDPR Compliance",
        description:
          "Understanding how to handle personal data, customer information, and ensuring compliance with GDPR. Covers data collection, storage, processing, and deletion requirements.",
        content:
          "GDPR establishes strict rules for how organizations collect, store, and process personal data of EU residents. As an employee, you are responsible for handling customer information lawfully — collecting only what is necessary, retaining it only as long as needed, and respecting individuals' rights to access, correct, or delete their data.\n\nWhen in doubt, ask before sharing data outside your team. The cost of a violation is significant, but the cost of trust lost is greater.",
        duration: "8 min read",
        topics: ["Privacy", "Data handling", "Compliance"],
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
            correctIndex: 0,
          },
          {
            question: "How long can you store customer data without an active business reason?",
            options: [
              "Indefinitely",
              "Up to 1 year",
              "Only as long as necessary for the stated purpose",
              "Until the customer asks for deletion",
            ],
            correctIndex: 2,
          },
          {
            question: "What is the right to erasure?",
            options: [
              "Deleting spam emails",
              "A customer's right to request deletion of their data",
              "Removing old company files",
              "Erasing audit logs after a year",
            ],
            correctIndex: 1,
          },
        ],
        order: 0,
      },
      {
        title: "Workplace Safety & Harassment Prevention",
        description:
          "Creating a safe and respectful workplace environment. Recognizing harassment, reporting procedures, and fostering an inclusive culture that values every team member.",
        content:
          "A safe workplace is built daily by every member of the team. This module explains what behaviors qualify as harassment, how to recognize subtle forms of exclusion, and how to use reporting channels confidently and confidentially.\n\nBystander intervention is encouraged — if you see something, you can say something, in the way that feels safest to you.",
        duration: "6 min read",
        topics: ["People", "Safety", "Culture"],
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
            correctIndex: 1,
          },
          {
            question: "Workplace safety is whose responsibility?",
            options: [
              "Only managers",
              "Only HR",
              "Everyone on the team",
              "Only the safety officer",
            ],
            correctIndex: 2,
          },
        ],
        order: 1,
      },
      {
        title: "Cybersecurity Best Practices",
        description:
          "Protecting company assets and data from cyber threats. Covers password management, phishing awareness, secure communication, and incident response protocols.",
        content:
          "Most security incidents start with a single click. This module helps you spot phishing attempts, choose strong passwords, use multi-factor authentication effectively, and respond appropriately if you suspect an account or device has been compromised.\n\nThe IT team would rather you over-report than under-report.",
        duration: "7 min read",
        topics: ["Security", "IT", "Awareness"],
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
            correctIndex: 2,
          },
          {
            question: "What is phishing?",
            options: [
              "A type of computer virus",
              "Fraudulent messages designed to steal information",
              "A network monitoring tool",
              "A way to back up data",
            ],
            correctIndex: 1,
          },
        ],
        order: 2,
      },
    ]

    for (const mod of modules) {
      await ctx.db.insert("trainingModules", { complianceDocumentId: documentId, ...mod })
    }

    console.log(`Seed: inserted ${modules.length} training modules.`)
    return { status: "seeded", documentId }
  },
})
