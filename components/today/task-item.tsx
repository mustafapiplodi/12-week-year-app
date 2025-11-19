'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCompleteTask } from '@/lib/hooks/use-scheduled-tasks'
import { toast } from 'sonner'
import { Clock, Target, CheckCircle2, Circle } from 'lucide-react'
import type { Tables } from '@/types/database'

interface TaskItemProps {
  task: Tables<'scheduled_tasks'> & {
    tactics: Tables<'tactics'> & {
      goals: Tables<'goals'>
    }
  }
  cycleId: string
}

const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200',
}

export function TaskItem({ task, cycleId }: TaskItemProps) {
  const [notes, setNotes] = useState(task.notes || '')
  const [showNotes, setShowNotes] = useState(false)
  const completeTask = useCompleteTask()

  const handleComplete = async (checked: boolean) => {
    try {
      await completeTask.mutateAsync({
        id: task.id,
        is_completed: checked,
        notes: notes || undefined,
        cycle_id: cycleId,
        scheduled_date: task.scheduled_date,
      })

      if (checked) {
        toast.success('Task completed! 🎉')
      } else {
        toast.success('Task marked incomplete')
      }
    } catch (error) {
      toast.error('Failed to update task')
      console.error(error)
    }
  }

  const handleSaveNotes = async () => {
    try {
      await completeTask.mutateAsync({
        id: task.id,
        is_completed: task.is_completed || false,
        notes,
        cycle_id: cycleId,
        scheduled_date: task.scheduled_date,
      })
      toast.success('Notes saved')
      setShowNotes(false)
    } catch (error) {
      toast.error('Failed to save notes')
      console.error(error)
    }
  }

  return (
    <Card className={`
      p-4 transition-all duration-300
      ${task.is_completed ? 'bg-muted/50 opacity-75' : 'hover:shadow-md'}
    `}>
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <div className="pt-1">
          <Checkbox
            id={task.id}
            checked={task.is_completed || false}
            onCheckedChange={handleComplete}
            className="h-6 w-6"
            disabled={completeTask.isPending}
          />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          {/* Title and Priority */}
          <div className="flex items-start gap-2 flex-wrap">
            <h3 className={`
              text-lg font-semibold flex-1
              ${task.is_completed ? 'line-through text-muted-foreground' : ''}
            `}>
              {task.tactics.title}
            </h3>
            <Badge
              variant="outline"
              className={PRIORITY_COLORS[task.tactics.priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.medium}
            >
              {task.tactics.priority}
            </Badge>
          </div>

          {/* Description */}
          {task.tactics.description && (
            <p className={`
              text-sm
              ${task.is_completed ? 'text-muted-foreground' : 'text-foreground'}
            `}>
              {task.tactics.description}
            </p>
          )}

          {/* Goal Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              <span className="text-xs">{task.tactics.goals.title}</span>
            </Badge>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">

            {/* Duration */}
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{task.tactics.estimated_duration} min</span>
            </div>

            {/* Completion Time */}
            {task.completed_at && (
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-green-600">
                  Completed at {new Date(task.completed_at).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Notes Section */}
          {!task.is_completed && (
            <div className="pt-2">
              {!showNotes ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotes(true)}
                >
                  {notes ? 'Edit notes' : 'Add notes'}
                </Button>
              ) : (
                <div className="space-y-2">
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this task..."
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveNotes}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setNotes(task.notes || '')
                        setShowNotes(false)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Show notes if task is completed and has notes */}
          {task.is_completed && task.notes && (
            <div className="pt-2 text-sm text-muted-foreground italic border-l-2 border-muted pl-3">
              {task.notes}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
