export type PolicyArea = "hipaa" | "gdpr" | "soc2" | "internal"

export interface PolicySection {
  policyArea: PolicyArea
  section: string
  title: string
  text: string
}

export interface Violation {
  policyArea: PolicyArea
  section: string
  description: string
  severity: "low" | "medium" | "high"
}

export interface ComplianceCheckResult {
  compliant: boolean
  violations: Violation[]
  suggestedFix?: string
}

const POLICY_LIBRARY: PolicySection[] = [
  {
    policyArea: "hipaa",
    section: "§164.312(b)",
    title: "Audit controls",
    text: "Implement hardware, software, and procedural mechanisms that record and examine activity in information systems that contain or use electronic protected health information. Logs containing PHI must be encrypted at rest and access-controlled; plain-text logs of patient identifiers, diagnoses, or treatment data are prohibited.",
  },
  {
    policyArea: "hipaa",
    section: "§164.312(a)(1)",
    title: "Access control",
    text: "Implement technical policies and procedures for electronic information systems that maintain electronic protected health information to allow access only to those persons or software programs that have been granted access rights.",
  },
  {
    policyArea: "hipaa",
    section: "§164.312(e)(1)",
    title: "Transmission security",
    text: "Implement technical security measures to guard against unauthorized access to electronic protected health information that is being transmitted over an electronic communications network. ePHI must be encrypted in transit using TLS 1.2 or higher.",
  },
  {
    policyArea: "gdpr",
    section: "Art. 32",
    title: "Security of processing",
    text: "Taking into account the state of the art and the nature of the processing, the controller shall implement appropriate technical and organisational measures to ensure a level of security appropriate to the risk, including pseudonymisation and encryption of personal data.",
  },
  {
    policyArea: "gdpr",
    section: "Art. 17",
    title: "Right to erasure",
    text: "The data subject shall have the right to obtain from the controller the erasure of personal data concerning him or her without undue delay. Systems must support hard deletion of user records on request, including downstream caches and analytics stores.",
  },
  {
    policyArea: "soc2",
    section: "CC6.1",
    title: "Logical access security",
    text: "The entity implements logical access security software, infrastructure, and architectures over protected information assets. Production credentials, API keys, and secrets must never be committed to source control or logged in plain text.",
  },
  {
    policyArea: "internal",
    section: "ENG-SEC-001",
    title: "PII handling in logs",
    text: "Application logs must not contain personally identifiable information (full name, email, phone, address, government ID, payment details). Use structured logging with explicit allow-listed fields. PII fields must be redacted or hashed before being written to any log destination.",
  },
]

export function findPolicySection(query: string, policyArea?: PolicyArea): PolicySection[] {
  const haystack = policyArea
    ? POLICY_LIBRARY.filter((p) => p.policyArea === policyArea)
    : POLICY_LIBRARY

  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2)

  const scored = haystack
    .map((p) => {
      const text = `${p.title} ${p.text}`.toLowerCase()
      const score = terms.reduce((s, t) => (text.includes(t) ? s + 1 : s), 0)
      return { p, score }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.p)

  return scored.length > 0 ? scored : haystack.slice(0, 1)
}

const VIOLATION_RULES: Array<{
  match: RegExp
  violation: Omit<Violation, "severity"> & { severity: Violation["severity"] }
  fix: string
}> = [
  {
    match: /console\.log\s*\([^)]*\b(patient|ssn|dob|diagnosis|mrn|phi)\b/i,
    violation: {
      policyArea: "hipaa",
      section: "§164.312(b)",
      description:
        "Logging PHI (patient identifier, SSN, DOB, diagnosis, MRN) to console writes plain-text protected health information to log destinations.",
      severity: "high",
    },
    fix: "Remove the PHI from the log statement entirely, or use a redaction helper (e.g. `redactPHI(record)`) before logging. Consider logging a non-identifying request ID instead.",
  },
  {
    match: /(fs\.(append|write)FileSync|writeFile)\s*\([^)]*\b(patient|ssn|phi|medical)\b/i,
    violation: {
      policyArea: "hipaa",
      section: "§164.312(b)",
      description:
        "Writing PHI to a plain-text file violates audit-control encryption requirements.",
      severity: "high",
    },
    fix: "Write PHI only to the encrypted clinical store. If audit logging is required, use the `auditLog()` helper which encrypts at rest.",
  },
  {
    match: /(API_KEY|SECRET|PASSWORD|TOKEN)\s*=\s*["'`][A-Za-z0-9_-]{8,}/,
    violation: {
      policyArea: "soc2",
      section: "CC6.1",
      description:
        "Hardcoded credential or API key in source code. Production secrets must come from the secret manager.",
      severity: "high",
    },
    fix: "Read the value from `process.env` and load it from the secret manager (Doppler / AWS Secrets Manager / Vault) at runtime. Never commit the literal value.",
  },
  {
    match: /http:\/\/[^\s"'`]*(api|patient|user|account|login)/i,
    violation: {
      policyArea: "hipaa",
      section: "§164.312(e)(1)",
      description:
        "Sending sensitive data over plain HTTP violates transmission-security requirements.",
      severity: "medium",
    },
    fix: "Switch the URL to HTTPS and verify the server certificate. ePHI must be encrypted in transit (TLS 1.2+).",
  },
  {
    match: /\bemail\b\s*:\s*[^,}]+\s*,[\s\S]{0,80}\blog/i,
    violation: {
      policyArea: "internal",
      section: "ENG-SEC-001",
      description: "Email field included in a log record without redaction.",
      severity: "medium",
    },
    fix: "Remove the email from the log payload, or hash it with `hashPII(email)` if you need to correlate without exposing.",
  },
]

export function checkComplianceMock(code: string, policyArea?: PolicyArea): ComplianceCheckResult {
  const violations: Violation[] = []
  const fixes: string[] = []

  for (const rule of VIOLATION_RULES) {
    if (policyArea && rule.violation.policyArea !== policyArea) continue
    if (rule.match.test(code)) {
      violations.push(rule.violation)
      fixes.push(rule.fix)
    }
  }

  return {
    compliant: violations.length === 0,
    violations,
    suggestedFix: fixes.length > 0 ? fixes.join(" ") : undefined,
  }
}
