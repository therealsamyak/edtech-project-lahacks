# Integration Cleanup: Deduplicate, Merge & Rename company→compliance document

## TL;DR

> **Quick Summary**: Resolve redundancy between main-branch code and Tech13-08's additions on `sk/integration-testing`. Rename all "company" terminology to "compliance document" throughout schema/backend/frontend. Merge two parallel data models into one. Wire stubs to real AI. Remove dead code.
>
> **Deliverables**:
>
> - Unified schema: `companies` + `compliances` merged → single `complianceDocuments` table
> - All "company" wording replaced with "compliance document" wording (backend + frontend)
> - Single ingestion pipeline (Tech13-08's `ingest.ts` wins)
> - `assistant.ts` wired to real `ComplianceAIService`
> - Voice agent returns real answers
> - All redundant/duplicate functions removed
> - Clean build + tests pass
>
> **Estimated Effort**: Large
> **Parallel Execution**: NO — sequential
> **Critical Path**: Task 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → F1-F4

## Context

### Original Request

Compare `sk/integration-testing` to `main`, identify redundancy + integration gaps, create cleanup plan. Prioritize Tech13-08 logic. Rename all "company" → "compliance document" because system is per-compliance-document not per-company (hackathon simplification). Sequential execution. Branch-only commits.

### Authorship Map

| Author               | Commits | Added                                                                                                     |
| -------------------- | ------- | --------------------------------------------------------------------------------------------------------- |
| therealsamyak (main) | 26      | Base: companies/documents/trainingModules schema, ingestion stubs, quiz scoring, training views, auth, UI |
| Tirth Shah           | 4       | ElevenLabs voice agent (voice.ts, voiceAgent.ts, VoiceAgent.tsx, VoiceAgentPopover.tsx)                   |
| Tech13-08            | 6       | RAG pipeline: compliance.ts, ingest.ts, ai_service.ts, user.ts, src/services/ai.ts, schema changes        |

### Redundancy Inventory

**1. Duplicate ingestion pipelines**:

- `convex/ingestion.ts` (main) — `processDocument` stub, `getDocumentsByStatus`
- `convex/ingest.ts` (Tech13-08) — real PDF parsing + embedding + RAG
- `convex/ingestionHelpers.ts` — duplicate `getDocumentsByStatus`, `saveModuleQuiz` refs missing table

**2. Duplicate AI layers**:

- `convex/assistant.ts` (main) — hardcoded stub
- `convex/ai_service.ts` (Tech13-08) — thin wrapper around src/services/ai.ts
- `src/services/ai.ts` — real ComplianceAIService

**3. Dual data models (companies vs compliances)**:

- `companies` table (main) vs `compliances` table (Tech13-08) — same concept, different schemas
- `documents` vs `complianceDocs` — raw files vs processed chunks
- `companies.passphrase` (plaintext) vs `compliances.passphrase` (bcrypt)
- `complianceId` field is a slug, not an ID — confusing naming
- `moduleQuizzes` table referenced but not defined in schema

**4. Voice agent gap**:

- `voiceAgent.ts` calls `api.assistant.chat` (stub) instead of real AI

### Metis Review

- Confirmed moduleQuizzes dangling ref
- Confirmed assistant.ts stub needs real wiring
- Confirmed two ingestion pipelines need merge
- No blocking issues beyond identified redundancies

## Work Objectives

### Core Objective

Merge two parallel codepaths into one coherent system. Rename "company" → "compliance document" everywhere. Tech13-08's RAG pipeline is canonical; main-branch stubs get removed or rewired.

### Concrete Deliverables

- `convex/schema.ts` — unified, no dangling refs, clear naming
- `convex/companies.ts` → renamed to reflect compliance document concept
- All frontend: "company" → "compliance document" wording
- `convex/assistant.ts` — real AI integration
- Single ingestion path
- Voice agent wired to real answers

### Definition of Done

- [ ] `bun test` passes
- [ ] `bunx tsc --noEmit` passes
- [ ] `bun run build` passes
- [ ] Zero "company" references in user-facing text (except signin placeholder)
- [ ] Zero duplicate functions across convex files
- [ ] `assistant.ts` returns real AI answers
- [ ] `moduleQuizzes` reference resolved

### Must Have

- Tech13-08's ComplianceAIService as canonical AI layer
- Tech13-08's ingest pipeline as canonical ingestion
- Tech13-08's user progress tracking
- Voice agent wired to real AI
- Zero duplicate functions
- "company" → "compliance document" rename everywhere

### Must NOT Have (Guardrails)

- NO pushing to main — this branch (`sk/integration-testing`) only
- NO parallel execution — sequential task by task
- NO touching `src/services/ai.ts` or `src/services/ai.test.ts`
- NO touching ElevenLabs `voice.ts`
- NO new features — cleanup + rename only
- NO excessive AI comments, JSDoc on every line, or over-abstraction

## Verification Strategy

### Test Decision

- **Infrastructure exists**: YES (vitest)
- **Automated tests**: Tests-after (verify existing tests pass after each change)
- **Framework**: vitest (`bun test`)

### QA Policy

Every task includes agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

## Execution Strategy

> **SEQUENTIAL EXECUTION** — one task at a time. No parallel waves.

```
Task 1: Schema + backend: merge tables + rename company→compliance document [deep]
Task 2: Frontend: rename all company→compliance document wording [unspecified-high]
Task 3: Remove duplicate getDocumentsByStatus [quick]
Task 4: Merge ingestion pipelines (remove stubs) [deep]
Task 5: Consolidate ai_service.ts wrapper [quick]
Task 6: Wire assistant.ts to ComplianceAIService [deep]
Task 7: Wire voiceAgent.ts to pass document context [quick]
Task 8: Remove dead seed-data.ts [quick]
Task 9: Full build + test verification [quick]
Task FINAL: F1-F4 parallel review → user okay
```

### Agent Dispatch Summary

| Task | Category         | Skills |
| ---- | ---------------- | ------ |
| 1    | deep             | convex |
| 2    | unspecified-high | convex |
| 3    | quick            | convex |
| 4    | deep             | convex |
| 5    | quick            | convex |
| 6    | deep             | convex |
| 7    | quick            | convex |
| 8    | quick            | []     |
| 9    | quick            | convex |
| F1   | oracle           | []     |
| F2   | unspecified-high | []     |
| F3   | unspecified-high | []     |
| F4   | deep             | []     |

## TODOs

- [x] 1. Schema + Backend: Merge Tables & Rename company→compliance document

  **What to do**:
  - **Rename `companies` table → `complianceDocuments`** in `convex/schema.ts`. Merge useful fields from `compliances` table into it. Final schema:
    ```
    complianceDocuments: defineTable({
      name: v.string(),
      uuid: v.string(),            // from companies (access credential)
      slug: v.string(),            // from compliances.complianceId (URL-friendly identifier)
      passphrase: v.string(),      // use bcrypt from compliances approach
      createdBy: v.optional(v.string()),  // from compliances
      createdAt: v.number(),
    }).index("by_uuid", ["uuid"]).index("by_slug", ["slug"])
    ```
  - **Remove `compliances` table** — merged into `complianceDocuments` above
  - **Rename `complianceDocs` table → `documentChunks`** — clearer name for processed/embedded text chunks. Rename field `complianceId` → `complianceDocumentId`
  - **Rename `userCompanies` → `userDocuments`**. Rename field `companyId` → `complianceDocumentId`
  - **Rename FK in `documents` table**: `companyId` → `complianceDocumentId`
  - **Rename FK in `trainingModules` table**: `companyId` → `complianceDocumentId`
  - **Add missing `moduleQuizzes` table**:
    ```
    moduleQuizzes: defineTable({
      complianceDocumentId: v.string(),
      module: v.string(),
      quizItems: v.array(v.object({
        question: v.string(),
        options: v.array(v.string()),
        correctIndex: v.number(),
      })),
    }).index("by_document_module", ["complianceDocumentId", "module"])
    ```
  - **Update ALL convex files** to use new table/field names:
    - `convex/compliance.ts` — all refs to `compliances`, `complianceDocs`, `complianceId` → `complianceDocuments`, `documentChunks`, `complianceDocumentId`
    - `convex/ingest.ts` — same renames
    - `convex/quiz.ts` — `complianceId` → `complianceDocumentId`, table refs
    - `convex/user.ts` — `complianceId` in progress tracking → `complianceDocumentId`
    - `convex/ingestionHelpers.ts` — `complianceId` → `complianceDocumentId`, `moduleQuizzes` ref, `companyId` → `complianceDocumentId`
    - `convex/voiceAgent.ts` — `complianceId` → `complianceDocumentId`
  - **Rename `convex/companies.ts` functions**: `registerCompany` → `registerDocument`, `getAllCompanies` → `getAllDocuments`, `addDocuments` → `addFiles` (to avoid document/document confusion). Update `companies` table refs → `complianceDocuments`.
  - **Update `convex/training.ts`**: `getUserCompaniesWithModules` → `getUserDocumentsWithModules`, `companyUuid` → `documentUuid`, all company refs → document refs.
  - **Update `convex/seed.ts`**: Change `companies` table → `complianceDocuments`, rename all company refs. Update seed data: "Acme Corporation" can stay as document name (it represents a compliance doc for Acme).
  - **Update `convex/auth.ts`** if it refs companies.
  - **Rename file `convex/companies.ts` → `convex/documents.ts`** (matches new terminology).
  - **Verify Convex Auth compatibility** — Tech13-08 overrode `users` table. Read `convex/_generated/ai/guidelines.md` first. Ensure auth tables still work.

  **Must NOT do**:
  - Do NOT touch `src/services/ai.ts` or `src/services/ai.test.ts`
  - Do NOT touch frontend files (that's Task 2)
  - Do NOT touch `voice.ts`
  - Do NOT remove `trainingModules`, `quizResults` tables
  - Do NOT push to main

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`convex`]
    - `convex`: Schema rules, table renames, Convex Auth compat, function registration

  **Parallelization**:
  - **Sequential — Task 1**
  - **Blocks**: Tasks 2-9
  - **Blocked By**: None

  **References**:

  > `convex/schema.ts` — Current state with both data models. This is the primary file to modify. All table definitions and indexes.

  > `convex/compliance.ts` — All refs to `compliances` table, `complianceId` field, `complianceDocs` table, vector index. Pattern for how Tech13-08 queries these tables.

  > `convex/companies.ts` — Functions: `registerCompany`, `getAllCompanies`, `addDocuments`, `generateUploadUrl`. Rename all + rename file to `documents.ts`.

  > `convex/ingest.ts` — References `complianceDocs`, `compliances`, `complianceId`. Real ingestion pipeline — update refs only, don't change logic.

  > `convex/training.ts` — `getUserCompaniesWithModules` (extensive company refs), `verifyAccess`, `getModule`, `getModules`. Rename company → document.

  > `convex/quiz.ts:48-70` — `generateModuleQuiz` refs `compliance.getChunksByModule`, `complianceId`.

  > `convex/user.ts:38-65` — `updateModuleProgress` uses `complianceId` as progress key.

  > `convex/ingestionHelpers.ts:28-58` — `saveModuleQuiz` refs `moduleQuizzes` table (being added), `complianceId`, `companyId`.

  > `convex/voiceAgent.ts` — References `complianceId`.

  > `convex/seed.ts` — Seeds `companies` table → rename to `complianceDocuments`. Update all field refs.

  > `convex/_generated/ai/guidelines.md` — Convex-specific schema rules. READ FIRST.

  **Acceptance Criteria**:
  - [ ] `companies` table renamed to `complianceDocuments` in schema
  - [ ] `compliances` table removed from schema
  - [ ] `complianceDocs` renamed to `documentChunks`
  - [ ] `userCompanies` renamed to `userDocuments`
  - [ ] All FK fields renamed (`companyId` → `complianceDocumentId`, `complianceId` → `complianceDocumentId` or `slug`)
  - [ ] `moduleQuizzes` table defined in schema
  - [ ] `convex/companies.ts` renamed to `convex/documents.ts` with renamed functions
  - [ ] ALL convex files updated to use new names
  - [ ] `bunx tsc --noEmit` passes

  **QA Scenarios**:

  ```
  Scenario: Schema typechecks after full rename
    Tool: Bash
    Steps:
      1. `bunx tsc --noEmit 2>&1`
      2. Assert exit code 0
    Expected Result: Clean typecheck
    Evidence: .sisyphus/evidence/task-1-schema-typecheck.txt

  Scenario: No stale table/field names in convex
    Tool: Bash
    Steps:
      1. `grep -rn '"companies"' convex/ --include="*.ts" | grep -v _generated | grep -v node_modules` — should be empty
      2. `grep -rn '"compliances"' convex/ --include="*.ts" | grep -v _generated | grep -v node_modules` — should be empty
      3. `grep -rn '"complianceDocs"' convex/ --include="*.ts" | grep -v _generated | grep -v node_modules` — should be empty
      4. `grep -rn '"userCompanies"' convex/ --include="*.ts" | grep -v _generated | grep -v node_modules` — should be empty
      5. `grep -rn 'companyId' convex/ --include="*.ts" | grep -v _generated | grep -v node_modules` — should be empty (all renamed to complianceDocumentId)
    Expected Result: Zero matches for old names
    Evidence: .sisyphus/evidence/task-1-no-stale-refs.txt

  Scenario: New table names exist
    Tool: Bash
    Steps:
      1. `grep -n "complianceDocuments" convex/schema.ts` — should match
      2. `grep -n "documentChunks" convex/schema.ts` — should match
      3. `grep -n "userDocuments" convex/schema.ts` — should match
      4. `grep -n "moduleQuizzes" convex/schema.ts` — should match
    Expected Result: All new table definitions found
    Evidence: .sisyphus/evidence/task-1-new-tables-exist.txt

  Scenario: companies.ts renamed to documents.ts
    Tool: Bash
    Steps:
      1. `ls convex/documents.ts` — should exist
      2. `ls convex/companies.ts` — should NOT exist
    Expected Result: File renamed successfully
    Evidence: .sisyphus/evidence/task-1-file-rename.txt
  ```

  **Commit**: YES
  - Message: `refactor: merge companies+compliances→complianceDocuments, rename all company refs in backend`
  - Files: schema.ts, companies.ts→documents.ts, compliance.ts, training.ts, seed.ts, ingest.ts, quiz.ts, user.ts, ingestionHelpers.ts, ingestion.ts, voiceAgent.ts, auth.ts
  - Pre-commit: `bunx tsc --noEmit`

- [x] 2. Frontend: Rename All company→compliance document Wording

  **What to do**:
  - **`app/(authenticated)/training/page.tsx`** — Extensive renames:
    - Variables: `company` → `document`, `companyName` → `documentName`, `companyUuid` → `documentUuid`, `allCompanies` → `allDocuments`, `expandedCompanies` → `expandedDocuments`
    - API calls: `api.companies.registerCompany` → `api.documents.registerDocument`, `api.companies.getAllCompanies` → `api.documents.getAllDocuments`, `api.training.getUserCompaniesWithModules` → `api.training.getUserDocumentsWithModules`
    - UI text: "Your Companies" → "Compliance Documents", "Register Company" → "Register Document", etc.
    - Types/interfaces with "Company" → "ComplianceDocument" or "Document"
  - **`app/(authenticated)/register/page.tsx`** (416 lines):
    - Component: `RegisterCompanyPage` → `RegisterDocumentPage`
    - Variables: `companyName` → `documentName`, `registerCompany` → `registerDocument`
    - API calls: `api.companies.registerCompany` → `api.documents.registerDocument`, `api.companies.generateUploadUrl` → `api.documents.generateUploadUrl`, `api.companies.addDocuments` → `api.documents.addFiles`
    - UI text: "Register your company." → "Register a compliance document.", "Company name" → "Document name", "Company UUID" → "Document UUID", "Register company" → "Register document"
  - **`components/VoiceAgent.tsx`** — "company's compliance docs" → "compliance document content", any `companyUuid` refs → `documentUuid`
  - **`components/VoiceAgentPopover.tsx`** — "company UUID" → "document UUID"
  - **`components/TabBar.tsx`** — "Register company" → "Register document"
  - **`app/signin/page.tsx`** — "you@company.com" → "you@example.com" (minor, just a placeholder)

  **Must NOT do**:
  - Do NOT change layout, styling, or functionality — text/variable renames only
  - Do NOT touch convex files (done in Task 1)
  - Do NOT add new features or refactor UI structure
  - Do NOT push to main

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`convex`]
    - `convex`: Need to know correct API paths after Task 1 renames

  **Parallelization**:
  - **Sequential — Task 2**
  - **Blocks**: Tasks 3-9
  - **Blocked By**: Task 1

  **References**:

  > `app/(authenticated)/training/page.tsx` — Main training page. Extensive company refs: company, companyName, companyUuid, allCompanies, expandedCompanies, etc. All API calls to companies.\* need updating.

  > `app/(authenticated)/register/page.tsx` — Full upload flow. 416 lines. RegisterCompanyPage, companyName, registerCompany, "Register your company", "Company name", "Company UUID". API calls: registerCompany, generateUploadUrl, addDocuments.

  > `components/VoiceAgent.tsx` — "company's compliance docs" text, any companyUuid refs.

  > `components/VoiceAgentPopover.tsx` — "company UUID" text.

  > `components/TabBar.tsx` — "Register company" nav text.

  > `app/signin/page.tsx` — "you@company.com" placeholder text.

  > `convex/documents.ts` (renamed from companies.ts in Task 1) — Check exact exported function names: `registerDocument`, `getAllDocuments`, `generateUploadUrl`, `addFiles`.

  > `convex/training.ts` (updated in Task 1) — Check: `getUserDocumentsWithModules`, `documentUuid` field names.

  **Acceptance Criteria**:
  - [ ] Zero "company" references in user-facing text across frontend files (except signin placeholder)
  - [ ] All API calls use new function names (documents._ not companies._)
  - [ ] All variables renamed (company→document)
  - [ ] `bunx tsc --noEmit` passes
  - [ ] `bun run build` passes

  **QA Scenarios**:

  ```
  Scenario: No "company" in user-facing frontend text
    Tool: Bash
    Steps:
      1. `grep -ri "company" app/ components/ --include="*.tsx" --include="*.ts" | grep -v node_modules | grep -v _generated | grep -v ".next"` — review each match
      2. Only acceptable match: signin placeholder email pattern
    Expected Result: Zero or only signin placeholder
    Evidence: .sisyphus/evidence/task-2-no-company-frontend.txt

  Scenario: API calls use new function names
    Tool: Bash
    Steps:
      1. `grep -rn "api.companies\." app/ components/ --include="*.tsx" --include="*.ts"` — should be empty
      2. `grep -rn "api.documents\." app/ components/ --include="*.tsx" --include="*.ts"` — should have matches
    Expected Result: Old API paths gone, new ones present
    Evidence: .sisyphus/evidence/task-2-api-paths-updated.txt

  Scenario: Build passes
    Tool: Bash
    Steps:
      1. `bunx tsc --noEmit 2>&1` — exit 0
      2. `bun run build 2>&1` — exit 0
    Expected Result: Clean build
    Evidence: .sisyphus/evidence/task-2-build-passes.txt
  ```

  **Commit**: YES
  - Message: `refactor(ui): rename company→compliance document in all frontend files`
  - Files: training/page.tsx, register/page.tsx, VoiceAgent.tsx, VoiceAgentPopover.tsx, TabBar.tsx, signin/page.tsx

- [x] 3. Remove Duplicate getDocumentsByStatus from ingestionHelpers.ts

  **What to do**:
  - Remove `getDocumentsByStatus` from `convex/ingestionHelpers.ts` — exact duplicate of same function in `convex/ingestion.ts`.
  - Grep for all references to `internal.ingestionHelpers.getDocumentsByStatus`. If found, update to `internal.ingestion.getDocumentsByStatus`.

  **Must NOT do**:
  - Do NOT remove `saveModuleQuiz`, `getDocumentsByCompanyAndStorage`, `updateDocumentStatus` — unique functions.

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`convex`]

  **Parallelization**:
  - **Sequential — Task 3**
  - **Blocked By**: Task 2

  **References**:
  - `convex/ingestionHelpers.ts` — Contains the duplicate function to remove
  - `convex/ingestion.ts` — Contains the original to keep
  - `convex/_generated/api.d.ts` — Check consumers of ingestionHelpers exports

  **Acceptance Criteria**:
  - [ ] `getDocumentsByStatus` removed from `ingestionHelpers.ts`
  - [ ] No dangling imports anywhere
  - [ ] `bunx tsc --noEmit` passes

  **QA Scenarios**:

  ```
  Scenario: Duplicate removed, original preserved
    Tool: Bash
    Steps:
      1. `grep -c "getDocumentsByStatus" convex/ingestionHelpers.ts` — should be 0
      2. `grep -c "getDocumentsByStatus" convex/ingestion.ts` — should be ≥1
      3. `bunx tsc --noEmit 2>&1` — exit 0
    Expected Result: Function only in ingestion.ts
    Evidence: .sisyphus/evidence/task-3-duplicate-removed.txt
  ```

  **Commit**: YES
  - Message: `refactor(convex): remove duplicate getDocumentsByStatus`
  - Files: `convex/ingestionHelpers.ts`

- [x] 4. Merge Ingestion Pipelines — Remove Stubs

  **What to do**:
  - Evaluate `convex/ingestion.ts` functions:
    - `processDocument` — STUB, just updates status. **Remove**.
    - `processCompanyDocuments` (or similar) — calls the stub. **Remove**.
    - `getDocumentsByStatus` — Keep. Still useful.
  - Before removing, grep for all refs to `internal.ingestion.processDocument` and similar. Remove callers too.
  - If `getDocumentsByStatus` is the only survivor, consider moving it to another file and deleting `ingestion.ts` entirely.

  **Must NOT do**:
  - Do NOT touch `convex/ingest.ts` — Tech13-08's real pipeline, canonical.
  - Do NOT remove `getDocumentsByStatus` — still used.

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`convex`]

  **Parallelization**:
  - **Sequential — Task 4**
  - **Blocked By**: Task 3

  **References**:
  - `convex/ingestion.ts` — Old stub pipeline to clean up
  - `convex/ingest.ts` — Tech13-08's real pipeline (reference only, don't modify)
  - `convex/_generated/api.d.ts` — Check exports and consumers

  **Acceptance Criteria**:
  - [ ] `processDocument` stub removed
  - [ ] No dangling references to removed functions
  - [ ] `getDocumentsByStatus` preserved
  - [ ] `bunx tsc --noEmit` passes

  **QA Scenarios**:

  ```
  Scenario: Stubs removed cleanly
    Tool: Bash
    Steps:
      1. `grep -n "processDocument\|processCompanyDocuments" convex/ingestion.ts` — should not be function definitions
      2. `grep -rn "internal.ingestion.processDocument\|internal.ingestion.processCompanyDocuments" convex/` — should be empty
      3. `bunx tsc --noEmit 2>&1` — exit 0
    Expected Result: Stubs gone, no broken refs
    Evidence: .sisyphus/evidence/task-4-stubs-removed.txt
  ```

  **Commit**: YES
  - Message: `refactor(ingestion): remove stub pipeline, keep Tech13-08's`
  - Files: `convex/ingestion.ts`

- [x] 5. Consolidate thin ai_service.ts Wrapper

  **What to do**:
  - `convex/ai_service.ts` is ~15 lines — creates `ComplianceAIService` and calls `generateEmbedding`.
  - Grep for `internal.ai_service.generateEmbedding` or any imports of `ai_service`. If NOT called anywhere, remove the file — `ingest.ts` and `quiz.ts` already instantiate `ComplianceAIService` directly.
  - If it IS called somewhere, leave it.

  **Must NOT do**:
  - Do NOT modify `src/services/ai.ts` or `src/services/ai.test.ts`.

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`convex`]

  **Parallelization**:
  - **Sequential — Task 5**
  - **Blocked By**: Task 4

  **References**:
  - `convex/ai_service.ts` — Thin wrapper under evaluation
  - `convex/ingest.ts:9,17` — Direct ComplianceAIService usage (no ai_service import)
  - `convex/quiz.ts:3,58` — Same

  **Acceptance Criteria**:
  - [ ] Decision made + executed (removed or kept with justification)
  - [ ] `bunx tsc --noEmit` passes

  **QA Scenarios**:

  ```
  Scenario: ai_service handled correctly
    Tool: Bash
    Steps:
      1. Check if `convex/ai_service.ts` exists
      2. If removed: `grep -rn "ai_service" convex/ src/ --include="*.ts" | grep -v _generated | grep import` — should be empty
      3. `bunx tsc --noEmit`
    Expected Result: Clean state, no dangling refs
    Evidence: .sisyphus/evidence/task-5-ai-service-check.txt
  ```

  **Commit**: YES
  - Message: `refactor(convex): remove unused ai_service wrapper`
  - Files: `convex/ai_service.ts` (removed)

- [x] 6. Wire assistant.ts to ComplianceAIService — Replace Stub

  **What to do**:
  - Replace `convex/assistant.ts` stub with real implementation:
    - Accept `message` arg (existing) + optional `complianceDocumentId` arg (new)
    - Instantiate `ComplianceAIService` from `src/services/ai.ts`
    - If `complianceDocumentId` provided: use vector search to retrieve context chunks from `documentChunks` table, then call AI for scoped answer
    - If no `complianceDocumentId`: general response without RAG context
    - Keep function signature backward-compatible (`message` required, `complianceDocumentId` optional)
  - This is the critical integration point — `voiceAgent.ts` delegates to `api.assistant.chat`.
  - Follow the RAG pattern from `convex/ingest.ts:askQuestion` (vector search → chunks → AI call).

  **Must NOT do**:
  - Do NOT change `voiceAgent.ts` HTTP handler structure (Task 7 handles the one-line change)
  - Do NOT change `src/services/ai.ts`
  - Do NOT add excessive error handling beyond basic try/catch

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`convex`]

  **Parallelization**:
  - **Sequential — Task 6**
  - **Blocked By**: Task 5

  **References**:
  - `convex/assistant.ts` — Current stub to replace. Returns hardcoded "Based on your policy..."
  - `convex/voiceAgent.ts:44` — Calls `api.assistant.chat` (will auto-get real answers)
  - `convex/compliance.ts` — `getChunksByModule`, `getChunksByIds` for context retrieval (table name may be renamed to documentChunks per Task 1)
  - `convex/ingest.ts:63-92` — `askQuestion` action shows the RAG pattern: vector search → chunks → AI call. **Copy this pattern.**
  - `src/services/ai.ts:generateComplianceAction` — The real AI call

  **Acceptance Criteria**:
  - [ ] No hardcoded response string in `assistant.ts`
  - [ ] Uses `ComplianceAIService` for real AI responses
  - [ ] Backward-compatible: `message` arg still works alone
  - [ ] New `complianceDocumentId` arg enables scoped answers
  - [ ] `bunx tsc --noEmit` passes

  **QA Scenarios**:

  ```
  Scenario: Stub removed
    Tool: Bash
    Steps:
      1. `grep -n "Based on your policy" convex/assistant.ts` — should be empty
      2. `grep -n "ComplianceAIService" convex/assistant.ts` — should match
    Expected Result: Real implementation, no stubs
    Evidence: .sisyphus/evidence/task-6-assistant-wired.txt

  Scenario: Backward compatible signature
    Tool: Bash
    Steps:
      1. `grep -A5 'args: {' convex/assistant.ts` — should show `message` as required, `complianceDocumentId` as optional
    Expected Result: message required, complianceDocumentId optional
    Evidence: .sisyphus/evidence/task-6-signature-compat.txt
  ```

  **Commit**: YES
  - Message: `feat(assistant): wire to ComplianceAIService, replace stub`
  - Files: `convex/assistant.ts`

- [x] 7. Wire voiceAgent.ts to Pass Document Context

  **What to do**:
  - Now that `assistant.ts` returns real answers (Task 6), update `voiceAgent.ts` to forward `complianceDocumentId`:
    - Current: `ctx.runAction(api.assistant.chat, { message: question })` — ignores complianceDocumentId
    - Updated: `ctx.runAction(api.assistant.chat, { message: question, complianceDocumentId })` — passes scope
  - One-line change. The webhook already extracts `complianceDocumentId` from the request body (or should — verify and add if missing).

  **Must NOT do**:
  - Do NOT restructure the HTTP handler — just add the arg
  - Do NOT change CORS, error handling, or response format
  - Do NOT touch `voice.ts`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`convex`]

  **Parallelization**:
  - **Sequential — Task 7**
  - **Blocked By**: Task 6

  **References**:
  - `convex/voiceAgent.ts` — The HTTP handler with `runAction` call to update
  - `convex/assistant.ts` — Now accepts `complianceDocumentId` (after Task 6)

  **Acceptance Criteria**:
  - [ ] `voiceAgent.ts` passes `complianceDocumentId` to `assistant.chat`
  - [ ] `bunx tsc --noEmit` passes

  **QA Scenarios**:

  ```
  Scenario: complianceDocumentId forwarded
    Tool: Bash
    Steps:
      1. `grep -A3 "runAction(api.assistant.chat" convex/voiceAgent.ts` — should show complianceDocumentId in args
    Expected Result: complianceDocumentId passed through
    Evidence: .sisyphus/evidence/task-7-complianceid-forwarded.txt
  ```

  **Commit**: YES
  - Message: `refactor(voice): forward documentId to assistant for scoped answers`
  - Files: `convex/voiceAgent.ts`

- [x] 8. Remove Dead seed-data.ts Script

  **What to do**:
  - `scripts/seed-data.ts` is a one-off script calling `api.compliance.createCompliance` directly.
  - The main seed system uses `convex/seed.ts`.
  - If `seed-data.ts` has no unique logic not in seed.ts, remove it.
  - Also check `scripts/test-ai.ts` and `scripts/eleven-spike.ts` — these are dev tools, keep them.

  **Must NOT do**:
  - Do NOT remove `convex/seed.ts` — that's the real seeder
  - Do NOT remove `scripts/test-ai.ts` or `scripts/eleven-spike.ts` — dev tools

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Sequential — Task 8**
  - **Blocked By**: Task 7

  **References**:
  - `scripts/seed-data.ts` — Script under evaluation
  - `convex/seed.ts` — The real seeder (reference for comparison)

  **Acceptance Criteria**:
  - [ ] `scripts/seed-data.ts` removed if redundant
  - [ ] No references to it in `package.json` scripts

  **QA Scenarios**:

  ```
  Scenario: Script removed, no dangling refs
    Tool: Bash
    Steps:
      1. Check if `scripts/seed-data.ts` exists
      2. `grep -n "seed-data" package.json` — should be empty if removed
    Expected Result: Clean
    Evidence: .sisyphus/evidence/task-8-dead-script-removed.txt
  ```

  **Commit**: YES
  - Message: `chore: remove redundant seed-data.ts script`
  - Files: `scripts/seed-data.ts`

- [x] 9. Full Build + Test Verification

  **What to do**:
  - Run `bunx tsc --noEmit` — must pass
  - Run `bun test` — must pass
  - Run `bun run build` — must pass
  - Fix any issues found. If fixes are minor (1-2 lines), include them in this task's commit. If major, note them for a follow-up.

  **Must NOT do**:
  - Do NOT add new features to fix issues — minimal fixes only
  - Do NOT push to main

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`convex`]

  **Parallelization**:
  - **Sequential — Task 9**
  - **Blocked By**: Tasks 1-8

  **References**:
  - All modified files from Tasks 1-8

  **Acceptance Criteria**:
  - [ ] `bunx tsc --noEmit` exits 0
  - [ ] `bun test` exits 0
  - [ ] `bun run build` exits 0

  **QA Scenarios**:

  ```
  Scenario: Full build passes
    Tool: Bash
    Steps:
      1. `bunx tsc --noEmit 2>&1` — exit 0
      2. `bun test 2>&1` — exit 0
      3. `bun run build 2>&1` — exit 0
    Expected Result: All green
    Evidence: .sisyphus/evidence/task-9-full-build.txt
  ```

  **Commit**: YES (only if fixes were needed)
  - Message: `fix: resolve build/test issues from integration cleanup`
  - Files: whatever needed fixing

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> Only commit to `sk/integration-testing`. Do NOT touch main.

- [x] F1. **Plan Compliance Audit** — `oracle`
      Read plan end-to-end. For each "Must Have": verify implementation exists (read file, grep pattern). For each "Must NOT Have": search codebase for forbidden patterns. Check evidence files. Compare deliverables against plan.
      Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`
      Run `tsc --noEmit` + `bun test` + linter. Review all changed files for: `as any`, empty catches, console.log in prod, unused imports, AI slop (excessive comments, over-abstraction).
      Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | VERDICT`

- [x] F3. **Build + Test Verification** — `unspecified-high`
      Run full build + test suite. Verify dev server starts. Check no stale "company" references in user-facing text (grep frontend files).
      Output: `Build [PASS/FAIL] | Tests [N/N] | Dev Server [PASS/FAIL] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
      For each task: read "What to do", read actual diff. Verify 1:1. Check "Must NOT do" compliance. Detect cross-task contamination. Verify no changes pushed to main.
      Output: `Tasks [N/N compliant] | Contamination [CLEAN/N] | Unaccounted [CLEAN/N] | VERDICT`

## Commit Strategy

| Task | Message                                                                                         | Files                                                                                                                                |
| ---- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | `refactor: merge companies+compliances→complianceDocuments, rename all company refs in backend` | schema.ts, companies.ts→renamed, compliance.ts, training.ts, seed.ts, ingest.ts, quiz.ts, user.ts, ingestionHelpers.ts, ingestion.ts |
| 2    | `refactor(ui): rename company→compliance document in all frontend files`                        | training/page.tsx, register/page.tsx, VoiceAgent.tsx, VoiceAgentPopover.tsx, TabBar.tsx, signin/page.tsx                             |
| 3    | `refactor(convex): remove duplicate getDocumentsByStatus`                                       | ingestionHelpers.ts                                                                                                                  |
| 4    | `refactor(ingestion): remove stub pipeline, keep Tech13-08's`                                   | ingestion.ts                                                                                                                         |
| 5    | `refactor(convex): remove unused ai_service wrapper`                                            | ai_service.ts (removed)                                                                                                              |
| 6    | `feat(assistant): wire to ComplianceAIService, replace stub`                                    | assistant.ts                                                                                                                         |
| 7    | `refactor(voice): forward documentId to assistant for scoped answers`                           | voiceAgent.ts                                                                                                                        |
| 8    | `chore: remove redundant seed-data.ts script`                                                   | seed-data.ts                                                                                                                         |

All commits to `sk/integration-testing` only. Do NOT push to main.

## Success Criteria

### Verification Commands

```bash
bun test                     # Expected: all tests pass
bunx tsc --noEmit            # Expected: no type errors
bun run build                # Expected: successful build
grep -ri "company" app/ components/ --include="*.tsx" --include="*.ts" | grep -v node_modules | grep -v _generated  # Expected: no "company" in user-facing text
grep -r "console.log.*STUB" convex/  # Expected: no matches
grep -r "Based on your policy" convex/assistant.ts  # Expected: no matches
```

### Final Checklist

- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All tests pass
- [ ] No "company" wording in user-facing frontend text
- [ ] No duplicate functions in convex/
- [ ] assistant.ts uses real AI
- [ ] moduleQuizzes reference resolved
- [ ] Voice agent returns real answers
- [ ] Nothing pushed to main
