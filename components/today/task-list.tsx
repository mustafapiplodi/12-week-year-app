'use client'

import { TaskItem } from './task-item'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, Circle } from 'lucide-react'
import type { Tables } from '@/types/database'

interface TaskListProps {
  tasks: (Tables<'scheduled_tasks'> & {
    tactics: Tables<'tactics'> & {
      goals: Tables<'goals'>
    }
  })[]
  cycleId: string
}

export function TaskList({ tasks, cycleId }: TaskListProps) {
  // Separate and sort tasks
  const incompleteTasks = tasks
    .filter(t => !t.is_completed)
    .sort((a, b) => {
      // Sort by priority (high > medium > low)
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return (priorityOrder[a.tactics.priority as keyof typeof priorityOrder] || 1) -
             (priorityOrder[b.tactics.priority as keyof typeof priorityOrder] || 1)
    })

  const completedTasks = tasks
    .filter(t => t.is_completed)
    .sort((a, b) => {
      // Sort by completion time (most recent first)
      if (!a.completed_at || !b.completed_at) return 0
      return new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
    })

  if (tasks.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Incomplete Tasks */}
      {incompleteTasks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Circle className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">
              To Do ({incompleteTasks.length})
            </h2>
          </div>
          <div className="space-y-3">
            {incompleteTasks.map((task) => (
              <TaskItem key={task.id} task={task} cycleId={cycleId} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold text-green-600">
              Completed ({completedTasks.length})
            </h2>
          </div>
          <div className="space-y-3">
            {completedTasks.map((task) => (
              <TaskItem key={task.id} task={task} cycleId={cycleId} />
            ))}
          </div>
        </div>
      )}

      {/* All tasks completed celebration */}
      {incompleteTasks.length === 0 && completedTasks.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6 text-center">
            <div className="text-6xl mb-3">🎉</div>
            <h3 className="text-2xl font-bold text-green-900 mb-2">
              All Tasks Complete!
            </h3>
            <p className="text-green-800">
              Great job! You've completed all your tasks for today. Keep up the momentum!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
