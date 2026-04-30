import { ModeToggle } from '@/components/mode-toggle';
import { useAuth } from '../lib/AuthContext';
import { LogOut, GraduationCap, User, Settings, Shield, Mail, ChevronDown, LayoutDashboard, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup,
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import React from 'react';

export function Header() {
  const { user, logout, isAuthenticated } = useAuth();


  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50 w-full">
      <div className="flex h-16 items-center justify-between px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2 text-foreground group">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center font-bold text-primary-foreground group-hover:scale-105 transition-transform duration-200">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold text-base tracking-tight leading-none">EnrollDash</h1>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Analytics Platform</span>
          </div>
        </Link>
        
        <div className="flex items-center gap-3 md:gap-6">
          <ModeToggle />
          
          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2 md:pl-4 border-l border-border/50">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 p-1 pr-2 rounded-full border border-border/50 bg-background transition-all duration-200 focus:outline-none group">
                  <Avatar className="h-8 w-8 border border-border/20">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold dark:bg-primary dark:text-primary-foreground">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-muted-foreground group-data-[open]:rotate-180 group-data-[state=open]:rotate-180 group-data-[popup-open]:rotate-180 transition-transform duration-300 ease-in-out" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-1">
                  <div className="flex flex-col px-3 py-2.5 mb-1 border-b border-border/50 bg-muted/20 rounded-t-md">
                    <p className="text-sm font-bold truncate">{user?.username || 'User'}</p>
                    <p className="text-[10px] text-muted-foreground truncate uppercase tracking-wider font-medium">{user?.email || 'guest@example.com'}</p>
                  </div>
                  
                  <DropdownMenuGroup>
                    <DropdownMenuItem className="cursor-pointer" render={(props) => <Link {...props} to="/" />}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" render={(props) => <Link {...props} to="/data-entry" />}>
                      <Database className="mr-2 h-4 w-4" />
                      <span>Data Entry</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  <DropdownMenuGroup>
                    <DropdownMenuItem className="cursor-pointer" render={(props) => <Link {...props} to="/settings?tab=profile" />}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" render={(props) => <Link {...props} to="/settings?tab=preferences" />}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Preferences</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" render={(props) => <Link {...props} to="/settings?tab=security" />}>
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Security</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem className="cursor-pointer" render={(props) => <Link {...props} to="/settings?tab=contact" />}>
                    <Mail className="mr-2 h-4 w-4" />
                    <span>Support</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={logout} variant="destructive" className="cursor-pointer focus:bg-destructive/10">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-border/50">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-xs font-medium">Login</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="text-xs font-medium px-4">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
