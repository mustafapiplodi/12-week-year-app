'use client'

import { useState } from 'react'
import { useActiveVision, useCreateVision, useUpdateVision } from '@/lib/hooks/use-vision'
import { useCycles, useCreateCycle, useUpdateCycle } from '@/lib/hooks/use-cycles'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Target, Calendar, Archive, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'

export default function SettingsPage() {
  const { data: vision } = useActiveVision()
  const { data: cycles } = useCycles()
  const createVision = useCreateVision()
  const updateVision = useUpdateVision()
  const createCycle = useCreateCycle()
  const updateCycle = useUpdateCycle()

  // Vision form state
  const [longTermVision, setLongTermVision] = useState(vision?.long_term_vision || '')
  const [threeYearVision, setThreeYearVision] = useState(vision?.three_year_vision || '')

  // Cycle form state
  const [cycleTitle, setCycleTitle] = useState('')
  const [cycleStartDate, setCycleStartDate] = useState('')

  const handleSaveVision = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (vision) {
        await updateVision.mutateAsync({
          id: vision.id,
          long_term_vision: longTermVision,
          three_year_vision: threeYearVision,
        })
        toast.success('Vision updated!')
      } else {
        await createVision.mutateAsync({
          long_term_vision: longTermVision,
          three_year_vision: threeYearVision,
        })
        toast.success('Vision created!')
      }
    } catch (error) {
      toast.error('Failed to save vision')
    }
  }

  const handleCreateCycle = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!vision) {
      toast.error('Please create a vision first')
      return
    }

    try {
      const startDate = new Date(cycleStartDate)
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + (12 * 7)) // 12 weeks

      await createCycle.mutateAsync({
        title: cycleTitle,
        start_date: cycleStartDate,
        end_date: format(endDate, 'yyyy-MM-dd'),
        vision_id: vision.id,
        status: 'active',
      })

      toast.success('Cycle created!')
      setCycleTitle('')
      setCycleStartDate('')
    } catch (error) {
      toast.error('Failed to create cycle')
    }
  }

  const handleCompleteCycle = async (cycleId: string) => {
    try {
      await updateCycle.mutateAsync({
        id: cycleId,
        status: 'archived',
      })
      toast.success('Cycle completed and archived!')
    } catch (error) {
      toast.error('Failed to complete cycle')
    }
  }

  const activeCycle = cycles?.find(c => c.status === 'active')
  const archivedCycles = cycles?.filter(c => c.status === 'archived') || []

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your vision, cycles, and account
          </p>
        </div>

        <Tabs defaultValue="vision">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="vision">Vision</TabsTrigger>
            <TabsTrigger value="cycles">Cycles</TabsTrigger>
            <TabsTrigger value="archive">Archive</TabsTrigger>
          </TabsList>

          {/* Vision Tab */}
          <TabsContent value="vision" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <CardTitle>Your Vision</CardTitle>
                </div>
                <CardDescription>
                  Define where you want to go. Your vision guides all your goals.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveVision} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="longTerm">Long-Term Vision (10+ years)</Label>
                    <Textarea
                      id="longTerm"
                      value={longTermVision}
                      onChange={(e) => setLongTermVision(e.target.value)}
                      placeholder="Where do you see yourself in the long run? What's your ultimate destination?"
                      rows={4}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Be specific and emotional. This is your North Star.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="threeYear">3-Year Vision</Label>
                    <Textarea
                      id="threeYear"
                      value={threeYearVision}
                      onChange={(e) => setThreeYearVision(e.target.value)}
                      placeholder="What will be true about your life 3 years from now?"
                      rows={4}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Make it tangible. What will you see, feel, and experience?
                    </p>
                  </div>

                  <Button type="submit" disabled={createVision.isPending || updateVision.isPending}>
                    {vision ? 'Update Vision' : 'Create Vision'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cycles Tab */}
          <TabsContent value="cycles" className="space-y-4">
            {activeCycle && (
              <Card className="border-2 border-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <CardTitle>Active Cycle</CardTitle>
                    </div>
                    <Badge>Active</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-semibold text-lg">{activeCycle.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(activeCycle.start_date), 'MMM d, yyyy')} - {format(new Date(activeCycle.end_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleCompleteCycle(activeCycle.id)}
                  >
                    Complete & Archive Cycle
                  </Button>
                </CardContent>
              </Card>
            )}

            {!activeCycle && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New 12-Week Cycle</CardTitle>
                  <CardDescription>
                    Start a new execution period with 2-4 focused goals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateCycle} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cycleTitle">Cycle Title</Label>
                      <Input
                        id="cycleTitle"
                        value={cycleTitle}
                        onChange={(e) => setCycleTitle(e.target.value)}
                        placeholder="e.g., Q1 2024 Growth Sprint"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={cycleStartDate}
                        onChange={(e) => setCycleStartDate(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Tip: Start on a Monday for best results
                      </p>
                    </div>

                    <Button type="submit" disabled={createCycle.isPending || !vision}>
                      Create Cycle
                    </Button>

                    {!vision && (
                      <p className="text-sm text-destructive">
                        Please create a vision first before starting a cycle
                      </p>
                    )}
                  </form>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Archive Tab */}
          <TabsContent value="archive" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Archive className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Past Cycles</CardTitle>
                </div>
                <CardDescription>
                  Review your completed 12-week cycles
                </CardDescription>
              </CardHeader>
              <CardContent>
                {archivedCycles.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No archived cycles yet. Complete your first cycle to see it here.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {archivedCycles.map((cycle) => (
                      <div key={cycle.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-semibold">{cycle.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(cycle.start_date), 'MMM d, yyyy')} - {format(new Date(cycle.end_date), 'MMM d, yyyy')}
                          </p>
                          {cycle.overall_execution_score && (
                            <p className="text-sm mt-1">
                              Score: <span className="font-semibold">{Math.round(cycle.overall_execution_score)}%</span>
                            </p>
                          )}
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
