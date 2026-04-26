# Decisions

## Task 1: Schema Merge

- `companies` table renamed to `complianceDocuments`, merged fields from `compliances`: add `slug` (from complianceId), `createdBy` (optional), keep `uuid`
- `compliances` table removed entirely (merged into complianceDocuments)
- `complianceDocs` renamed to `documentChunks`, field `complianceId` → `complianceDocumentId`
- `userCompanies` renamed to `userDocuments`, field `companyId` → `complianceDocumentId`
- `documents` table FK `companyId` → `complianceDocumentId`
- `trainingModules` table FK `companyId` → `complianceDocumentId`
- `moduleQuizzes` table added to schema
- `convex/companies.ts` renamed to `convex/documents.ts`
- `passphrase` stays as plaintext (bcrypt approach from compliances is for external auth, internal system uses plaintext)
