'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useRef, useEffect } from "react"
import { useAuth } from "@/app/(frontend)/_providers/Auth"
import { useForm } from "react-hook-form"
import { AlertCircle, CheckCircle2 } from "lucide-react"

type FormData = {
  email: string
  password: string
}

interface LoginFormProps extends React.ComponentProps<"div"> {
  errorMessage?: string
  redirectPath?: string
}

export function LoginForm({
  className,
  errorMessage,
  redirectPath,
  ...props
}: LoginFormProps) {

  const searchParams = useSearchParams()
  const allParams = searchParams.toString() ? `?${searchParams.toString()}` : ''
  const redirect = useRef(redirectPath || searchParams.get('redirect'))
  const { login } = useAuth()
  const router = useRouter()
  const [error, setError] = React.useState<null | string>(null)
  const [isSuccess, setIsSuccess] = React.useState(false)

  // Set initial error from URL parameter
  useEffect(() => {
    if (errorMessage) {
      setError(errorMessage)
    }
  }, [errorMessage])

  const {
    formState: { errors, isLoading },
    handleSubmit,
    register,
  } = useForm<FormData>()

  const onSubmit = useCallback(
    async (data: FormData) => {

      setError(null) // Clear any existing errors
      setIsSuccess(false)
      
      try {
        await login(data)
        setIsSuccess(true)
        
        // Small delay to show success message before redirect
        setTimeout(() => {
          if (redirect?.current) {
            router.push(redirect.current)
          } else {
            router.push('/dashboard')
          }
        }, 500)
      } catch (_) {
        setError('There was an error with the credentials provided. Please try again.')
      }
    },
    [login, router],
  ) 

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login with your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {isSuccess && (
            <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>Login successful! Redirecting...</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    {...register('email')}
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    disabled={isLoading || isSuccess}
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input 
                    {...register('password')} 
                    id="password" 
                    type="password" 
                    required 
                    disabled={isLoading || isSuccess}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || isSuccess}
                >
                  {isLoading ? 'Logging in...' : isSuccess ? 'Redirecting...' : 'Login'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground text-center text-xs text-balance">
        By clicking continue, you agree to our <a href="#" className="underline underline-offset-4 hover:text-primary">Terms of Service</a>{" "}
        and <a href="#" className="underline underline-offset-4 hover:text-primary">Privacy Policy</a>.
      </div>
    </div>
  )
}
