"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { FileDown, Loader2, TrendingUp, Wallet, Wrench, Users, Package } from "lucide-react"
import { getGeneralStats, getRevenueOverTime, getServiceDistribution, getDetailedReport, getInventoryValuation, DateRange } from "@/app/actions/report-actions"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function ReportsPage() {
    const [range, setRange] = useState<DateRange>('monthly')
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<any>(null)
    const [revenueData, setRevenueData] = useState<any[]>([])
    const [distData, setDistData] = useState<any>(null)
    const [tableData, setTableData] = useState<any[]>([])
    const [inventoryData, setInventoryData] = useState<any>(null)

    useEffect(() => {
        loadData()
    }, [range])

    async function loadData() {
        setLoading(true)
        try {
            const [gen, rev, dist, det, inv] = await Promise.all([
                getGeneralStats(range),
                getRevenueOverTime(range),
                getServiceDistribution(range),
                getDetailedReport(range),
                getInventoryValuation()
            ])
            setStats(gen)
            setRevenueData(rev)
            setDistData(dist)
            setTableData(det)
            setInventoryData(inv)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const exportPDF = () => {
        const doc = new jsPDF()
        doc.text(`Workshop Report - ${range.toUpperCase()}`, 14, 15)
        
        // Summary
        doc.setFontSize(10)
        doc.text(`Revenue: $${stats?.revenue}`, 14, 25)
        doc.text(`Jobs: ${stats?.jobs}`, 60, 25)
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32)

        // Table
        const tableColumn = ["ID", "Date", "Vehicle", "Service", "Cost", "Status"]
        const tableRows: any[] = []

        tableData.forEach(ticket => {
            const ticketData = [
                ticket.id,
                new Date(ticket.date).toLocaleDateString(),
                ticket.vehicle?.regNumber || 'N/A',
                ticket.serviceType || 'Repair',
                ticket.totalCost.toFixed(2),
                ticket.status
            ]
            tableRows.push(ticketData)
        })

        // @ts-ignore
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
        })

        doc.save(`report_${range}_${Date.now()}.pdf`)
    }

    const exportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(tableData.map(t => ({
            ID: t.id,
            Date: new Date(t.date).toLocaleDateString(),
            Vehicle: t.vehicle?.regNumber,
            Model: t.vehicle?.model,
            Service: t.serviceType,
            Advisor: t.serviceAdvisor,
            Cost: t.totalCost,
            Status: t.status
        })))
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Services")
        XLSX.writeFile(workbook, `report_${range}_${Date.now()}.xlsx`)
    }

    if (loading && !stats) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-slate-400" /></div>

    return (
        <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800">Analytics & Reports</h1>
                    <p className="text-muted-foreground mt-1">Real-time insights into your workshop performance.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={range} onValueChange={(v: any) => setRange(v)}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="daily">Today</SelectItem>
                            <SelectItem value="weekly">This Week</SelectItem>
                            <SelectItem value="monthly">This Month</SelectItem>
                            <SelectItem value="yearly">This Year</SelectItem>
                            <SelectItem value="all">All Time</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={exportExcel}>
                        <FileDown className="mr-2 h-4 w-4" /> Excel
                    </Button>
                    <Button onClick={exportPDF}>
                        <FileDown className="mr-2 h-4 w-4" /> PDF
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{stats?.revenue?.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">in selected period</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Jobs Done</CardTitle>
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.jobs}</div>
                        <p className="text-xs text-muted-foreground">completed services</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Mechanics</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.mechanics}</div>
                        <p className="text-xs text-muted-foreground">currently active</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inventory Alert</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.lowStock}</div>
                        <p className="text-xs text-red-500 font-semibold">items low on stock</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="financials">Financials</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                    <TabsTrigger value="services">Service Log</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Revenue Trend</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <ResponsiveContainer width="100%" height={350}>
                                    <BarChart data={revenueData}>
                                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Service Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={350}>
                                    <PieChart>
                                        <Pie data={distData?.type || []} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                                            {(distData?.type || []).map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                                    {(distData?.type || []).map((entry: any, index: number) => (
                                         <div key={index} className="flex items-center text-xs">
                                             <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                             {entry.name}
                                         </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="financials" className="space-y-4">
                    <Card>
                        <CardHeader>
                             <CardTitle>Detailed Financial Analysis</CardTitle>
                             <CardDescription>Revenue breakdown over time.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="inventory" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                         <Card>
                             <CardHeader>
                                 <CardTitle>Inventory Valuation</CardTitle>
                             </CardHeader>
                             <CardContent className="space-y-4">
                                 <div className="text-4xl font-bold text-slate-800">₹{inventoryData?.valuation?.toLocaleString() || 0}</div>
                                 <div className="text-sm text-muted-foreground">Total value of {inventoryData?.count || 0} items in stock.</div>
                             </CardContent>
                         </Card>
                         <Card>
                             <CardHeader>
                                 <CardTitle>Top Valuable Parts</CardTitle>
                             </CardHeader>
                             <CardContent>
                                 <div className="space-y-2">
                                     {inventoryData?.topValue?.map((item: any, i: number) => (
                                         <div key={i} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                                             <span className="font-medium">{item.name}</span>
                                             <span>₹{item.value.toLocaleString()}</span>
                                         </div>
                                     ))}
                                 </div>
                             </CardContent>
                         </Card>
                    </div>
                </TabsContent>

                 <TabsContent value="services">
                    <Card>
                        <CardHeader>
                            <CardTitle>Service Log ({tableData.length})</CardTitle>
                            <CardDescription>Most recent 100 services in this period.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs uppercase bg-slate-100 text-slate-500">
                                        <tr>
                                            <th className="p-3">Date</th>
                                            <th className="p-3">Vehicle</th>
                                            <th className="p-3">Service</th>
                                            <th className="p-3">Advisor</th>
                                            <th className="p-3 text-right">Cost</th>
                                            <th className="p-3 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {tableData.map((t) => (
                                            <tr key={t.id} className="hover:bg-slate-50">
                                                <td className="p-3">{new Date(t.date).toLocaleDateString()}</td>
                                                <td className="p-3 font-medium">{t.vehicle?.regNumber} <span className="text-xs text-muted-foreground block">{t.vehicle?.model}</span></td>
                                                <td className="p-3">{t.serviceType || '-'}</td>
                                                <td className="p-3">{t.serviceAdvisor || '-'}</td>
                                                <td className="p-3 text-right font-mono">₹{t.totalCost.toFixed(2)}</td>
                                                <td className="p-3 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${
                                                        t.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                        t.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>{t.status}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
