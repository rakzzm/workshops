"use client"

import { useSession } from "next-auth/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Shield } from "lucide-react"

import { GeneralSettings } from "@/components/settings/general-settings"
import { FeatureSettings } from "@/components/settings/feature-settings"
import { TeamSettings } from "@/components/settings/team-settings"
import { BillingSettings } from "@/components/settings/billing-settings"
import { NotificationSettings } from "@/components/settings/notification-settings"
import { PaymentSettings } from "@/components/settings/payment-settings"
import { IntegrationSettings } from "@/components/settings/integration-settings"
import { SecuritySettings } from "@/components/settings/security-settings"
import { BackupSettings } from "@/components/settings/backup-settings"

export default function SettingsPage() {
    const { data: session } = useSession()

    if (!session?.user) return null

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">Configure your workshop and account preferences.</p>
                </div>
             </div>

             <Tabs defaultValue="general" className="w-full">
                <div className="overflow-x-auto border-b">
                    <TabsList className="w-full justify-start bg-transparent border-none">
                        <TabsTrigger value="general" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">General</TabsTrigger>
                        <TabsTrigger value="features" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Features</TabsTrigger>
                        <TabsTrigger value="team" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Team</TabsTrigger>
                        <TabsTrigger value="billing" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Billing</TabsTrigger>
                        <TabsTrigger value="notifications" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Notifications</TabsTrigger>
                        <TabsTrigger value="payments" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Payments</TabsTrigger>
                        <TabsTrigger value="integrations" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Integrations</TabsTrigger>
                        <TabsTrigger value="security" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Security</TabsTrigger>
                        <TabsTrigger value="backup" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Backup</TabsTrigger>
                        <TabsTrigger value="profile" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Account</TabsTrigger>
                    </TabsList>
                </div>

                <div className="mt-6">
                    <TabsContent value="general">
                        <Card>
                            <CardContent className="pt-6">
                                <GeneralSettings />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="features">
                        <Card>
                            <CardContent className="pt-6">
                                <FeatureSettings />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="team">
                        <Card>
                            <CardContent className="pt-6">
                                <TeamSettings />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="billing">
                        <Card>
                            <CardContent className="pt-6">
                                <BillingSettings />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="notifications">
                        <Card>
                            <CardContent className="pt-6">
                                <NotificationSettings />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="payments">
                        <Card>
                            <CardContent className="pt-6">
                                <PaymentSettings />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="integrations">
                        <Card>
                            <CardContent className="pt-6">
                                <IntegrationSettings />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="security">
                        <Card>
                            <CardContent className="pt-6">
                                <SecuritySettings />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="backup">
                        <Card>
                            <CardContent className="pt-6">
                                <BackupSettings />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="profile">
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>Manage your public profile details.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Full Name</Label>
                                    <Input defaultValue={session.user.name || ''} readOnly />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Email Address</Label>
                                    <Input defaultValue={session.user.email || ''} readOnly disabled />
                                </div>
                                <div className="flex items-center gap-3 p-4 border rounded-lg bg-slate-50">
                                    <Shield className="h-5 w-5 text-blue-500" />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">Logged in as {session.user.role}</div>
                                        <div className="text-xs text-muted-foreground">Admin permissions enabled</div>
                                    </div>
                                    <Badge variant="outline">Verified</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
