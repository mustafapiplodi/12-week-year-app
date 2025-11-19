'use client'

import { useActiveCycle } from '@/lib/hooks/use-active-cycle'
import { useWeeklyReviews } from '@/lib/hooks/use-weekly-reviews'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { TrendingUp } from 'lucide-react'
import { getCurrentWeek } from '@/lib/utils/date-helpers'
import { ExecutionTrendChart } from '@/components/progress/execution-trend-chart'
import { LagIndicatorsChart } from '@/components/progress/lag-indicators-chart'

export default function ProgressPage() {
  const { data: activeCycle, isLoading } = useActiveCycle()
  const { data: reviews } = useWeeklyReviews(activeCycle?.id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!activeCycle) {
    return (
      <div className="container mx-auto p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>No Active Cycle</CardTitle>
              <CardDescription>
                Create a cycle to start tracking your progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/settings">Create Cycle</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const currentWeek = getCurrentWeek(activeCycle.start_date)
  const cycleProgress = (currentWeek / 12) * 100

  // Calculate overall execution score
  const averageScore = reviews && reviews.length > 0
    ? Math.round(
        reviews.reduce((sum, r) => {
          const percentage = r.planned_tasks_count > 0
            ? (r.completed_tasks_count / r.planned_tasks_count) * 100
            : 0
          return sum + percentage
        }, 0) / reviews.length
      )
    : null

  const weeksAbove85 = reviews?.filter(r => {
    const percentage = r.planned_tasks_count > 0
      ? (r.completed_tasks_count / r.planned_tasks_count) * 100
      : 0
    return percentage >= 85
  }).length || 0

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Progress & Scorecard</h1>
            <p className="text-muted-foreground">
              Track your execution performance
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Cycle Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold">{currentWeek}/12</div>
              <Progress value={cycleProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {12 - currentWeek} weeks remaining
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Overall Execution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {averageScore !== null ? `${averageScore}%` : '--'}
              </div>
              <p className="text-xs text-muted-foreground">
                {averageScore !== null ? 'Average score' : 'No data yet'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">85% Target</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {reviews ? `${weeksAbove85}/${reviews.length}` : '0/0'}
              </div>
              <p className="text-xs text-muted-foreground">
                Weeks at 85%+
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Execution Chart */}
        {reviews && reviews.length > 0 ? (
          <ExecutionTrendChart cycleId={activeCycle.id} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Weekly Execution Trend</CardTitle>
              <CardDescription>
                Complete weekly plans and reviews to see your execution trend
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No weekly data yet. Start planning and reviewing your weeks.
                </p>
                <Button asChild>
                  <Link href="/weekly">
                    Go to Weekly Planning
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lag Indicators Chart */}
        <LagIndicatorsChart cycleId={activeCycle.id} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How Execution Scoring Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <strong>Weekly Score:</strong> (Completed Tasks / Planned Tasks) × 100
              </p>
              <p>
                <strong>Target:</strong> Aim for 85%+ execution to stay on track
              </p>
              <p>
                <strong>Review:</strong> Conduct weekly reviews to improve performance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Indicators</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span>85%+ : Excellent execution</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span>70-84% : Good progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <span>50-69% : Needs improvement</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span>&lt;50% : Adjust tactics</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
