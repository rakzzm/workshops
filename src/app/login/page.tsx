"use client"

import { useFormState, useFormStatus } from 'react-dom'
import { authenticate } from '@/app/actions/auth-actions'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

function LoginButton() {
  const { pending } = useFormStatus()
  return (
    <Button className="w-full" type="submit" disabled={pending}>
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...</> : "Sign In"}
    </Button>
  )
}

export default function LoginPage() {
  const [errorMessage, dispatch] = useFormState(authenticate, undefined)

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/grid.svg')] bg-cover relative">
       {/* Background Blur Overlay handled via CSS or simple overlay div */}
       <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-0" />
       
       <Card className="w-[380px] z-10 bg-white/90 backdrop-blur-xl border-slate-200 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to access the workshop.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={dispatch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" name="email" placeholder="admin@meghcomm.store" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" name="password" required />
            </div>
            
            {errorMessage && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <LoginButton />
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground bg-slate-50/50 p-4 rounded-b-xl">
          Don't have an account? <a href="/signup" className="text-blue-600 hover:underline ml-1">Sign up</a>
        </CardFooter>
      </Card>
    </div>
  )
}
