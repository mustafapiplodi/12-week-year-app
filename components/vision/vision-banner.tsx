'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Target } from 'lucide-react'
import { useActiveVision } from '@/lib/hooks/use-vision'

export function VisionBanner() {
  const [isExpanded, setIsExpanded] = useState(false)
  const { data: vision, isLoading } = useActiveVision()

  if (isLoading || !vision) {
    return null
  }

  const threeYearVision = vision.three_year_vision || ''
  const teaser = threeYearVision.slice(0, 80) + (threeYearVision.length > 80 ? '...' : '')

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 mb-6">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0 mt-0.5">
            <Target className="h-4 w-4 text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-purple-900">Remember Why</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 px-2 -mt-1"
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>

            {isExpanded ? (
              <div className="space-y-3">
                {vision.long_term_vision && (
                  <div>
                    <p className="text-xs font-medium text-purple-800 mb-1">Long-term Vision (10+ years)</p>
                    <p className="text-sm text-purple-900">{vision.long_term_vision}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-purple-800 mb-1">3-Year Vision</p>
                  <p className="text-sm text-purple-900">{threeYearVision}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-purple-800 italic">"{teaser}"</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
