"use client"

import { useAuth } from '@/contexts/AuthContext'

export default function SettingsPage() {
    const { user } = useAuth()

    if (!user) return null

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Configure your workshop and account preferences.</p>
            </div>
            <div className="p-6 border rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <p className="text-lg">{user.name || 'N/A'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <p className="text-lg">{user.email}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Role</label>
                        <p className="text-lg font-semibold uppercase">{user.role}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
