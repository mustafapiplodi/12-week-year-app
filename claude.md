# 12 Week Year App - Simplified Implementation Guide

## Project Overview

A **simplified** web application based on the **12 Week Year** methodology. This app focuses on execution over complex planning, following the core principle: **simple systems that you'll actually use**.

### Core Methodology Principles

1. **Accountability** - Own every action and result
2. **Commitment** - Do whatever it takes
3. **Greatness in the Moment** - Choose high-payoff activities over distractions

### Five Disciplines (Simplified Implementation)

1. **Vision** - Long-term and 3-year vision (2 text fields)
2. **Planning** - 2-4 SMART goals per cycle (inline on dashboard)
3. **Process Control** - Weekly planning routine (simple day selector)
4. **Measurement** - Track execution percentage (one chart)
5. **Intentional Time Use** - Daily task list (simple checkboxes)

## Tech Stack

- **Framework**: Next.js 15 (App Router) with TypeScript
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **UI Components**: shadcn/ui with Tailwind CSS
- **State Management**: TanStack Query + Zustand
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts (execution trend only)

## Simplified Project Structure

```
12-week-year-app/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Dashboard (goals & tactics inline)
│   │   ├── today/page.tsx        # Daily task list
│   │   ├── weekly/page.tsx       # Plan + Review (tabs)
│   │   ├── progress/page.tsx     # One execution chart
│   │   └── settings/page.tsx     # Vision, cycles, archive
│   ├── layout.tsx
│   ├── globals.css
│   └── providers.tsx
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── dashboard/sidebar.tsx
│   ├── vision/vision-banner.tsx
│   ├── today/
│   │   ├── task-list.tsx
│   │   ├── task-item.tsx
│   │   └── progress-ring.tsx
│   └── progress/
│       └── execution-trend-chart.tsx
├── lib/
│   ├── supabase/
│   ├── utils/
│   ├── hooks/
│   └── stores/
└── types/database.ts
```

## Simplified Database Schema

### Core Tables

#### visions
- `id`, `user_id`
- `long_term_vision`, `three_year_vision`
- `is_active`

#### cycles
- `id`, `user_id`, `vision_id`
- `title`, `start_date`, `end_date`
- `status` ('planning', 'active', 'archived')
- `overall_execution_score`

#### goals
- `id`, `cycle_id`
- `title`, `description`
- `why_it_matters` (emotional connection)
- `target_metric`
- `display_order`

#### tactics
- `id`, `goal_id`
- `title`, `description`
- `tactic_type` ('one_time', 'recurring')
- `priority` ('high', 'medium', 'low')
- `start_week`, `end_week`
- `notes` (for tracking simple obstacles)

#### scheduled_tasks
- `id`, `tactic_id`, `cycle_id`
- `week_number`, `scheduled_date`
- `is_completed`, `completed_at`
- `notes`

#### weekly_reviews
- `id`, `cycle_id`, `week_number`
- `planned_tasks_count`, `completed_tasks_count`
- `execution_percentage` (auto-calculated)
- `what_worked`, `what_didnt_work`, `adjustments_needed`

### Removed Tables (Simplified)
- ❌ obstacles (use `tactics.notes` instead)
- ❌ templates (unnecessary complexity)
- ❌ achievements (gamification not needed)
- ❌ user_preferences (keep it simple)
- ❌ activity_log (not essential)
- ❌ notifications (avoid distractions)

## App Structure (4 Main Pages)

### 1. Dashboard (/)
**Everything in one place - no modals!**

**Features:**
- Vision banner (always visible)
- Quick stats (4 cards): Progress, Goals, Execution Score, Today
- Quick action buttons to Today, Weekly, Progress
- **Goals & Tactics inline**:
  - Click "Add Goal" → inline form appears
  - Expand goal → shows tactics
  - Click "Add Tactic" → inline form appears
  - No separate pages, no modals

**Components:**
- Inline goal creation form
- Expandable goal cards
- Inline tactic forms within expanded goals
- Delete buttons with simple confirm()

### 2. Today (/today)
**Daily execution page**

**Features:**
- Today's scheduled tasks
- Simple checkboxes to complete
- Progress ring showing completion
- Task notes (optional)

**UI:**
- Clean task list
- Large checkboxes
- Priority badges
- Completion timestamps

### 3. Weekly (/weekly)
**Combined planning + review (tabs)**

**Tab 1: Plan Week**
- Shows all tactics for the current week
- Simple day buttons (Mon, Tue, Wed, etc.)
- Click day button to schedule tactic
- No drag-and-drop complexity
- Shows total scheduled tasks

**Tab 2: Weekly Review**
- Auto-calculated execution score
- 3 simple questions:
  1. What worked?
  2. What didn't work?
  3. What will you adjust?
- Save button

### 4. Settings (/settings)
**Manage vision, cycles, archive (tabs)**

**Tab 1: Vision**
- Long-term vision (textarea)
- 3-year vision (textarea)
- Save button

**Tab 2: Cycles**
- Active cycle card (if exists)
- Create new cycle form
- Complete & Archive button

**Tab 3: Archive**
- List of past cycles
- Read-only view
- Shows final execution score

### 5. Progress (/progress)
**One simple chart**

**Features:**
- Overall stats (3 cards)
- Execution trend chart (line chart showing weekly scores)
- Target line at 85%
- Performance legend

## Key User Flows (Simplified)

### First-Time Setup
```
1. Login/Signup
2. Settings → Vision tab → Fill 2 text fields → Save
3. Settings → Cycles tab → Create cycle (title + start date)
4. Dashboard → Add Goal (inline form, 2-4 goals)
5. Dashboard → Expand goal → Add tactics (inline)
6. Done!
```

### Weekly Routine (Monday)
```
1. Weekly → Plan Tab
2. See this week's tactics
3. Click day buttons to schedule (Mon, Tue, etc.)
4. Save
```

### Daily Routine
```
1. Today
2. Check off completed tasks
3. Done
```

### Weekly Review (Sunday)
```
1. Weekly → Review Tab
2. See auto-calculated score
3. Answer 3 questions
4. Save
```

### Complete Cycle
```
1. Settings → Cycles → "Complete & Archive Cycle"
2. Cycle moves to Archive tab
3. Create new cycle
```

## Utility Functions

### Date Helpers
```typescript
export function getCurrentWeek(cycleStart: string): number
export function getWeekDates(cycleStart: string, weekNumber: number): { start: Date, end: Date }
```

### Score Calculator
```typescript
export function calculateWeeklyScore(planned: number, completed: number): number {
  if (planned === 0) return 0
  return Math.round((completed / planned) * 100)
}
```

## Navigation (5 Items)

```
Dashboard  →  /
Today      →  /today
Weekly     →  /weekly
Progress   →  /progress
Settings   →  /settings
```

## Design Philosophy

### Simplicity First
- ✅ Inline forms (no modals)
- ✅ Expand/collapse (no separate pages)
- ✅ Simple buttons (no drag-and-drop)
- ✅ 3 review questions (not 5+)
- ✅ 1 chart (not 5 different visualizations)

### Execution Focused
- Primary focus: Daily task completion
- Secondary focus: Weekly planning & review
- Tertiary focus: Progress tracking

### No Bloat
- No templates
- No achievements/gamification
- No notifications
- No AI suggestions
- No collaboration features
- No export features (for now)

## Development Commands

```bash
npm install
npm run dev
npm run build
npx supabase gen types typescript --project-id <your-project-id> > types/database.ts
```

## Key Custom Hooks

```typescript
useActiveCycle()     // Get active cycle
useGoals(cycleId)    // Get goals for cycle
useTactics(goalId)   // Get tactics for goal (optional, can use goal.tactics)
useWeeklyReviews(cycleId)
useTasksForDate(cycleId, date)
```

## Removed Complexity

### What We Removed
1. **Separate pages** for goals, tactics, planning, review
2. **Modal dialogs** for creating items
3. **Drag-and-drop** weekly calendar
4. **Obstacles tracking** (use tactic notes instead)
5. **Process control tracker** (nagging UI)
6. **Performance alerts** (trust adults to see scores)
7. **Weekly heatmaps** (visual clutter)
8. **Multiple chart types** (one is enough)
9. **Cycle completion wizard** (simple button)
10. **SMART field validation** (trust the user)

### What We Kept (Essential)
1. Vision (emotional motivation)
2. Goals (2-4 focused outcomes)
3. Tactics (specific actions)
4. Weekly planning (intentional scheduling)
5. Daily tasks (execution)
6. Weekly review (accountability)
7. Execution score (measurement)
8. Progress chart (trends)

## Next Steps for Development

### Phase 1 ✅ COMPLETE
- Database simplification
- Page structure consolidation
- Component cleanup
- Navigation update

### Phase 2 (Testing)
- Test user registration
- Test cycle creation
- Test goal/tactic creation
- Test weekly planning
- Test daily task completion
- Test weekly review
- Test progress charts

### Phase 3 (Polish)
- Loading states
- Error handling
- Empty states
- Responsive design
- Accessibility

### Phase 4 (Deploy)
- Vercel deployment
- Environment setup
- Final testing

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

---

**Philosophy**: The 12 Week Year book emphasizes **execution over elaborate planning**. This app reflects that principle. Simple, focused, action-oriented.

**Last Updated**: November 2025 (Simplified Version)
**Version**: 2.0.0 - Simplified
