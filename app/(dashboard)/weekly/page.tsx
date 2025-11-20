'use client'

import React, { useState, useEffect } from 'react'
import { useActiveCycle } from '@/lib/hooks/use-active-cycle'
import { useGoals } from '@/lib/hooks/use-goals'
import { useScheduledTasks, useCreateScheduledTask, useDeleteScheduledTask, useUpdateScheduledTask } from '@/lib/hooks/use-scheduled-tasks'
import { useWeeklyReviews, useCreateWeeklyReview, useUpdateWeeklyReview } from '@/lib/hooks/use-weekly-reviews'
import { useGoalLagIndicators, useWeekLagSnapshots, useUpsertLagSnapshot } from '@/lib/hooks/use-lag-indicators'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Calendar, CheckCircle2, TrendingUp, Target } from 'lucide-react'
import { getCurrentWeek, getWeekDates } from '@/lib/utils/date-helpers'
import { format, addDays, isSameDay, startOfWeek } from 'date-fns'

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function WeeklyPage() {
  const { data: activeCycle } = useActiveCycle()
  const { data: goals } = useGoals(activeCycle?.id)
  const currentWeek = activeCycle ? getCurrentWeek(activeCycle.start_date) : 0
  const weekDates = activeCycle ? getWeekDates(new Date(activeCycle.start_date), currentWeek) : null

  // Check if today is Saturday (6) or Sunday (0)
  const today = new Date()
  const isWeekend = today.getDay() === 0 || today.getDay() === 6
  const [activeTab, setActiveTab] = useState('scorecard')

  const { data: scheduledTasks, refetch } = useScheduledTasks(activeCycle?.id, currentWeek)
  const createScheduledTask = useCreateScheduledTask()
  const deleteScheduledTask = useDeleteScheduledTask()
  const updateScheduledTask = useUpdateScheduledTask()

  const { data: weeklyReviews } = useWeeklyReviews(activeCycle?.id)
  const currentReview = weeklyReviews?.find(r => r.week_number === currentWeek)
  const createWeeklyReview = useCreateWeeklyReview()
  const updateWeeklyReview = useUpdateWeeklyReview()

  const [whatWorked, setWhatWorked] = useState(currentReview?.what_worked || '')
  const [whatDidntWork, setWhatDidntWork] = useState(currentReview?.what_didnt_work || '')
  const [adjustments, setAdjustments] = useState(currentReview?.adjustments_needed || '')

  // Lag indicator snapshots
  const { data: weekSnapshots } = useWeekLagSnapshots(activeCycle?.id, currentWeek)
  const upsertSnapshot = useUpsertLagSnapshot()
  const [lagValues, setLagValues] = useState<Record<string, string>>({})
  const [lagNotes, setLagNotes] = useState<Record<string, string>>({})

  useEffect(() => {
    if (currentReview) {
      setWhatWorked(currentReview.what_worked || '')
      setWhatDidntWork(currentReview.what_didnt_work || '')
      setAdjustments(currentReview.adjustments_needed || '')
    }
  }, [currentReview])

  // Initialize lag values from existing snapshots
  useEffect(() => {
    if (weekSnapshots && weekSnapshots.length > 0) {
      const values: Record<string, string> = {}
      const notes: Record<string, string> = {}
      weekSnapshots.forEach(snapshot => {
        values[snapshot.goal_lag_indicator_id] = String(snapshot.value || '')
        notes[snapshot.goal_lag_indicator_id] = snapshot.notes || ''
      })
      setLagValues(values)
      setLagNotes(notes)
    }
  }, [weekSnapshots])

  if (!activeCycle || !weekDates) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No active cycle. Create a cycle in Settings to get started.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleTaskToggle = async (tacticId: string, dayIndex: number, date: Date) => {
    const existingTask = scheduledTasks?.find(
      t => t.tactic_id === tacticId && isSameDay(new Date(t.scheduled_date), date)
    )

    if (existingTask) {
      // Toggle completion
      await updateScheduledTask.mutateAsync({
        id: existingTask.id,
        cycle_id: activeCycle.id,
        week_number: currentWeek,
        is_completed: !existingTask.is_completed,
        completed_at: !existingTask.is_completed ? new Date().toISOString() : null,
      })
    } else {
      // Create new scheduled task
      await createScheduledTask.mutateAsync({
        tactic_id: tacticId,
        cycle_id: activeCycle.id,
        week_number: currentWeek,
        scheduled_date: format(date, 'yyyy-MM-dd'),
        is_completed: true,
        completed_at: new Date().toISOString(),
      })
    }
    refetch()
  }

  const getTaskForDay = (tacticId: string, date: Date) => {
    return scheduledTasks?.find(
      t => t.tactic_id === tacticId && isSameDay(new Date(t.scheduled_date), date)
    )
  }

  const handleSaveLagSnapshot = async (indicatorId: string) => {
    const value = lagValues[indicatorId]
    if (!value || !activeCycle) return

    try {
      await upsertSnapshot.mutateAsync({
        goal_lag_indicator_id: indicatorId,
        cycle_id: activeCycle.id,
        week_number: currentWeek,
        value: parseFloat(value),
        notes: lagNotes[indicatorId] || null,
      })
      toast.success('Progress updated!')
    } catch (error) {
      toast.error('Failed to update progress')
    }
  }

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault()

    const plannedCount = scheduledTasks?.length || 0
    const completedCount = scheduledTasks?.filter(t => t.is_completed).length || 0

    try {
      // Save lag indicator snapshots first
      if (goals && activeCycle) {
        for (const goal of goals) {
          const goalWithIndicators = goal as any
          if (goalWithIndicators.goal_lag_indicators) {
            for (const indicator of goalWithIndicators.goal_lag_indicators) {
              const value = lagValues[indicator.id]
              if (value && value.trim() !== '') {
                await upsertSnapshot.mutateAsync({
                  goal_lag_indicator_id: indicator.id,
                  cycle_id: activeCycle.id,
                  week_number: currentWeek,
                  value: parseFloat(value),
                  notes: lagNotes[indicator.id] || null,
                })
              }
            }
          }
        }
      }

      // Save weekly review
      if (currentReview) {
        await updateWeeklyReview.mutateAsync({
          id: currentReview.id,
          cycle_id: activeCycle.id,
          planned_tasks_count: plannedCount,
          completed_tasks_count: completedCount,
          what_worked: whatWorked,
          what_didnt_work: whatDidntWork,
          adjustments_needed: adjustments,
        })
        toast.success('Review updated!')
      } else {
        await createWeeklyReview.mutateAsync({
          cycle_id: activeCycle.id,
          week_number: currentWeek,
          week_start_date: format(weekDates.start, 'yyyy-MM-dd'),
          week_end_date: format(weekDates.end, 'yyyy-MM-dd'),
          planned_tasks_count: plannedCount,
          completed_tasks_count: completedCount,
          what_worked: whatWorked,
          what_didnt_work: whatDidntWork,
          adjustments_needed: adjustments,
        })
        toast.success('Review saved!')
      }
    } catch (error) {
      toast.error('Failed to save review')
    }
  }

  // Calculate execution score based on weekly frequency targets
  const calculateExecutionScore = () => {
    if (!goals || goals.length === 0) return 0

    let totalTarget = 0
    let totalCompleted = 0

    goals.forEach(goal => {
      const tactics = goal.tactics || []
      tactics.forEach((tactic: any) => {
        // Skip tactics not in this week's range
        if (tactic.start_week > currentWeek || tactic.end_week < currentWeek) return

        const weeklyFrequency = tactic.weekly_frequency || 7
        const target = tactic.tactic_type === 'one_time' ? 1 : weeklyFrequency
        const completed = scheduledTasks?.filter(
          t => t.tactic_id === tactic.id && t.is_completed
        ).length || 0

        totalTarget += target
        totalCompleted += Math.min(completed, target) // Cap at target
      })
    })

    return totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : 0
  }

  const executionScore = calculateExecutionScore()

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekDates.start, i))

  // Calculate individual totals per day
  const dailyTotals = weekDays.map(date => {
    const tasksForDay = scheduledTasks?.filter(t => isSameDay(new Date(t.scheduled_date), date)) || []
    const completed = tasksForDay.filter(t => t.is_completed).length
    const total = tasksForDay.length
    return { completed, total }
  })

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-full mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Week {currentWeek} Scorecard</h1>
          <p className="text-muted-foreground">
            {format(weekDates.start, 'MMM d')} - {format(weekDates.end, 'MMM d, yyyy')}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scorecard">Weekly Scorecard</TabsTrigger>
            <TabsTrigger value="review" disabled={!isWeekend}>
              Weekly Review {!isWeekend && '(Weekend Only)'}
            </TabsTrigger>
          </TabsList>

          {/* Scorecard Tab */}
          <TabsContent value="scorecard" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Execution Scorecard</CardTitle>
                    <CardDescription>
                      Check off tactics as you complete them each day
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{executionScore}%</div>
                    <p className="text-sm text-muted-foreground">Execution Score</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2">
                        <th className="text-left p-3 font-bold bg-muted">GOAL / TACTIC</th>
                        {DAYS_OF_WEEK.map((day, i) => (
                          <th key={day} className="text-center p-3 font-medium bg-muted min-w-[80px]">
                            <div className="text-sm">{day.substring(0, 3)}</div>
                            <div className="text-xs text-muted-foreground">{format(weekDays[i], 'M/d')}</div>
                          </th>
                        ))}
                        <th className="text-center p-3 font-medium bg-muted min-w-[80px]">TOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {goals && goals.length > 0 ? (
                        goals.map(goal => {
                          const tactics = goal.tactics || []
                          // Filter tactics for current week
                          const currentWeekTactics = tactics.filter((tactic: any) =>
                            tactic.start_week <= currentWeek && tactic.end_week >= currentWeek
                          )
                          if (currentWeekTactics.length === 0) return null

                          return (
                            <React.Fragment key={goal.id}>
                              {/* Goal Header Row */}
                              <tr className="border-b bg-primary/5">
                                <td colSpan={9} className="p-3 font-bold text-sm uppercase">
                                  {goal.title}
                                </td>
                              </tr>

                              {/* Tactic Rows */}
                              {tactics.map((tactic: any) => {
                                // Skip tactics not in this week's range
                                if (tactic.start_week > currentWeek || tactic.end_week < currentWeek) return null

                                const tacticTotal = scheduledTasks?.filter(
                                  t => t.tactic_id === tactic.id && t.is_completed
                                ).length || 0
                                const weeklyFrequency = tactic.weekly_frequency || 7
                                const targetForWeek = tactic.tactic_type === 'one_time' ? 1 : weeklyFrequency
                                const targetMet = tacticTotal >= targetForWeek

                                return (
                                  <tr key={tactic.id} className={`border-b hover:bg-muted/50 ${targetMet ? 'bg-green-50 dark:bg-green-950/20' : ''}`}>
                                    <td className="p-3">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm">{tactic.title}</span>
                                        <Badge variant="secondary" className="text-xs">
                                          {tactic.tactic_type === 'one_time' ? '1x' : `${weeklyFrequency}x/wk`}
                                        </Badge>
                                        {targetMet && (
                                          <Badge variant="default" className="text-xs bg-green-600">
                                            ✓ Target Met
                                          </Badge>
                                        )}
                                      </div>
                                    </td>

                                    {/* Checkboxes for each day */}
                                    {weekDays.map((date, dayIndex) => {
                                      const task = getTaskForDay(tactic.id, date)
                                      const isChecked = task?.is_completed || false

                                      // Disable if target already met AND this specific checkbox is not checked
                                      const targetMet = tacticTotal >= targetForWeek
                                      const shouldDisable = targetMet && !isChecked

                                      return (
                                        <td key={dayIndex} className="text-center p-3 border-l">
                                          <div className="flex justify-center">
                                            <Checkbox
                                              checked={isChecked}
                                              disabled={shouldDisable}
                                              onCheckedChange={() => handleTaskToggle(tactic.id, dayIndex, date)}
                                              className={shouldDisable ? 'opacity-30 cursor-not-allowed' : ''}
                                            />
                                          </div>
                                        </td>
                                      )
                                    })}

                                    {/* Individual Total */}
                                    <td className="text-center p-3 border-l font-semibold">
                                      <div className="flex flex-col items-center">
                                        <span>{tacticTotal}/{targetForWeek}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {targetForWeek > 0 ? Math.round((tacticTotal / targetForWeek) * 100) : 0}%
                                        </span>
                                      </div>
                                    </td>
                                  </tr>
                                )
                              })}
                            </React.Fragment>
                          )
                        })
                      ) : (
                        <tr>
                          <td colSpan={9} className="text-center p-8 text-muted-foreground">
                            No goals or tactics yet. Create goals on the Dashboard first.
                          </td>
                        </tr>
                      )}

                      {/* Weekly Total Row */}
                      <tr className="border-t-2 bg-muted font-bold">
                        <td className="p-3 uppercase">WEEKLY TOTAL</td>
                        {dailyTotals.map((day, i) => (
                          <td key={i} className="text-center p-3 border-l">
                            {day.completed}/{day.total}
                          </td>
                        ))}
                        <td className="text-center p-3 border-l">
                          {scheduledTasks?.filter(t => t.is_completed).length || 0}/{scheduledTasks?.length || 0}
                        </td>
                      </tr>

                      {/* Success Percentage Row */}
                      <tr className="bg-primary/10 font-bold">
                        <td className="p-3 uppercase">SUCCESS PERCENTAGE</td>
                        {dailyTotals.map((day, i) => (
                          <td key={i} className="text-center p-3 border-l">
                            {day.total > 0 ? Math.round((day.completed / day.total) * 100) : 0}%
                          </td>
                        ))}
                        <td className="text-center p-3 border-l text-lg">
                          {executionScore}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-semibold mb-2">How to use this scorecard:</p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Check the box when you complete a tactic for that day</li>
                    <li>• Aim for 85% or higher weekly execution</li>
                    <li>• High priority tactics should be done first</li>
                    <li>• Review your score at the end of the week</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Review Tab */}
          <TabsContent value="review" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <CardTitle>Week {currentWeek} Execution Score</CardTitle>
                  </div>
                  <div className="text-3xl font-bold">
                    {executionScore}%
                  </div>
                </div>
                <CardDescription>
                  Target: 85% or higher for successful execution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{scheduledTasks?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Planned Tasks</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{scheduledTasks?.filter(t => t.is_completed).length || 0}</p>
                    <p className="text-sm text-muted-foreground">Completed Tasks</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lag Indicators Progress Update */}
            {goals && goals.some((g: any) => g.goal_lag_indicators?.length > 0) && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    <CardTitle>📊 Update Goal Progress (Lag Indicators)</CardTitle>
                  </div>
                  <CardDescription>
                    Track measurable results for your goals this week
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {goals?.map((goal: any) => {
                    const indicators = goal.goal_lag_indicators || []
                    if (indicators.length === 0) return null

                    return (
                      <div key={goal.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                        <h3 className="font-bold text-sm uppercase mb-4 text-primary">
                          {goal.title}
                        </h3>

                        <div className="space-y-4">
                          {indicators.map((indicator: any) => {
                            const previousSnapshot = weekSnapshots?.find(
                              s => s.goal_lag_indicator_id === indicator.id && s.week_number === currentWeek - 1
                            )
                            const currentValue = lagValues[indicator.id] || ''
                            const previousValue = previousSnapshot?.value || null

                            const formatValue = (value: number | null, type: string) => {
                              if (value === null) return '--'
                              if (type === 'currency') return `AED ${value.toLocaleString()}`
                              if (type === 'percentage') return `${value}%`
                              if (type === 'weight_kg') return `${value} kg`
                              if (type === 'weight_lbs') return `${value} lbs`
                              if (type === 'rating') return `${value}/10`
                              if (type === 'duration') return `${value} hrs`
                              return value.toString()
                            }

                            const calculateProgress = () => {
                              if (!previousValue || !currentValue) return null
                              const diff = parseFloat(currentValue) - previousValue
                              const isPositive = diff > 0
                              return { diff, isPositive, symbol: isPositive ? '📈' : '📉' }
                            }

                            const progress = calculateProgress()

                            return (
                              <div key={indicator.id} className="bg-muted/50 p-4 rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <Label className="font-semibold">{indicator.name}</Label>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Target: {formatValue(indicator.target_value, indicator.metric_type)}
                                      {previousValue && (
                                        <span className="ml-2">
                                          • Last week: {formatValue(previousValue, indicator.metric_type)}
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                  {progress && (
                                    <Badge variant={progress.isPositive ? 'default' : 'secondary'} className="ml-2">
                                      {progress.symbol} {progress.isPositive ? '+' : ''}{progress.diff.toFixed(0)}
                                    </Badge>
                                  )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Label className="text-xs">Current Value</Label>
                                    <Input
                                      type="number"
                                      step="any"
                                      value={currentValue}
                                      onChange={(e) => {
                                        setLagValues({ ...lagValues, [indicator.id]: e.target.value })
                                      }}
                                      placeholder="Enter current value"
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Notes (Optional)</Label>
                                    <Input
                                      value={lagNotes[indicator.id] || ''}
                                      onChange={(e) => {
                                        setLagNotes({ ...lagNotes, [indicator.id]: e.target.value })
                                      }}
                                      placeholder="Add context..."
                                      className="mt-1"
                                    />
                                  </div>
                                </div>

                                {indicator.target_value && currentValue && (
                                  <div className="mt-3">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                      <span>Progress to Target</span>
                                      <span className="font-semibold">
                                        {Math.round((parseFloat(currentValue) / indicator.target_value) * 100)}%
                                      </span>
                                    </div>
                                    <Progress
                                      value={(parseFloat(currentValue) / indicator.target_value) * 100}
                                      className="h-2"
                                    />
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Weekly Reflection</CardTitle>
                <CardDescription>
                  Answer these 3 questions to improve your execution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveReview} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="whatWorked">1. What worked well this week?</Label>
                    <Textarea
                      id="whatWorked"
                      value={whatWorked}
                      onChange={(e) => setWhatWorked(e.target.value)}
                      placeholder="Celebrate your wins and what contributed to success..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatDidntWork">2. What didn't work?</Label>
                    <Textarea
                      id="whatDidntWork"
                      value={whatDidntWork}
                      onChange={(e) => setWhatDidntWork(e.target.value)}
                      placeholder="Be honest about challenges and obstacles..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adjustments">3. What will you adjust next week?</Label>
                    <Textarea
                      id="adjustments"
                      value={adjustments}
                      onChange={(e) => setAdjustments(e.target.value)}
                      placeholder="Specific changes to improve your execution..."
                      rows={3}
                    />
                  </div>

                  <Button type="submit" disabled={createWeeklyReview.isPending || updateWeeklyReview.isPending}>
                    {currentReview ? 'Update Review' : 'Save Review'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
