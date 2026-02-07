import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { signup } from '@/app/auth/actions'
import { Sparkles } from 'lucide-react'

export default async function SignupPage({
    searchParams,
}: {
    searchParams: Promise<{ error: string }>
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4 py-12 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 flex flex-col items-center">
                    <Link href="/" className="flex items-center gap-2 group mb-4">
                        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center group-hover:bg-primary/90 transition-colors">
                            <Sparkles className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <span className="text-2xl font-bold text-foreground tracking-tight">
                            SKILL<span className="text-primary">SPHERE</span>
                        </span>
                    </Link>
                    <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                    <CardDescription>
                        Enter your email below to create your account
                    </CardDescription>
                </CardHeader>
                <form className="flex flex-col gap-4">
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        {(await searchParams).error && (
                            <p className="text-sm font-medium text-destructive">
                                {(await searchParams).error}
                            </p>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button formAction={signup} className="w-full">
                            Create Account
                        </Button>
                        <div className="text-center text-sm">
                            Already have an account?{' '}
                            <Link href="/login" className="underline underline-offset-4 hover:text-primary">
                                Sign in
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
