import prisma from "@/lib/prisma"
import { MOCK_JOBS } from "@/lib/mock-data"
export const dynamic = 'force-dynamic'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ClipboardCheck, Clock, TrendingUp, CheckCircle2, XCircle, Play } from "lucide-react"
import { handleApproveJob, handleRejectJob, handleStartJob, handleCompleteJob } from "@/app/actions/job-actions"

export default async function JobsPage() {
  let jobs: any[] = []
  
  try {
    jobs = await prisma.jobBoard.findMany({
      orderBy: { submittedAt: 'desc' },
      include: {
        customer: true,
        vehicle: true,
        mechanic: true,
      }
    })
  } catch (error) {
    console.log('Database not available, showing empty jobs list')
    // Return empty array if database doesn't exist (Vercel)
    jobs = MOCK_JOBS as any[]
  }

  const stats = {
    total: jobs.length,
    pending: jobs.filter(j => j.status === 'PENDING').length,
    inProgress: jobs.filter(j => j.status === 'IN_PROGRESS').length,
    completed: jobs.filter(j => j.status === 'COMPLETED').length,
    revenue: jobs.filter(j => j.status === 'COMPLETED').reduce((sum, j) => sum + (j.finalCost || 0), 0)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500'
      case 'APPROVED': return 'bg-blue-500'
      case 'IN_PROGRESS': return 'bg-purple-500'
      case 'COMPLETED': return 'bg-green-500'
      case 'REJECTED': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'destructive'
      case 'HIGH': return 'default'
      case 'MEDIUM': return 'secondary'
      case 'LOW': return 'outline'
      default: return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Board</h1>
          <p className="text-muted-foreground">Track and manage repair jobs through approval workflow.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Play className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.revenue.toFixed(0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {jobs.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center text-muted-foreground">
              No jobs found.
            </CardContent>
          </Card>
        ) : jobs.map(job => (
          <Card key={job.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{job.jobNumber}</CardTitle>
                    <Badge variant={getPriorityColor(job.priority)} className="text-[10px] px-1.5 py-0">
                      {job.priority}
                    </Badge>
                  </div>
                  <Badge className={`${getStatusColor(job.status)} text-white text-xs`}>
                    {job.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Customer & Vehicle */}
              <div className="space-y-1 text-sm">
                {job.customer && (
                  <div className="font-medium">{job.customer.firstName} {job.customer.lastName}</div>
                )}
                {job.vehicle && (
                  <div className="text-muted-foreground">{job.vehicle.regNumber} - {job.vehicle.model}</div>
                )}
              </div>

              {/* Repair Details */}
              <div className="space-y-1">
                <div className="text-sm font-medium">{job.repairType}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">{job.description}</div>
              </div>

              {/* Mechanic */}
              {job.mechanic && (
                <div className="text-xs text-muted-foreground">
                  👤 {job.mechanic.name}
                </div>
              )}

              {/* Costs */}
              <div className="grid grid-cols-2 gap-2 text-xs border-t pt-2">
                {job.estimatedCost && (
                  <div>
                    <div className="text-muted-foreground">Estimated</div>
                    <div className="font-medium">₹{job.estimatedCost}</div>
                  </div>
                )}
                {job.finalCost && (
                  <div>
                    <div className="text-muted-foreground">Final</div>
                    <div className="font-medium">₹{job.finalCost}</div>
                  </div>
                )}
              </div>

              {/* Actions based on status */}
              <div className="flex gap-2 pt-2 border-t">
                {job.status === 'PENDING' && (
                  <>
                    <form action={handleApproveJob.bind(null, job.id)} className="flex-1">
                      <Button size="sm" className="w-full bg-green-600 hover:bg-green-700" type="submit">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
                      </Button>
                    </form>
                    <form action={handleRejectJob.bind(null, job.id)} className="flex-1">
                      <Button size="sm" variant="destructive" className="w-full" type="submit">
                        <XCircle className="h-3 w-3 mr-1" /> Reject
                      </Button>
                    </form>
                  </>
                )}
                {job.status === 'APPROVED' && (
                  <form action={handleStartJob.bind(null, job.id)} className="flex-1">
                    <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700" type="submit">
                      <Play className="h-3 w-3 mr-1" /> Start Work
                    </Button>
                  </form>
                )}
                {job.status === 'IN_PROGRESS' && (
                  <form action={handleCompleteJob.bind(null, job.id, job.estimatedCost || 0)} className="flex-1">
                    <Button size="sm" className="w-full bg-green-600 hover:bg-green-700" type="submit">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Complete
                    </Button>
                  </form>
                )}
              </div>

              {/* Timestamps */}
              <div className="text-[10px] text-muted-foreground space-y-0.5">
                <div>Submitted: {new Date(job.submittedAt).toLocaleDateString()}</div>
                {job.approvedAt && <div>Approved: {new Date(job.approvedAt).toLocaleDateString()}</div>}
                {job.startedAt && <div>Started: {new Date(job.startedAt).toLocaleDateString()}</div>}
                {job.completedAt && <div>Completed: {new Date(job.completedAt).toLocaleDateString()}</div>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
