'use client'

import { useState } from 'react'
import { useActiveCycle } from '@/lib/hooks/use-active-cycle'
import { useUser } from '@/lib/hooks/use-user'
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal } from '@/lib/hooks/use-goals'
import { useCreateTactic, useUpdateTactic, useDeleteTactic } from '@/lib/hooks/use-tactics'
import { useWeeklyReviews } from '@/lib/hooks/use-weekly-reviews'
import { useActiveVision } from '@/lib/hooks/use-vision'
import { useCreateLagIndicator, useDeleteLagIndicator, useUpdateLagIndicator, useWeekLagSnapshots } from '@/lib/hooks/use-lag-indicators'
import { ProgressRing } from '@/components/today/progress-ring'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Target, Calendar, TrendingUp, Plus, Trash2, ChevronDown, ChevronRight, Pencil, CheckCircle2 } from 'lucide-react'
import { getCurrentWeek } from '@/lib/utils/date-helpers'
import { VisionBanner } from '@/components/vision/vision-banner'
import { toast } from 'sonner'

export default function DashboardPage() {
  const { data: user, isLoading: userLoading } = useUser()
  const { data: activeCycle, isLoading: cycleLoading } = useActiveCycle()
  const { data: vision, isLoading: visionLoading } = useActiveVision()
  const { data: goals } = useGoals(activeCycle?.id)
  const { data: reviews } = useWeeklyReviews(activeCycle?.id)

  // Calculate current week for lag snapshots hook (must be before any early returns)
  const currentWeek = activeCycle ? getCurrentWeek(activeCycle.start_date) : 0
  const { data: lagSnapshots } = useWeekLagSnapshots(activeCycle?.id, currentWeek)

  const createGoal = useCreateGoal()
  const updateGoal = useUpdateGoal()
  const deleteGoal = useDeleteGoal()
  const createTactic = useCreateTactic()
  const updateTactic = useUpdateTactic()
  const deleteTactic = useDeleteTactic()
  const createLagIndicator = useCreateLagIndicator()
  const updateLagIndicator = useUpdateLagIndicator()
  const deleteLagIndicator = useDeleteLagIndicator()

  // Form states
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [goalTitle, setGoalTitle] = useState('')
  const [goalDescription, setGoalDescription] = useState('')
  const [goalWhy, setGoalWhy] = useState('')

  // Lag indicators state
  type LagIndicatorForm = {
    id?: string // Track existing indicator IDs
    name: string
    metric_type: 'number' | 'currency' | 'percentage' | 'weight_kg' | 'weight_lbs' | 'rating' | 'score' | 'count' | 'duration'
    target_value: string
  }
  const [lagIndicators, setLagIndicators] = useState<LagIndicatorForm[]>([
    { name: '', metric_type: 'number', target_value: '' }
  ])
  const [lagIndicatorsToDelete, setLagIndicatorsToDelete] = useState<string[]>([])

  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set())
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null)
  const [newTacticGoalId, setNewTacticGoalId] = useState<string | null>(null)
  const [editingTacticId, setEditingTacticId] = useState<string | null>(null)
  const [tacticTitle, setTacticTitle] = useState('')
  const [tacticType, setTacticType] = useState<'one_time' | 'recurring'>('recurring')
  const [tacticDueWeek, setTacticDueWeek] = useState<number>(1)
  const [tacticWeeklyFrequency, setTacticWeeklyFrequency] = useState<number>(7)

  if (userLoading || cycleLoading || visionLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!activeCycle) {
    return (
      <div className="container mx-auto p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Welcome to 12 Week Year</h1>
            <p className="text-xl text-muted-foreground">
              Achieve more in 12 weeks than most do in 12 months
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>
                Start your 12 Week Year journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!vision ? (
                <div className="space-y-2">
                  <h3 className="font-semibold">Step 1: Define Your Vision</h3>
                  <p className="text-sm text-muted-foreground">
                    Create a compelling vision to guide your goals
                  </p>
                  <Button asChild>
                    <Link href="/settings">Create Vision</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <h3 className="font-semibold">✓ Vision Created</h3>
                  </div>
                  <h3 className="font-semibold">Next: Create Your First 12-Week Cycle</h3>
                  <Button asChild>
                    <Link href="/settings">Create Cycle</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingGoalId && (goals?.length || 0) >= 4) {
      toast.error('Maximum 4 goals per cycle')
      return
    }

    try {
      if (editingGoalId) {
        // Update existing goal
        await updateGoal.mutateAsync({
          id: editingGoalId,
          cycle_id: activeCycle.id,
          title: goalTitle,
          description: goalDescription,
          why_it_matters: goalWhy,
          target_metric: '',
        })

        // Delete indicators marked for deletion
        for (const indicatorId of lagIndicatorsToDelete) {
          await deleteLagIndicator.mutateAsync({
            id: indicatorId,
            goal_id: editingGoalId,
          })
        }

        // Update or create lag indicators
        const validLagIndicators = lagIndicators.filter(ind => ind.name.trim() !== '')
        for (let i = 0; i < validLagIndicators.length; i++) {
          const indicator = validLagIndicators[i]
          if (indicator.id) {
            // Update existing indicator
            await updateLagIndicator.mutateAsync({
              id: indicator.id,
              goal_id: editingGoalId,
              name: indicator.name,
              metric_type: indicator.metric_type,
              target_value: indicator.target_value ? parseFloat(indicator.target_value) : null,
              display_order: i,
            })
          } else {
            // Create new indicator
            await createLagIndicator.mutateAsync({
              goal_id: editingGoalId,
              name: indicator.name,
              metric_type: indicator.metric_type,
              target_value: indicator.target_value ? parseFloat(indicator.target_value) : null,
              display_order: i,
            })
          }
        }

        toast.success('Goal updated!')
      } else {
        // Create the goal first
        const newGoal = await createGoal.mutateAsync({
          cycle_id: activeCycle.id,
          title: goalTitle,
          description: goalDescription,
          why_it_matters: goalWhy,
          target_metric: '',
          display_order: goals?.length || 0,
        })

        // Create lag indicators if any are filled out
        const validLagIndicators = lagIndicators.filter(ind => ind.name.trim() !== '')
        for (let i = 0; i < validLagIndicators.length; i++) {
          const indicator = validLagIndicators[i]
          await createLagIndicator.mutateAsync({
            goal_id: newGoal.id,
            name: indicator.name,
            metric_type: indicator.metric_type,
            target_value: indicator.target_value ? parseFloat(indicator.target_value) : null,
            display_order: i,
          })
        }

        toast.success('Goal created!')
      }

      setShowGoalForm(false)
      setEditingGoalId(null)
      setGoalTitle('')
      setGoalDescription('')
      setGoalWhy('')
      setLagIndicators([{ name: '', metric_type: 'number', target_value: '' }])
      setLagIndicatorsToDelete([])
    } catch (error) {
      toast.error(editingGoalId ? 'Failed to update goal' : 'Failed to create goal')
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Delete this goal and all its tactics?')) return

    try {
      await deleteGoal.mutateAsync({ id: goalId, cycle_id: activeCycle.id })
      toast.success('Goal deleted')
    } catch (error) {
      toast.error('Failed to delete goal')
    }
  }

  const handleCreateTactic = async (e: React.FormEvent, goalId: string) => {
    e.preventDefault()

    try {
      if (editingTacticId) {
        // Update existing tactic
        await updateTactic.mutateAsync({
          id: editingTacticId,
          goal_id: goalId,
          title: tacticTitle,
          tactic_type: tacticType,
          start_week: tacticType === 'one_time' ? tacticDueWeek : 1,
          end_week: tacticType === 'one_time' ? tacticDueWeek : 12,
          weekly_frequency: tacticType === 'one_time' ? 1 : tacticWeeklyFrequency,
        })
        toast.success('Tactic updated!')
      } else {
        // Create new tactic
        await createTactic.mutateAsync({
          goal_id: goalId,
          title: tacticTitle,
          tactic_type: tacticType,
          priority: 'medium', // Default priority
          start_week: tacticType === 'one_time' ? tacticDueWeek : 1,
          end_week: tacticType === 'one_time' ? tacticDueWeek : 12,
          weekly_frequency: tacticType === 'one_time' ? 1 : tacticWeeklyFrequency,
        })
        toast.success('Tactic created!')
      }

      setNewTacticGoalId(null)
      setEditingTacticId(null)
      setTacticTitle('')
      setTacticType('recurring')
      setTacticDueWeek(1)
      setTacticWeeklyFrequency(7)
    } catch (error) {
      toast.error(editingTacticId ? 'Failed to update tactic' : 'Failed to create tactic')
    }
  }

  const handleDeleteTactic = async (tacticId: string, goalId: string) => {
    try {
      await deleteTactic.mutateAsync({ id: tacticId, goal_id: goalId })
      toast.success('Tactic deleted')
    } catch (error) {
      toast.error('Failed to delete tactic')
    }
  }

  const toggleGoalExpanded = (goalId: string) => {
    const newExpanded = new Set(expandedGoals)
    if (newExpanded.has(goalId)) {
      newExpanded.delete(goalId)
    } else {
      newExpanded.add(goalId)
    }
    setExpandedGoals(newExpanded)
  }

  // Calculate stats
  const cycleProgress = (currentWeek / 12) * 100

  const averageWeeklyScore = reviews && reviews.length > 0
    ? Math.round(
        reviews.reduce((sum, r) => {
          const percentage = r.planned_tasks_count > 0
            ? (r.completed_tasks_count / r.planned_tasks_count) * 100
            : 0
          return sum + percentage
        }, 0) / reviews.length
      )
    : null

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <VisionBanner />

        <div>
          <h1 className="text-3xl font-bold mb-2">{activeCycle.title}</h1>
          <p className="text-muted-foreground">
            Week {currentWeek} of 12 • {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cycle Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Week {currentWeek}/12</div>
              <Progress value={cycleProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                <span className="text-2xl font-bold">{goals?.length || 0}/4</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Execution Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {averageWeeklyScore !== null ? `${averageWeeklyScore}%` : '--'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Target: 85%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reviews?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Weekly reviews</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button asChild variant="outline" className="w-full">
            <Link href="/weekly">
              <Calendar className="mr-2 h-4 w-4" />
              Weekly Scorecard
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/progress">
              <TrendingUp className="mr-2 h-4 w-4" />
              Progress Chart
            </Link>
          </Button>
        </div>

        {/* Goals & Tactics Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Goals & Tactics</CardTitle>
                <CardDescription>2-4 SMART goals with actionable tactics</CardDescription>
              </div>
              {!showGoalForm && (goals?.length || 0) < 4 && (
                <Button onClick={() => setShowGoalForm(true)} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Goal
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* New Goal Form */}
            {showGoalForm && (
              <form onSubmit={handleCreateGoal} className="space-y-3 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <Label htmlFor="goalTitle">Goal Title *</Label>
                  <Input
                    id="goalTitle"
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    placeholder="e.g., Launch new product line"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goalDescription">Description</Label>
                  <Textarea
                    id="goalDescription"
                    value={goalDescription}
                    onChange={(e) => setGoalDescription(e.target.value)}
                    placeholder="What will you achieve?"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goalWhy">Why It Matters *</Label>
                  <Textarea
                    id="goalWhy"
                    value={goalWhy}
                    onChange={(e) => setGoalWhy(e.target.value)}
                    placeholder="How does this connect to your vision?"
                    rows={2}
                    required
                  />
                </div>

                {/* Lag Indicators Section */}
                <div className="space-y-3 pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">📊 What results will you measure? (Lag Indicators)</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setLagIndicators([...lagIndicators, { name: '', metric_type: 'number', target_value: '' }])}
                    >
                      + Add Indicator
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Track measurable results like revenue, clients, ranking, etc. (Optional but recommended)
                  </p>

                  {lagIndicators.map((indicator, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 border rounded">
                      <div className="col-span-5">
                        <Label className="text-xs">Indicator Name</Label>
                        <Input
                          value={indicator.name}
                          onChange={(e) => {
                            const updated = [...lagIndicators]
                            updated[index].name = e.target.value
                            setLagIndicators(updated)
                          }}
                          placeholder="e.g., Search Ranking"
                          className="text-sm"
                        />
                      </div>
                      <div className="col-span-3">
                        <Label className="text-xs">Type</Label>
                        <Select
                          value={indicator.metric_type}
                          onValueChange={(value: any) => {
                            const updated = [...lagIndicators]
                            updated[index].metric_type = value
                            setLagIndicators(updated)
                          }}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent position="popper" sideOffset={5} className="max-h-[300px]">
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="currency">Currency (AED)</SelectItem>
                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                            <SelectItem value="weight_kg">Weight (kg)</SelectItem>
                            <SelectItem value="weight_lbs">Weight (lbs)</SelectItem>
                            <SelectItem value="rating">Rating (1-10)</SelectItem>
                            <SelectItem value="score">Score</SelectItem>
                            <SelectItem value="count">Count</SelectItem>
                            <SelectItem value="duration">Duration (hrs)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3">
                        <Label className="text-xs">Target</Label>
                        <Input
                          type="number"
                          value={indicator.target_value}
                          onChange={(e) => {
                            const updated = [...lagIndicators]
                            updated[index].target_value = e.target.value
                            setLagIndicators(updated)
                          }}
                          placeholder="e.g., 1"
                          className="text-sm"
                        />
                      </div>
                      <div className="col-span-1">
                        {lagIndicators.length > 1 && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const indicatorToRemove = lagIndicators[index]
                              // If it has an ID, mark it for deletion from database
                              if (indicatorToRemove.id) {
                                setLagIndicatorsToDelete([...lagIndicatorsToDelete, indicatorToRemove.id])
                              }
                              // Remove from the form
                              setLagIndicators(lagIndicators.filter((_, i) => i !== index))
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button type="submit" size="sm">{editingGoalId ? 'Update Goal' : 'Create Goal'}</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => {
                    setShowGoalForm(false)
                    setEditingGoalId(null)
                    setGoalTitle('')
                    setGoalDescription('')
                    setGoalWhy('')
                    setLagIndicators([{ name: '', metric_type: 'number', target_value: '' }])
                    setLagIndicatorsToDelete([])
                  }}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {/* Goals List */}
            {goals && goals.filter(g => g.id !== editingGoalId).length > 0 ? (
              <div className="space-y-3">
                {goals.filter(g => g.id !== editingGoalId).map((goal, index) => {
                  const isExpanded = expandedGoals.has(goal.id)
                  const tactics = goal.tactics || []

                  return (
                    <div key={goal.id} className="border rounded-lg">
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleGoalExpanded(goal.id)}
                                className="h-6 w-6 p-0"
                              >
                                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              </Button>
                              <h3 className="font-semibold">Goal {index + 1}: {goal.title}</h3>
                            </div>
                            {goal.description && (
                              <p className="text-sm text-muted-foreground ml-8">{goal.description}</p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingGoalId(goal.id)
                                setGoalTitle(goal.title)
                                setGoalDescription(goal.description || '')
                                setGoalWhy(goal.why_it_matters || '')

                                // Pre-fill existing lag indicators with IDs
                                const existingIndicators = (goal as any).goal_lag_indicators || []
                                if (existingIndicators.length > 0) {
                                  setLagIndicators(existingIndicators.map((ind: any) => ({
                                    id: ind.id, // Include the ID for tracking
                                    name: ind.name,
                                    metric_type: ind.metric_type,
                                    target_value: ind.target_value?.toString() || '',
                                  })))
                                } else {
                                  setLagIndicators([{ name: '', metric_type: 'number', target_value: '' }])
                                }

                                setLagIndicatorsToDelete([]) // Reset deletion tracking
                                setShowGoalForm(true)
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteGoal(goal.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Lag Indicators Progress */}
                        {!isExpanded && (goal as any).goal_lag_indicators && (goal as any).goal_lag_indicators.length > 0 && (
                          <div className="ml-8 mt-3 space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">📊 Progress:</p>
                            {(goal as any).goal_lag_indicators.map((indicator: any) => {
                              const snapshot = lagSnapshots?.find(s => s.goal_lag_indicator_id === indicator.id)
                              const currentValue = snapshot?.value || 0
                              const targetValue = indicator.target_value || 1
                              const percentage = Math.min((currentValue / targetValue) * 100, 100)

                              const formatValue = (value: number, type: string) => {
                                if (type === 'currency') return `AED ${value.toLocaleString()}`
                                if (type === 'percentage') return `${value}%`
                                if (type === 'weight_kg') return `${value} kg`
                                if (type === 'weight_lbs') return `${value} lbs`
                                if (type === 'rating') return `${value}/10`
                                if (type === 'duration') return `${value} hrs`
                                return value.toString()
                              }

                              return (
                                <div key={indicator.id} className="text-xs">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-muted-foreground">{indicator.name}</span>
                                    <span className="font-semibold">
                                      {formatValue(currentValue, indicator.metric_type)} / {formatValue(targetValue, indicator.metric_type)}
                                    </span>
                                  </div>
                                  <Progress value={percentage} className="h-1.5" />
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="ml-8 mt-4 space-y-4">
                            <div className="bg-muted/50 p-3 rounded text-sm">
                              <p className="font-medium">Why it matters:</p>
                              <p className="text-muted-foreground">{goal.why_it_matters}</p>
                            </div>

                            {/* Tactics */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">Tactics ({tactics.length})</p>
                                {newTacticGoalId !== goal.id && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setNewTacticGoalId(goal.id)}
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add Tactic
                                  </Button>
                                )}
                              </div>

                              {newTacticGoalId === goal.id && (
                                <form onSubmit={(e) => handleCreateTactic(e, goal.id)} className="space-y-2 p-3 border rounded bg-background">
                                  <Input
                                    value={tacticTitle}
                                    onChange={(e) => setTacticTitle(e.target.value)}
                                    placeholder="Tactic title (e.g., Weekly sales calls)"
                                    required
                                  />
                                  <div className="space-y-2">
                                    <Label htmlFor="tacticType">Tactic Type</Label>
                                    <Select value={tacticType} onValueChange={(v: any) => setTacticType(v)}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="recurring">Recurring</SelectItem>
                                        <SelectItem value="one_time">One-time</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  {tacticType === 'one_time' && (
                                    <div className="space-y-2">
                                      <Label htmlFor="dueWeek">Due Week</Label>
                                      <Select value={tacticDueWeek.toString()} onValueChange={(v) => setTacticDueWeek(parseInt(v))}>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select week" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {Array.from({ length: 12 }, (_, i) => i + 1).map((week) => (
                                            <SelectItem key={week} value={week.toString()}>
                                              Week {week}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  )}
                                  {tacticType === 'recurring' && (
                                    <div className="space-y-2">
                                      <Label htmlFor="frequency">Times per Week</Label>
                                      <Select value={tacticWeeklyFrequency.toString()} onValueChange={(v) => setTacticWeeklyFrequency(parseInt(v))}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="1">1 time per week</SelectItem>
                                          <SelectItem value="2">2 times per week</SelectItem>
                                          <SelectItem value="3">3 times per week</SelectItem>
                                          <SelectItem value="4">4 times per week</SelectItem>
                                          <SelectItem value="5">5 times per week</SelectItem>
                                          <SelectItem value="6">6 times per week</SelectItem>
                                          <SelectItem value="7">7 times per week (daily)</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  )}
                                  <div className="flex gap-2">
                                    <Button type="submit" size="sm">{editingTacticId ? 'Update' : 'Add'}</Button>
                                    <Button type="button" size="sm" variant="outline" onClick={() => {
                                      setNewTacticGoalId(null)
                                      setEditingTacticId(null)
                                      setTacticTitle('')
                                      setTacticType('recurring')
                                      setTacticDueWeek(1)
                                      setTacticWeeklyFrequency(7)
                                    }}>
                                      Cancel
                                    </Button>
                                  </div>
                                </form>
                              )}

                              {tactics.filter((t: any) => t.id !== editingTacticId).length > 0 ? (
                                <div className="space-y-1">
                                  {tactics.filter((t: any) => t.id !== editingTacticId).map((tactic: any) => (
                                    <div key={tactic.id} className="flex items-center justify-between p-2 border rounded text-sm">
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">
                                          {tactic.tactic_type === 'one_time' ? `Week ${tactic.start_week}` : `${tactic.weekly_frequency}x/wk`}
                                        </Badge>
                                        <span>{tactic.title}</span>
                                      </div>
                                      <div className="flex gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setEditingTacticId(tactic.id)
                                            setNewTacticGoalId(goal.id)
                                            setTacticTitle(tactic.title)
                                            setTacticType(tactic.tactic_type)
                                            setTacticDueWeek(tactic.start_week || 1)
                                            setTacticWeeklyFrequency(tactic.weekly_frequency || 7)
                                          }}
                                        >
                                          <Pencil className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteTactic(tactic.id, goal.id)}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : editingTacticId ? null : (
                                <p className="text-sm text-muted-foreground italic">No tactics yet</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-3">
                  No goals yet. Create 2-4 SMART goals to get started.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
