import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, AlertCircle, Loader2, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      login(data.user, data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Left side: Branding/Marketing (Hidden on mobile/tablet) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-primary overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src="/login-bg.png" 
            alt="Background" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/40 to-transparent z-10" />
        
        <div className="relative z-20 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold border border-white/30 shadow-xl shadow-black/10">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-2xl tracking-tight leading-none">EnrollDash</span>
              <span className="text-white/60 text-[10px] font-medium uppercase tracking-wider mt-1">Analytics Platform</span>
            </div>
          </div>

          <div className="space-y-6">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl font-bold text-white leading-tight"
            >
              Start Your <br />
              <span className="text-primary-foreground/80">Journey</span> <br />
              with Us Today.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-lg text-white/80 max-w-lg"
            >
              Join thousands of educators and administrators who trust EnrollDash for their data management needs.
            </motion.p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[5, 6, 7, 8].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-primary bg-secondary flex items-center justify-center text-[10px] font-bold">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p className="text-sm text-white/60">
              Over 10,000+ records processed daily
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Signup Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-card">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[400px] space-y-8"
        >
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight">Create account</h1>
            <p className="text-sm text-muted-foreground">
              Sign up to start managing your data.
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <Button variant="outline" className="w-full h-10 font-normal justify-center gap-2 border-border/60 hover:bg-accent/50 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-medium">OR</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="text-destructive text-[13px] bg-destructive/10 p-3 rounded-md border border-destructive/20 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">Full Name</Label>
                  <Input
                    id="username"
                    placeholder="Enter your full name..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="h-10 bg-muted/40 border-border/80 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all rounded-md placeholder:text-muted-foreground/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 bg-muted/40 border-border/80 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all rounded-md placeholder:text-muted-foreground/40"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="password" title="Password" className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-10 bg-muted/40 border-border/80 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all rounded-md placeholder:text-muted-foreground/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" title="Confirm Password" className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">Confirm</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password..."
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-10 bg-muted/40 border-border/80 focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all rounded-md placeholder:text-muted-foreground/40"
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full h-10 font-semibold shadow-sm" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>

              <div className="pt-4 text-center">
                <p className="text-[13px] text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login" className="text-foreground hover:underline font-medium underline-offset-4">
                    Log in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
