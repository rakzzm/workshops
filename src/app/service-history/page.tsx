import { getServiceHistory } from "@/app/actions/service-history-action"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Car, Wrench } from "lucide-react"

export default async function ServiceHistoryPage() {
    const records = await getServiceHistory()

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Service History</h1>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {records.map((record) => (
                    <Card key={record.id} className="overflow-hidden">
                        <CardHeader className="bg-muted/50 pb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Car className="h-5 w-5 text-blue-500" />
                                        {record.vehicle.regNumber}
                                    </CardTitle>
                                    <CardDescription>{record.vehicle.model}</CardDescription>
                                </div>
                                <Badge variant={record.status === 'COMPLETED' ? 'default' : 'secondary'}>
                                    {record.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-4 space-y-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {new Date(record.date).toLocaleDateString()}
                            </div>
                            
                            <div>
                                <h4 className="font-semibold text-sm mb-1">Service Type</h4>
                                <div className="text-sm">{record.serviceType || 'General Service'}</div>
                            </div>

                            {record.complaint && (
                                <div>
                                    <h4 className="font-semibold text-sm mb-1">Complaint</h4>
                                    <div className="text-sm text-muted-foreground line-clamp-2">{record.complaint}</div>
                                </div>
                            )}

                            <div className="pt-2 border-t flex justify-between items-center">
                                <span className="text-sm font-medium">Total Cost</span>
                                <span className="text-lg font-bold">₹{record.totalCost.toLocaleString()}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {records.length === 0 && (
                     <div className="col-span-full text-center py-12 text-muted-foreground">
                        <Wrench className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No service records found.</p>
                     </div>
                )}
            </div>
        </div>
    )
}
