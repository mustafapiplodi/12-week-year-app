'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Target } from 'lucide-react'
import type { Tables } from '@/types/database'

interface GoalProgressBarsProps {
  goals: (Tables<'goals'> & {
    tactics?: Tables<'tactics'>[]
  })[]
  scheduledTasks?: (Tables<'scheduled_tasks'> & {
    tactics: Tables<'tactics'>
  })[]
}

export function GoalProgressBars({ goals, scheduledTasks = [] }: GoalProgressBarsProps) {
  if (!goals || goals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Goal Progress</CardTitle>
          <CardDescription>Track progress toward each goal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            <p>Create goals to see progress</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate progress for each goal
  const goalProgress = goals.map(goal => {
    const tacticIds = goal.tactics?.map(t => t.id) || []
    const relatedTasks = scheduledTasks.filter(st => tacticIds.includes(st.tactic_id))

    const totalTasks = relatedTasks.length
    const completedTasks = relatedTasks.filter(st => st.is_completed).length
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return {
      ...goal,
      totalTasks,
      completedTasks,
      percentage,
    }
  })

  const getProgressColor = (percentage: number) => {
    if (percentage >= 85) return 'bg-green-600'
    if (percentage >= 70) return 'bg-blue-600'
    if (percentage >= 50) return 'bg-yellow-600'
    return 'bg-red-600'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Goal Progress</CardTitle>
        <CardDescription>Task completion by goal</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {goalProgress.map((goal, index) => (
          <div key={goal.id} className="space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2 flex-1">
                <Target className="h-4 w-4 text-primary mt-1" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">
                    Goal {index + 1}: {goal.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {goal.completedTasks} of {goal.totalTasks} tasks completed
                  </p>
                </div>
              </div>
              <span className="font-bold text-lg ml-4">{goal.percentage}%</span>
            </div>

            <div className="relative">
              <Progress value={goal.percentage} className="h-3" />
              <div
                className={`absolute top-0 left-0 h-3 rounded-full transition-all ${getProgressColor(goal.percentage)}`}
                style={{ width: `${goal.percentage}%` }}
              />
            </div>

            {goal.target_metric && (
              <p className="text-xs text-muted-foreground">
                Target: {goal.target_metric}
              </p>
            )}
          </div>
        ))}

        {/* Overall Summary */}
        <div className="border-t pt-4 mt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Goal Progress</span>
            <span className="font-bold">
              {Math.round(
                goalProgress.reduce((sum, g) => sum + g.percentage, 0) / goalProgress.length
              )}%
            </span>
          </div>
          <Progress
            value={
              goalProgress.reduce((sum, g) => sum + g.percentage, 0) / goalProgress.length
            }
            className="h-2 mt-2"
          />
        </div>
      </CardContent>
    </Card>
  )
}
