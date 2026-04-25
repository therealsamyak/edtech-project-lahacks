# UI Mock Alignment — Match v0 Mock Exactly

## TL;DR

> **Quick Summary**: Make the Next.js app's authenticated UI match the v0 mock — replace dashboard with tab bar navigation, wire AssistantPopover, convert raw CSS to shadcn components, fix company name display.
>
> **Deliverables**:
>
> - Tab bar navigation in authenticated layout (replaces dashboard page)
> - AssistantPopover rendered and functional on all authenticated pages
> - All `btn btn-*` raw CSS converted to shadcn `<Button>`
> - `.tag` CSS class defined in globals.css
> - Module list eyebrow shows company name instead of UUID
> - Dashboard page redirects to `/register`, "Back to Dashboard" link fixed
>
> **Estimated Effort**: Quick
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: TabBar component → Layout update → Dashboard removal

## Context

### Original Request

Make the actual Next.js app UI match the v0 mock (`EdTech LA Hacks/src/app/App.tsx`) exactly.

### Codebase Verification (Confirmed)

- Layout: server component, AuthGuard wrapper, header with logo + SignOutButton
- Dashboard: exists at `/` with two cards (Register, Training)
- `btn btn-ghost`: 3 locations — module content:43, quiz:65, quiz:130
- Training redirect: `router.push(\`/training/${result.uuid}\`)` at line 27
- Eyebrow: `Curriculum · {companyId}` at line 23 (shows raw UUID)
- `.tag` class: used in code but NOT defined in globals.css
- AssistantPopover: standalone, no props
- "Back to Dashboard": `href="/"` at register/page.tsx:301-308
- TabBar: does NOT exist yet
- shadcn Button: has `ghost` variant ✓, Card: has `size` prop ✓
- Mock tab bar pattern: App.tsx lines 63-80

## Work Objectives

### Core Objective

Make the authenticated app UI structurally and visually match the v0 mock — tab bar navigation, assistant popover, correct styling, proper data display.

### Definition of Done

- [ ] Tab bar shows in authenticated layout with Register/Training tabs
- [ ] `/` redirects to `/register`
- [ ] AssistantPopover visible on all authenticated pages
- [ ] No `btn btn-*` raw CSS classes remain in app code
- [ ] `.tag` elements render styled
- [ ] Module list eyebrow shows company name

### Must Have

- Tab bar with active state based on current route
- AssistantPopover rendered and toggleable
- All buttons use shadcn `<Button>` component
- Company name displayed (not UUID) in module list

### Must NOT Have (Guardrails)

- No Convex backend changes (schema, mutations, queries)
- No new npm dependencies
- No refactoring existing component logic (form handlers, data fetching)
- No touching sign-in page
- No implementing audio playback
- No changing quiz scoring logic
- No modifying globals.css theme variables (only additive)

## Verification Strategy

> Visual/manual verification only — no automated tests or agent QA.

### Test Decision

- **Automated tests**: None
- **Agent QA**: None
- **Verification**: User visual inspection via `bun dev`

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (5 parallel tasks — no file conflicts):
├── Task 1: Add .tag CSS class to globals.css [quick]
├── Task 2: Convert btn-* to Button in module detail page [quick]
├── Task 3: Convert btn-* to Button in quiz page [quick]
├── Task 4: Fix company name in module list eyebrow [quick]
└── Task 5: Create TabBar component [quick]

Wave 2 (2 parallel tasks — layout integration):
├── Task 6: Update authenticated layout (add TabBar + AssistantPopover) [quick]
└── Task 7: Remove dashboard + update "Back to Dashboard" link [quick]

Critical Path: Task 5 → Task 6
Parallel Speedup: ~60% faster than sequential
Max Concurrent: 5
```

### Dependency Matrix

| Task | Depends On | Blocks | Wave |
| ---- | ---------- | ------ | ---- |
| 1    | -          | -      | 1    |
| 2    | -          | -      | 1    |
| 3    | -          | -      | 1    |
| 4    | -          | -      | 1    |
| 5    | -          | 6      | 1    |
| 6    | 5          | -      | 2    |
| 7    | -          | -      | 2    |

### Agent Dispatch Summary

- **Wave 1**: 5 tasks — all `quick`
- **Wave 2**: 2 tasks — all `quick`

---

## TODOs

- [x] 1. Add `.tag` CSS class to globals.css

  **What to do**:
  - Add `.tag` CSS class to `app/globals.css` matching the mock's tag styling
  - Check mock's `EdTech LA Hacks/src/app/theme.css` for exact values
  - Should be a subtle pill: small font, rounded, muted background, padding
  - Follow existing pattern of `.eyebrow` (lines 203-210)

  **Must NOT do**:
  - Do NOT modify existing theme variables or other CSS classes
  - Do NOT add any other missing CSS classes (only `.tag`)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4, 5)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `app/globals.css` — Where to add. Follow `.eyebrow` pattern (lines 203-210)
  - `EdTech LA Hacks/src/app/theme.css` — Source of truth for `.tag` styling values

  **Acceptance Criteria**:
  - [ ] `.tag` class defined in `app/globals.css`
  - [ ] Existing `.tag` usages in app code render styled

  **Commit**: YES (single commit with all tasks)

- [x] 2. Convert `btn btn-ghost` to shadcn Button in module detail page

  **What to do**:
  - Open `app/(authenticated)/training/[id]/[moduleId]/page.tsx`
  - Line 43: `className="btn btn-ghost mb-6 -ml-2 inline-flex items-center gap-1"`
  - Replace with `<Button variant="ghost" className="mb-6 -ml-2 inline-flex items-center gap-1">`
  - Ensure `Button` imported from `@/components/ui/button`
  - Card `size="default"` is VALID shadcn prop — leave it

  **Must NOT do**:
  - Do NOT change button behavior or navigation logic
  - Do NOT refactor surrounding code

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4, 5)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `app/(authenticated)/training/[id]/[moduleId]/page.tsx:43` — exact line with `btn btn-ghost`
  - `components/ui/button.tsx` — shadcn Button, has `ghost` variant confirmed

  **Acceptance Criteria**:
  - [ ] No `btn btn-ghost` class remains in this file
  - [ ] Button uses shadcn `<Button variant="ghost">`

  **Commit**: YES (single commit with all tasks)

- [x] 3. Convert `btn btn-ghost` to shadcn Button in quiz page

  **What to do**:
  - Open `app/(authenticated)/training/[id]/[moduleId]/quiz/page.tsx`
  - Lines 65 and 130: both have `className="btn btn-ghost mb-6 -ml-2 inline-flex items-center gap-1"`
  - Replace each with `<Button variant="ghost" className="mb-6 -ml-2 inline-flex items-center gap-1">`
  - Ensure `Button` imported from `@/components/ui/button`

  **Must NOT do**:
  - Do NOT change quiz logic, scoring, or question flow

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4, 5)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `app/(authenticated)/training/[id]/[moduleId]/quiz/page.tsx:65,130` — exact lines
  - `components/ui/button.tsx` — shadcn Button variants

  **Acceptance Criteria**:
  - [ ] No `btn btn-ghost` class remains in this file
  - [ ] Both back buttons use shadcn `<Button variant="ghost">`

  **Commit**: YES (single commit with all tasks)

- [x] 4. Fix company name in module list eyebrow

  **What to do**:
  - In `app/(authenticated)/training/page.tsx` line 27: change redirect from `/training/${result.uuid}` to `/training/${result.uuid}?name=${encodeURIComponent(companyName)}`
  - In `app/(authenticated)/training/[id]/page.tsx` line 23: change `{companyId}` in eyebrow to read `searchParams.name` instead
  - Use Next.js `useSearchParams()` hook for reading
  - If `name` searchParam missing (direct URL), fallback to "Company"

  **Must NOT do**:
  - Do NOT modify Convex backend queries or add new Convex functions
  - Do NOT change data fetching logic

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 5)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `app/(authenticated)/training/page.tsx:27` — redirect after verifyAccess, add `?name=` param
  - `app/(authenticated)/training/[id]/page.tsx:23` — eyebrow showing `Curriculum · {companyId}`, read from searchParams instead
  - Mock `ComplianceTraining` component — shows how company name is passed via state

  **Acceptance Criteria**:
  - [ ] Redirect URL includes `?name=CompanyName`
  - [ ] Eyebrow shows company name (not UUID)
  - [ ] Direct URL (no searchParam) shows graceful fallback "Company"

  **Commit**: YES (single commit with all tasks)

- [x] 5. Create TabBar component

  **What to do**:
  - Create `components/TabBar.tsx` — client component (`"use client"`)
  - Two tabs: Building2 icon + "Register company", GraduationCap icon + "Compliance training"
  - Tabs are `<Link>` to `/register` and `/training`
  - Use `usePathname()` for active state:
    - `/register*` → Register active
    - `/training*` → Training active
  - Active tab: `bg-ink text-surface`
  - Inactive tab: `bg-transparent text-ink-soft`
  - Container: `inline-flex` card with `p-1`, rounded

  **Must NOT do**:
  - Do NOT use raw `.btn` CSS classes
  - Do NOT create server component (needs `usePathname()`)
  - Do NOT add state management — route-based only

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 4)
  - **Blocks**: Task 6
  - **Blocked By**: None

  **References**:
  - `EdTech LA Hacks/src/app/App.tsx:63-80` — tab bar JSX pattern to replicate
  - `EdTech LA Hacks/src/app/App.tsx:100-130` — TabButton component with active styling
  - `lucide-react` — Building2, GraduationCap icons (already installed)
  - Next.js `usePathname()` + `Link`

  **Acceptance Criteria**:
  - [ ] `components/TabBar.tsx` created as client component
  - [ ] Two tab links: Register → `/register`, Training → `/training`
  - [ ] Active tab dark bg, inactive transparent
  - [ ] Works for nested routes (`/training/[id]/...` → Training active)

  **Commit**: YES (single commit with all tasks)

- [x] 6. Update authenticated layout — add TabBar + AssistantPopover

  **What to do**:
  - Open `app/(authenticated)/layout.tsx`
  - Import `TabBar` from `@/components/TabBar`
  - Import `AssistantPopover` from `@/components/AssistantPopover`
  - Insert `<TabBar />` between header and `{children}`
  - Add `<AssistantPopover />` at end (fixed-positioned, placement doesn't matter)
  - Layout is server component — TabBar import works since it's a client component

  **Must NOT do**:
  - Do NOT remove header or footer
  - Do NOT change how `{children}` renders
  - Do NOT modify Convex auth provider wrapping

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 7 — different files)
  - **Parallel Group**: Wave 2 (with Task 7)
  - **Blocks**: None
  - **Blocked By**: Task 5 (TabBar must exist)

  **References**:
  - `app/(authenticated)/layout.tsx` — current layout structure
  - `components/AssistantPopover.tsx` — no props needed, standalone
  - Mock `App.tsx` — layout order: Header → TabBar → TabPanel(children) → Footer

  **Acceptance Criteria**:
  - [ ] `<TabBar />` renders between header and content
  - [ ] `<AssistantPopover />` renders (visible as floating FAB)
  - [ ] Header and footer unchanged
  - [ ] `{children}` renders correctly

  **Commit**: YES (single commit with all tasks)

- [x] 7. Remove dashboard page + update "Back to Dashboard" link

  **What to do**:
  - Replace `app/(authenticated)/page.tsx` content with `redirect('/register')` from `next/navigation` (server-side redirect)
  - Open `app/(authenticated)/register/page.tsx` lines 301-308
  - Change `href="/"` to `href="/training"` on the "Back to Dashboard" link

  **Must NOT do**:
  - Do NOT delete `page.tsx` — Next.js needs it as route group index
  - Do NOT break route group structure

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 6 — different files)
  - **Parallel Group**: Wave 2 (with Task 6)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `app/(authenticated)/page.tsx` — current dashboard to replace with redirect
  - `app/(authenticated)/register/page.tsx:301-308` — "Back to Dashboard" link with `href="/"`
  - Next.js `redirect()` from `next/navigation`

  **Acceptance Criteria**:
  - [ ] `/` redirects to `/register`
  - [ ] Register page link points to `/training`
  - [ ] No 404 errors

  **Commit**: YES (single commit with all tasks)

---

## Commit Strategy

- **Branch**: `sk/overhauled-ui` ONLY — do NOT commit to main or any other branch
- **Verify branch** before committing: `git branch --show-current` must return `sk/overhauled-ui`
- **Single commit**: `fix(ui): align authenticated UI with v0 mock`
- After all 7 tasks complete

## Success Criteria

### Verification Commands

```bash
bun dev  # Start dev server, user visually verifies
grep -r "btn btn-" app/  # Expected: no matches
grep "\.tag" app/globals.css  # Expected: .tag class defined
```

### Final Checklist

- [ ] Tab bar renders in authenticated layout
- [ ] Tab bar highlights active tab based on current route
- [ ] `/` redirects to `/register`
- [ ] AssistantPopover FAB visible
- [ ] Module list eyebrow shows company name
- [ ] No `btn btn-*` raw CSS in codebase
- [ ] `.tag` elements styled
- [ ] Register page link not broken
