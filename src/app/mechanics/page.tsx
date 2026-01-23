import prisma from "@/lib/prisma"
import { MOCK_MECHANICS } from "@/lib/mock-data"
export const dynamic = 'force-dynamic'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, User, Hammer, Star, Award, Clock, Edit2, Trash2, Phone, Mail, Briefcase } from "lucide-react"
import { MechanicDialog } from "@/components/mechanics/mechanic-dialog"
import { deleteMechanic } from "@/app/actions/mechanic-actions"

export default async function MechanicsPage() {
  let mechanics: any[] = []
  
  try {
    mechanics = await prisma.mechanic.findMany({
      orderBy: { performanceRating: 'desc' },
      include: {
        _count: {
          select: { serviceRecords: true }
        }
      }
    })
  } catch (error) {
    console.error('Database error, using mock data:', error)
    mechanics = MOCK_MECHANICS as any[]
  }

  // Calculate stats
  const totalMechanics = mechanics.length
  const activeMechanics = mechanics.filter(m => m.status === 'ACTIVE').length
  const availableMechanics = mechanics.filter(m => m.availability === 'AVAILABLE' && m.status === 'ACTIVE').length
  const totalJobs = mechanics.reduce((acc, curr) => acc + curr._count.serviceRecords, 0)
  const avgRating = mechanics.length > 0 ? (mechanics.reduce((acc, curr) => acc + curr.performanceRating, 0) / mechanics.length).toFixed(1) : 0
  
  // Find top performer
  const topPerformer = [...mechanics].sort((a,b) => b.performanceRating - a.performanceRating)[0]

  // Group by department
  const departments = [...new Set(mechanics.map(m => m.department).filter(Boolean))]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mechanic Management</h1>
          <p className="text-muted-foreground">Manage your workshop team and assignments.</p>
        </div>
        <MechanicDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Total Team</CardTitle>
               <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold">{totalMechanics}</div>
               <p className="text-xs text-muted-foreground">{activeMechanics} active</p>
            </CardContent>
         </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Available Now</CardTitle>
               <ShieldCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold">{availableMechanics}</div>
               <p className="text-xs text-muted-foreground">Ready for work</p>
            </CardContent>
         </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Jobs Completed</CardTitle>
               <Hammer className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold">{totalJobs}</div>
               <p className="text-xs text-muted-foreground">Total assignments</p>
            </CardContent>
         </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
               <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold">{avgRating}/5.0</div>
               <p className="text-xs text-muted-foreground">Team performance</p>
            </CardContent>
         </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
               <Award className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
               <div className="text-sm font-bold truncate">{topPerformer ? topPerformer.name : "N/A"}</div>
               <p className="text-xs text-muted-foreground">{topPerformer ? `⭐ ${topPerformer.performanceRating}/5.0` : ""}</p>
            </CardContent>
         </Card>
      </div>

      {/* Department Filter Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Departments</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {departments.map(dept => {
            const count = mechanics.filter(m => m.department === dept).length
            return <Badge key={dept} variant="outline">{dept} ({count})</Badge>
          })}
        </CardContent>
      </Card>

      {/* Mechanics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mechanics.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center text-muted-foreground">
              No mechanics found. Add your first team member!
            </CardContent>
          </Card>
        ) : mechanics.map(mechanic => {
          const skills = mechanic.skills ? JSON.parse(mechanic.skills) : []
          const certs = mechanic.certifications ? JSON.parse(mechanic.certifications) : []
          
          return (
            <Card key={mechanic.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{mechanic.name}</CardTitle>
                      <Badge variant={mechanic.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-xs">
                        {mechanic.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{mechanic.employeeId}</p>
                  </div>
                  <div className="flex gap-1">
                    <MechanicDialog mechanic={mechanic} trigger={<Button variant="ghost" size="icon" className="h-7 w-7"><Edit2 className="h-3 w-3" /></Button>} />
                    <form action={async () => {
                        "use server"
                        await deleteMechanic(mechanic.id)
                    }}>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3 w-3" /></Button>
                    </form>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Role & Department */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{mechanic.specialization}</span>
                  </div>
                  {mechanic.department && (
                    <div className="text-xs text-muted-foreground pl-6">Dept: {mechanic.department}</div>
                  )}
                </div>

                {/* Contact */}
                <div className="space-y-1 text-xs">
                  {mechanic.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span>{mechanic.phone}</span>
                    </div>
                  )}
                  {mechanic.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="truncate">{mechanic.email}</span>
                    </div>
                  )}
                </div>

                {/* Performance & Details */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Rating</div>
                    <div className="text-sm font-bold flex items-center justify-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {mechanic.performanceRating.toFixed(1)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Jobs</div>
                    <div className="text-sm font-bold">{mechanic._count.serviceRecords}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Exp</div>
                    <div className="text-sm font-bold">{mechanic.yearsExperience}y</div>
                  </div>
                </div>

                {/* Availability & Shift */}
                <div className="flex gap-2 text-xs">
                  <Badge variant={mechanic.availability === 'AVAILABLE' ? 'default' : mechanic.availability === 'BUSY' ? 'destructive' : 'secondary'} className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {mechanic.availability}
                  </Badge>
                  {mechanic.shift && (
                    <Badge variant="outline" className="text-xs">{mechanic.shift}</Badge>
                  )}
                </div>

                {/* Skills */}
                {skills.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium">Skills</div>
                    <div className="flex flex-wrap gap-1">
                      {skills.slice(0, 3).map((skill: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>
                      ))}
                      {skills.length > 3 && (
                        <Badge variant="secondary" className="text-xs">+{skills.length - 3}</Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {certs.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      Certifications
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {certs.length} certificate{certs.length > 1 ? 's' : ''}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
