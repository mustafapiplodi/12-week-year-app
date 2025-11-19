'use client'

interface ProgressRingProps {
  completed: number
  total: number
  size?: number
}

export function ProgressRing({ completed, total, size = 200 }: ProgressRingProps) {
  const percentage = total > 0 ? (completed / total) * 100 : 0
  const strokeWidth = size * 0.1
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  const getColor = () => {
    if (percentage >= 100) return '#22c55e' // green-500
    if (percentage >= 75) return '#3b82f6'  // blue-500
    if (percentage >= 50) return '#eab308'  // yellow-500
    return '#ef4444' // red-500
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background circle */}
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold" style={{ color: getColor() }}>
            {completed}/{total}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {Math.round(percentage)}% Complete
          </div>
        </div>
      </div>
    </div>
  )
}
