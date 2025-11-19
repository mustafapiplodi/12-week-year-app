'use client'

import { useGoals } from '@/lib/hooks/use-goals'
import { useLagSnapshots } from '@/lib/hooks/use-lag-indicators'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Target } from 'lucide-react'

interface LagIndicatorsChartProps {
  cycleId: string
}

export function LagIndicatorsChart({ cycleId }: LagIndicatorsChartProps) {
  const { data: goals } = useGoals(cycleId)

  // Filter goals that have lag indicators
  const goalsWithIndicators = goals?.filter((goal: any) =>
    goal.goal_lag_indicators && goal.goal_lag_indicators.length > 0
  ) || []

  if (goalsWithIndicators.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Goal Progress Tracking</CardTitle>
          <CardDescription>
            Add lag indicators to your goals to track measurable results over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No lag indicators defined yet.</p>
            <p className="text-sm mt-2">Add them when creating or editing goals on the Dashboard.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>📊 Goal Progress Tracking (Lag Indicators)</CardTitle>
        <CardDescription>
          Track measurable results for each goal over the 12-week cycle
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={goalsWithIndicators[0]?.id}>
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${goalsWithIndicators.length}, 1fr)` }}>
            {goalsWithIndicators.map((goal: any, index: number) => (
              <TabsTrigger key={goal.id} value={goal.id}>
                Goal {index + 1}
              </TabsTrigger>
            ))}
          </TabsList>

          {goalsWithIndicators.map((goal: any) => (
            <TabsContent key={goal.id} value={goal.id} className="space-y-4">
              <div className="mb-4">
                <h3 className="font-bold text-lg">{goal.title}</h3>
                {goal.description && (
                  <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                )}
              </div>

              {goal.goal_lag_indicators.map((indicator: any) => (
                <IndicatorChart
                  key={indicator.id}
                  indicator={indicator}
                  cycleId={cycleId}
                />
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

function IndicatorChart({ indicator, cycleId }: { indicator: any; cycleId: string }) {
  const { data: snapshots } = useLagSnapshots(indicator.id, cycleId)

  const formatValue = (value: number | null, type: string) => {
    if (value === null) return 0
    return value
  }

  const formatYAxis = (value: number, type: string) => {
    if (type === 'currency') return `AED ${value.toLocaleString()}`
    if (type === 'percentage') return `${value}%`
    if (type === 'weight_kg') return `${value} kg`
    if (type === 'weight_lbs') return `${value} lbs`
    if (type === 'rating') return `${value}/10`
    if (type === 'duration') return `${value} hrs`
    return value.toString()
  }

  // Prepare chart data
  const chartData = snapshots?.map(snapshot => ({
    week: `Week ${snapshot.week_number}`,
    value: formatValue(snapshot.value, indicator.metric_type),
    target: indicator.target_value || 0,
  })) || []

  // Add current target line across all weeks
  if (chartData.length > 0 && indicator.target_value) {
    // Ensure target line spans from week 1 to the latest week
    const weeks = snapshots?.map(s => s.week_number) || []
    const minWeek = Math.min(...weeks)
    const maxWeek = Math.max(...weeks)

    // Fill in missing weeks with null values
    const completeData = []
    for (let i = minWeek; i <= maxWeek; i++) {
      const existing = chartData.find(d => d.week === `Week ${i}`)
      if (existing) {
        completeData.push(existing)
      } else {
        completeData.push({
          week: `Week ${i}`,
          value: null as any,
          target: indicator.target_value,
        })
      }
    }

    return (
      <div className="border rounded-lg p-4">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">{indicator.name}</h4>
            <div className="text-sm text-muted-foreground">
              Target: {formatYAxis(indicator.target_value, indicator.metric_type)}
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={completeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatYAxis(value, indicator.metric_type)}
            />
            <Tooltip
              formatter={(value: any) => formatYAxis(value, indicator.metric_type)}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#8b5cf6"
              strokeWidth={2}
              name="Actual"
              connectNulls
              dot={{ fill: '#8b5cf6', r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="target"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Target"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>

        {snapshots && snapshots.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div className="text-center p-2 bg-muted rounded">
              <p className="text-xs text-muted-foreground">Starting Value</p>
              <p className="font-semibold">{formatYAxis(snapshots[0].value, indicator.metric_type)}</p>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <p className="text-xs text-muted-foreground">Current Value</p>
              <p className="font-semibold">{formatYAxis(snapshots[snapshots.length - 1].value, indicator.metric_type)}</p>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <p className="text-xs text-muted-foreground">Progress to Target</p>
              <p className="font-semibold">
                {indicator.target_value
                  ? Math.round((snapshots[snapshots.length - 1].value / indicator.target_value) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="border rounded-lg p-4">
      <h4 className="font-semibold mb-2">{indicator.name}</h4>
      <p className="text-sm text-muted-foreground">No data recorded yet. Update progress in your weekly review.</p>
    </div>
  )
}
