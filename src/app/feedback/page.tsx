"use client"

import { useState, useEffect } from "react"
import { getTickets, getTicketDetails, addMessage, updateTicketStatus } from "@/app/actions/ticket-actions"
import { SLABadge } from "@/components/feedback/sla-badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, Send, User, Car, CheckCircle2, Clock } from "lucide-react"

export default function FeedbackPage() {
    const [tickets, setTickets] = useState<any[]>([])
    const [selectedTicket, setSelectedTicket] = useState<any>(null)
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadTickets()
    }, [])

    async function loadTickets() {
        setLoading(true)
        const data = await getTickets()
        setTickets(data)
        setLoading(false)
    }

    async function handleSelectTicket(id: number) {
        const details = await getTicketDetails(id)
        setSelectedTicket(details)
    }

    async function sendMessage() {
        if (!message.trim() || !selectedTicket) return
        await addMessage(selectedTicket.id, message, 'ADMIN')
        setMessage("")
        handleSelectTicket(selectedTicket.id) // Refresh chat
    }

    async function handleStatusChange(status: string) {
        if (!selectedTicket) return
        await updateTicketStatus(selectedTicket.id, status)
        handleSelectTicket(selectedTicket.id)
        loadTickets() // Refresh list for status badge updates
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Left Sidebar: Ticket List */}
            <div className="w-96 border-r bg-white flex flex-col">
                <div className="p-4 border-b space-y-4">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        Mission Control
                    </h1>
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search tickets..." className="pl-8" />
                    </div>
                    <div className="flex gap-2 text-xs">
                        <Button variant="outline" size="sm" className="h-7"><Filter className="h-3 w-3 mr-1"/> Filter</Button>
                        <Badge variant="secondary" className="cursor-pointer">Open ({tickets.filter(t => t.status === 'OPEN').length})</Badge>
                        <Badge variant="secondary" className="cursor-pointer">Critical ({tickets.filter(t => t.priority === 'CRITICAL').length})</Badge>
                    </div>
                </div>
                
                <ScrollArea className="flex-1">
                    <div className="divide-y">
                        {tickets.map((t) => (
                            <div 
                                key={t.id} 
                                onClick={() => handleSelectTicket(t.id)}
                                className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${selectedTicket?.id === t.id ? 'bg-slate-100 border-l-4 border-slate-900' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-mono text-xs text-slate-500">{t.ticketNumber}</span>
                                    <SLABadge dueDate={t.slaTargetDate} status={t.status} />
                                </div>
                                <h3 className="font-semibold text-sm line-clamp-1">{t.subject}</h3>
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{t.description}</p>
                                <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500">
                                    <Badge variant="outline" className="text-[10px] h-5">{t.category}</Badge>
                                    <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Right Main Area: Ticket Detail */}
            <div className="flex-1 flex flex-col h-full">
                {selectedTicket ? (
                    <>
                        {/* Detail Header */}
                        <div className="h-16 border-b bg-white flex items-center justify-between px-6 shadow-sm z-10">
                            <div>
                                <h2 className="text-lg font-bold">{selectedTicket.subject}</h2>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="font-mono">{selectedTicket.ticketNumber}</span>
                                    <span>•</span>
                                    <span>via {selectedTicket.customer ? 'Customer Portal' : 'Internal'}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {selectedTicket.status !== 'RESOLVED' && (
                                    <Button onClick={() => handleStatusChange('RESOLVED')} variant="default" className="bg-green-600 hover:bg-green-700">
                                        <CheckCircle2 className="mr-2 h-4 w-4" /> Mark Resolved
                                    </Button>
                                )}
                                <Button variant="outline" onClick={() => handleSelectTicket(selectedTicket.id)}>Refresh</Button>
                            </div>
                        </div>

                        <div className="flex-1 flex overflow-hidden">
                            {/* Chat Area */}
                            <div className="flex-1 flex flex-col bg-slate-50/50">
                                <ScrollArea className="flex-1 p-6">
                                    <div className="space-y-6">
                                        {/* Original Incident */}
                                        <div className="bg-white p-4 rounded-lg border shadow-sm">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-sm">{selectedTicket.customer?.firstName || 'Unknown User'}</div>
                                                    <div className="text-xs text-muted-foreground">Reported issue</div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-700">{selectedTicket.description}</p>
                                        </div>

                                        {/* Timeline / Messages */}
                                        {selectedTicket.messages?.map((msg: any) => (
                                            <div key={msg.id} className={`flex gap-3 ${msg.sender === 'ADMIN' ? 'justify-end' : ''}`}>
                                                <div className={`max-w-[80%] rounded-lg p-3 text-sm ${
                                                    msg.sender === 'ADMIN' ? 'bg-blue-600 text-white' : 
                                                    msg.sender === 'SYSTEM' ? 'bg-slate-100 text-slate-500 text-center w-full italic' : 'bg-white border'
                                                }`}>
                                                    {msg.content}
                                                    <div className={`text-[10px] mt-1 opacity-70 ${msg.sender === 'ADMIN' ? 'text-blue-100' : ''}`}>
                                                        {new Date(msg.timestamp).toLocaleTimeString()}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                                
                                {/* Input Area */}
                                <div className="p-4 bg-white border-t">
                                    <div className="flex gap-2">
                                        <Textarea 
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Type your reply..." 
                                            className="min-h-[80px]"
                                        />
                                        <Button onClick={sendMessage} className="h-auto px-6"><Send className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                            </div>

                            {/* Ticket Context Sidebar */}
                            <div className="w-80 border-l bg-white p-6 space-y-6 overflow-y-auto">
                                <div>
                                    <h3 className="text-xs font-bold uppercase text-slate-400 mb-4">Ticket Details</h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Status</span>
                                            <Badge variant={selectedTicket.status === 'OPEN' ? 'default' : 'secondary'}>{selectedTicket.status}</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Priority</span>
                                            <Badge variant="outline" className={
                                                selectedTicket.priority === 'CRITICAL' ? 'border-red-500 text-red-500' : 
                                                selectedTicket.priority === 'HIGH' ? 'border-orange-500 text-orange-500' : ''
                                            }>{selectedTicket.priority}</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-muted-foreground">SLA Target</span>
                                            <span className="font-mono text-xs">{new Date(selectedTicket.slaTargetDate).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {selectedTicket.customer && (
                                    <div>
                                        <h3 className="text-xs font-bold uppercase text-slate-400 mb-4">Customer</h3>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                                                <User className="h-5 w-5 text-slate-500" />
                                            </div>
                                            <div>
                                                <div className="font-medium">{selectedTicket.customer.firstName} {selectedTicket.customer.lastName}</div>
                                                <div className="text-xs text-muted-foreground">{selectedTicket.customer.phone}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedTicket.vehicle && (
                                    <div>
                                        <h3 className="text-xs font-bold uppercase text-slate-400 mb-4">Vehicle</h3>
                                        <Card>
                                            <CardContent className="p-3">
                                                <div className="flex items-start gap-3">
                                                    <Car className="h-5 w-5 text-blue-500 mt-1" />
                                                    <div>
                                                        <div className="font-bold">{selectedTicket.vehicle.regNumber}</div>
                                                        <div className="text-xs text-muted-foreground">{selectedTicket.vehicle.model}</div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400 flex-col gap-4">
                        <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center">
                            <Clock className="h-10 w-10 opacity-50" />
                        </div>
                        <p>Select a ticket to view details</p>
                    </div>
                )}
            </div>
        </div>
    )
}
