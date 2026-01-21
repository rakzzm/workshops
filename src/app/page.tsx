import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, TrendingDown, DollarSign, Package, Users, Wrench, 
  AlertTriangle, Clock, ShoppingCart, Building2, Briefcase, 
  CheckCircle2, XCircle, Play, Plus, Search, ClipboardCheck
} from "lucide-react"
import Link from "next/link"
import { getDashboardStats } from "@/app/actions/dashboard-actions"


export const dynamic = 'force-dynamic'

export default async function Dashboard() {

  const stats = await getDashboardStats()

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Revenue KPIs */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Revenue & Financial</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-50">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              <p className="text-xs text-blue-100 mt-1">All time earnings</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-50">Monthly Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</div>
              <p className="text-xs text-emerald-100">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-cyan-50">Today's Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-cyan-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.todayRevenue)}</div>
              <p className="text-xs text-cyan-100">Income today</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-indigo-50">Avg Job Value</CardTitle>
              <DollarSign className="h-4 w-4 text-indigo-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.avgJobValue)}</div>
              <p className="text-xs text-indigo-100">Per completed job</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Operations KPIs */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Operations & Jobs</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-50">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-orange-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalJobs}</div>
              <p className="text-xs text-orange-100">{stats.completedJobsCount} completed</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-50">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-yellow-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingJobs}</div>
              <p className="text-xs text-yellow-100">Needs approval</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-50">In Progress</CardTitle>
              <Play className="h-4 w-4 text-purple-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgressJobs}</div>
              <p className="text-xs text-purple-100">Active work</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-teal-50">Services Done</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-teal-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalServices}</div>
              <p className="text-xs text-teal-100">{stats.vehiclesServicedToday} today</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Inventory & Supply Chain */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Inventory & Supply Chain</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-slate-600 to-slate-700 text-white border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-100">Inventory Value</CardTitle>
              <Package className="h-4 w-4 text-slate-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalInventoryValue)}</div>
              <p className="text-xs text-slate-200">{stats.totalParts} parts in stock</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-50">Low Stock Alert</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.lowStockParts}</div>
              <p className="text-xs text-red-100">Items need reorder</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-violet-50">Active Vendors</CardTitle>
              <Building2 className="h-4 w-4 text-violet-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVendors}</div>
              <p className="text-xs text-violet-100">Supplier partners</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-50">Purchase Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-amber-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPOs}</div>
              <p className="text-xs text-amber-100">{stats.pendingOrders} pending</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Business Metrics */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Business Metrics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-sky-500 to-sky-600 text-white border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-sky-50">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-sky-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-sky-100">Customer base</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-lime-500 to-lime-600 text-white border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-lime-50">Vehicles Tracked</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-lime-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVehicles}</div>
              <p className="text-xs text-lime-100">In database</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-fuchsia-500 to-fuchsia-600 text-white border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-fuchsia-50">Mechanics</CardTitle>
              <Wrench className="h-4 w-4 text-fuchsia-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMechanics}</div>
              <p className="text-xs text-fuchsia-100">Workforce</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-rose-500 to-rose-600 text-white border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-rose-50">Approved Jobs</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-rose-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approvedJobs}</div>
              <p className="text-xs text-rose-100">Ready to start</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Revenue Trend Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Trend (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-end justify-between gap-1">
              {stats.revenueData.map((day, index) => {
                const maxRevenue = Math.max(...stats.revenueData.map(d => d.total))
                const height = maxRevenue > 0 ? (day.total / maxRevenue) * 100 : 0
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-[10px] text-muted-foreground font-medium">
                      {day.total > 0 ? `₹${(day.total/1000).toFixed(0)}k` : ''}
                    </div>
                    <div 
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t hover:from-blue-600 hover:to-blue-400 transition-colors"
                      style={{ height: `${height}%`, minHeight: day.total > 0 ? '4px' : '0px' }}
                      title={`${day.date}: ${formatCurrency(day.total)}`}
                    />
                    <div className="text-[9px] text-muted-foreground rotate-45 origin-top-left mt-1">
                      {new Date(day.date).getDate()}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Job Status Distribution */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Job Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  Pending
                </span>
                <span className="font-bold">{stats.jobStatusDistribution.pending}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${(stats.jobStatusDistribution.pending / Math.max(stats.totalJobs, 1)) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  Approved
                </span>
                <span className="font-bold">{stats.jobStatusDistribution.approved}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${(stats.jobStatusDistribution.approved / Math.max(stats.totalJobs, 1)) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  In Progress
                </span>
                <span className="font-bold">{stats.jobStatusDistribution.inProgress}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ width: `${(stats.jobStatusDistribution.inProgress / Math.max(stats.totalJobs, 1)) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  Completed
                </span>
                <span className="font-bold">{stats.jobStatusDistribution.completed}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${(stats.jobStatusDistribution.completed / Math.max(stats.totalJobs, 1)) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recentJobs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No recent jobs</p>
            ) : (
              stats.recentJobs.map((job: any) => (
                <div key={job.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{job.jobNumber}</p>
                    <p className="text-xs text-muted-foreground">{job.repairType} - {job.description.substring(0, 30)}...</p>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    job.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    job.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                    job.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-800' :
                    job.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {job.status}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button asChild className="justify-start h-14 bg-blue-600 hover:bg-blue-700">
              <Link href="/jobs">
                <Plus className="mr-2 h-5 w-5" />
                Create New Job
              </Link>
            </Button>
            <Button asChild variant="secondary" className="justify-start h-14">
              <Link href="/services">
                <Search className="mr-2 h-5 w-5" />
                Search Vehicle History
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start h-14">
              <Link href="/inventory">
                <Package className="mr-2 h-5 w-5" />
                Manage Inventory
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start h-14">
              <Link href="/orders">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Create Purchase Order
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      {stats.topMechanics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Mechanics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {stats.topMechanics.map((mech: any, index: number) => (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground">#{index + 1}</span>
                  </div>
                  <p className="font-medium text-sm">{mech.name}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Jobs</span>
                    <span className="font-bold">{mech.completedJobs}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Rating</span>
                    <span className="font-bold">{mech.rating.toFixed(1)}⭐</span>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full text-center ${
                    mech.availability === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                    mech.availability === 'BUSY' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {mech.availability}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
