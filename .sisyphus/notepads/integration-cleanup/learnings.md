# Learnings

## Session ses_2384b0dd5ffeklY94QP1cT7LwK - 2026-04-26

### Convex Auth

- `auth.ts` does NOT reference companies table - no changes needed
- `users` table is overridden (Tech13-08 pattern) with `progress` field (Record<string, Record<string, number>>)
- `tokenIdentifier` is the canonical stable identifier per guidelines
- Auth tables spread via `...authSystemTables` (excluding `users` which is redefined)

### Schema Structure

- `companies` table: name, uuid, passphrase (plaintext), createdAt. Indexes: by_uuid, by_passphrase
- `compliances` table: complianceId (slug), name, passphrase (bcrypt), createdBy. Index: by_compliance_id
- `complianceDocs` table: complianceId, text, module, embedding. Indexes: by_compliance_id, by_module. Vector index: by_embedding
- `documents` table: companyId (FK to companies), storageId, originalName, uploadedAt, processingStatus. Indexes: by_companyId, by_companyId_status
- `userCompanies` table: userId (FK to users), companyId (FK to companies), verifiedAt. Indexes: by_userId, by_userId_companyId
- `trainingModules` table: companyId (FK to companies), title, description, content, duration, topics, highlights, quizQuestions, order. Index: by_companyId
- `quizResults` table: userId (FK to users), moduleId (FK to trainingModules), score, totalQuestions, passed, completedAt
- `moduleQuizzes` table: REFERENCED in ingestionHelpers.ts but NOT defined in schema

### Key File Patterns

- `convex/ingestionHelpers.ts`: getDocumentsByCompanyAndStorage, updateDocumentStatus, saveModuleQuiz, getDocumentsByStatus (duplicate)
- `convex/ingestion.ts`: processDocument (STUB), processCompanyDocuments (STUB), getDocumentsByStatus (duplicate)
- `convex/ingest.ts`: Real RAG pipeline (Tech13-08) - uses "complianceDocs" table, "compliances" table
- `convex/compliance.ts`: CRUD for compliances + complianceDocs (saveComplianceChunks, getChunksByIds, getChunksByModule, etc.)
- `convex/assistant.ts`: Hardcoded stub - "Based on your policy..."
- `convex/voiceAgent.ts`: HTTP webhook calling api.assistant.chat, extracts complianceId but doesn't pass it

### TypeScript / Build

- Uses bun (bun test, bunx tsc, bun run build)
- Convex generated types in convex/\_generated/
