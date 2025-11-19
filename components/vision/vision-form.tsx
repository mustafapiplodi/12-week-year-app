'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useCreateVision, useUpdateVision } from '@/lib/hooks/use-vision'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { Tables } from '@/types/database'

interface VisionFormProps {
  vision?: Tables<'visions'> | null
  onSuccess?: () => void
}

export function VisionForm({ vision, onSuccess }: VisionFormProps) {
  const [longTermVision, setLongTermVision] = useState(vision?.long_term_vision || '')
  const [threeYearVision, setThreeYearVision] = useState(vision?.three_year_vision || '')

  const createVision = useCreateVision()
  const updateVision = useUpdateVision()
  const router = useRouter()

  const isEditing = !!vision

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (longTermVision.length < 50) {
      toast.error('Long-term vision should be at least 50 characters')
      return
    }

    if (threeYearVision.length < 50) {
      toast.error('3-year vision should be at least 50 characters')
      return
    }

    try {
      if (isEditing) {
        await updateVision.mutateAsync({
          id: vision.id,
          long_term_vision: longTermVision,
          three_year_vision: threeYearVision,
        })
        toast.success('Vision updated successfully!')
      } else {
        await createVision.mutateAsync({
          long_term_vision: longTermVision,
          three_year_vision: threeYearVision,
        })
        toast.success('Vision created successfully!')
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/')
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.error?.message || 'Failed to save vision'
      toast.error(errorMessage)
      console.error('Vision save error:', {
        error,
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
      })
    }
  }

  const isLoading = createVision.isPending || updateVision.isPending

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Long-Term Vision (10+ Years)</CardTitle>
          <CardDescription>
            Describe your ultimate destination. What does your ideal life look like 10+ years from now?
            Be specific and vivid. This is your emotional why.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Example: I am financially free, running my own successful business that impacts thousands of lives. I have complete time freedom to spend with my family..."
            value={longTermVision}
            onChange={(e) => setLongTermVision(e.target.value)}
            rows={8}
            required
            minLength={50}
            disabled={isLoading}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {longTermVision.length} characters (minimum 50)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3-Year Vision</CardTitle>
          <CardDescription>
            Where do you need to be in 3 years to be on track for your long-term vision?
            Make it specific and measurable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Example: I have built my business to $500K annual revenue with a team of 5. I work 30 hours per week and take 8 weeks of vacation per year..."
            value={threeYearVision}
            onChange={(e) => setThreeYearVision(e.target.value)}
            rows={8}
            required
            minLength={50}
            disabled={isLoading}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {threeYearVision.length} characters (minimum 50)
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : isEditing ? 'Update Vision' : 'Create Vision'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
