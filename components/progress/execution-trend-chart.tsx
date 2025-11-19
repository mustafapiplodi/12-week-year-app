'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useWeeklyReviews } from '@/lib/hooks/use-weekly-reviews'

interface ExecutionTrendChartProps {
  cycleId: string
}

export function ExecutionTrendChart({ cycleId }: ExecutionTrendChartProps) {
  const { data: reviews } = useWeeklyReviews(cycleId)
  // Prepare data for the chart
  const chartData = (reviews || [])
    .sort((a, b) => a.week_number - b.week_number)
    .map((review) => {
      const executionPercentage = review.planned_tasks_count > 0
        ? Math.round((review.completed_tasks_count / review.planned_tasks_count) * 100)
        : 0

      return {
        week: `Week ${review.week_number}`,
        weekNumber: review.week_number,
        execution: executionPercentage,
        target: 85, // 12 Week Year target
      }
    })

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Execution Trend</CardTitle>
          <CardDescription>Track your weekly execution percentage over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            <p>Complete weekly reviews to see your execution trend</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const averageExecution = Math.round(
    chartData.reduce((sum, item) => sum + item.execution, 0) / chartData.length
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution Trend</CardTitle>
        <CardDescription>
          Average: <span className="font-semibold">{averageExecution}%</span> | Target: 85%
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="week"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              domain={[0, 100]}
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              label={{ value: 'Execution %', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            {/* Target line at 85% */}
            <ReferenceLine
              y={85}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="3 3"
              label={{
                value: 'Target 85%',
                position: 'right',
                fill: 'hsl(var(--muted-foreground))',
                fontSize: 12,
              }}
            />
            {/* Execution line */}
            <Line
              type="monotone"
              dataKey="execution"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ r: 5, fill: 'hsl(var(--primary))' }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Performance Summary */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center border-t pt-4">
          <div>
            <p className="text-2xl font-bold">
              {chartData.filter(d => d.execution >= 85).length}
            </p>
            <p className="text-sm text-muted-foreground">Excellent Weeks</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {chartData.filter(d => d.execution >= 70 && d.execution < 85).length}
            </p>
            <p className="text-sm text-muted-foreground">Good Weeks</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">
              {chartData.filter(d => d.execution < 70).length}
            </p>
            <p className="text-sm text-muted-foreground">Needs Improvement</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
