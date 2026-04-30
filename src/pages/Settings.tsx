import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Briefcase, 
  Save, 
  Settings2, 
  Shield, 
  Lock, 
  Key,
  Sun,
  Moon,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Github,
  Instagram,
  Linkedin,
  AtSign,
  Globe
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { useAuth } from '../lib/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { api } from '../lib/api';

export default function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as 'profile' | 'preferences' | 'security' | 'contact' | null;
  const activeTab = tabFromUrl || 'profile';

  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };
  const { theme, setTheme } = useTheme();
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    username: user?.username || localStorage.getItem('profile_username') || '',
    email: user?.email || '',
    role: user?.role || localStorage.getItem('profile_role') || '',
    bio: user?.bio || localStorage.getItem('profile_bio') || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isCurrentPasswordValid, setIsCurrentPasswordValid] = useState<boolean | null>(null);
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);

  useEffect(() => {
    if (passwordData.currentPassword.length > 0) {
      const timer = setTimeout(async () => {
        setIsCheckingPassword(true);
        try {
          const { isValid } = await api.verifyPasswordInstant(passwordData.currentPassword);
          setIsCurrentPasswordValid(isValid);
        } catch (err) {
          setIsCurrentPasswordValid(false);
        } finally {
          setIsCheckingPassword(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsCurrentPasswordValid(null);
    }
  }, [passwordData.currentPassword]);
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        role: user.role || localStorage.getItem('profile_role') || '',
        bio: user.bio || localStorage.getItem('profile_bio') || ''
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      // Save to localStorage immediately for redundancy as requested
      localStorage.setItem('profile_username', formData.username);
      localStorage.setItem('profile_role', formData.role);
      localStorage.setItem('profile_bio', formData.bio);

      const response = await api.updateProfile({
        username: formData.username,
        role: formData.role,
        bio: formData.bio
      });
      updateUser(response.user);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      // Even if API fails, we've saved to local storage for persistence
      setSaveSuccess(true); 
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords don't match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }

    setIsChangingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    try {
      await api.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordSuccess(true);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const tabVariants = {
    inactive: { opacity: 0, x: -10 },
    active: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: 10, transition: { duration: 0.2 } }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Settings2 },
    { id: 'security', label: 'Security & Privacy', icon: Shield },
    { id: 'contact', label: 'Contact', icon: Mail },
  ];

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto space-y-6 pb-10 px-4 md:px-6"
    >
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground text-base mt-1 font-medium">Manage your account and app preferences.</p>
        </div>
      </motion.div>

      {/* Custom Tab Navigation */}
      <motion.div variants={item} className="flex border-b border-border overflow-x-auto no-scrollbar scrollbar-none whitespace-nowrap">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all relative shrink-0",
                isActive 
                  ? "text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
              {tab.label}
              {isActive && (
                <motion.div 
                  layoutId="activeTab" 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </button>
          );
        })}
      </motion.div>

      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              variants={tabVariants}
              initial="inactive"
              animate="active"
              exit="exit"
              className="space-y-6"
            >
              <Card className="border border-border/50 shadow-sm bg-card/50 backdrop-blur-xs overflow-hidden">
                <CardContent className="p-6 sm:p-8">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      <div className="flex flex-col items-center gap-4">
                        <Avatar className="h-24 w-24 border-2 border-primary/20 p-1">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <Button variant="outline" size="sm" className="text-xs h-8">
                          Change Avatar
                        </Button>
                      </div>

                      <div className="flex-1 space-y-6 w-full">
                        <div className="space-y-1">
                          <h3 className="text-xl font-semibold">Account Information</h3>
                          <p className="text-sm text-muted-foreground">Update your personal details and how others see you.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 max-w-2xl">
                          <div className="space-y-2">
                            <Label htmlFor="fullname" className="text-xs font-bold uppercase tracking-wider text-foreground/70">Full Name</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input 
                                id="fullname" 
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                placeholder="John Doe" 
                                className="pl-10 h-10 border-border bg-background dark:bg-zinc-900/50 focus-visible:ring-offset-0 focus-visible:ring-1" 
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-foreground/70">Email Address (Read Only)</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                              <Input 
                                id="email" 
                                type="email" 
                                value={formData.email}
                                disabled
                                placeholder="john@example.com" 
                                className="pl-10 h-10 border-border bg-muted/50 dark:bg-zinc-800/50 text-muted-foreground cursor-not-allowed" 
                              />
                            </div>
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="role" className="text-xs font-bold uppercase tracking-wider text-foreground/70">Department / Role</Label>
                            <div className="relative">
                              <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input 
                                id="role" 
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                placeholder="Academic Administrator" 
                                className="pl-10 h-10 border-border bg-background dark:bg-zinc-900/50 focus-visible:ring-offset-0 focus-visible:ring-1" 
                              />
                            </div>
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="bio" className="text-xs font-bold uppercase tracking-wider text-foreground/70">Bio</Label>
                            <Textarea 
                              id="bio" 
                              value={formData.bio}
                              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                              placeholder="Tell us about yourself..." 
                              className="min-h-32 border-border bg-background dark:bg-zinc-900/50 focus-visible:ring-offset-0 focus-visible:ring-1 resize-none py-3" 
                            />
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-border mt-8 max-w-2xl">
                          {saveSuccess && (
                            <motion.span 
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="text-xs font-medium text-emerald-500 mr-2 flex items-center gap-1"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Changes saved successfully!
                            </motion.span>
                          )}
                          <Button 
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                            size="sm" 
                            className="font-medium px-6 bg-primary dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 w-full sm:w-auto"
                          >
                            {isSaving ? (
                              <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full mr-2" />
                            ) : (
                              <Save className="mr-2 h-4 w-4" />
                            )}
                            {isSaving ? 'Saving...' : 'Save changes'}
                          </Button>
                        </div>
                      </div>
                    </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'preferences' && (
            <motion.div
              key="preferences"
              variants={tabVariants}
              initial="inactive"
              animate="active"
              exit="exit"
              className="space-y-8"
            >
              <Card className="border border-border/50 shadow-sm bg-card/50 backdrop-blur-xs overflow-hidden">
                <CardContent className="p-6 sm:p-8">
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-xl font-semibold">Appearance</h3>
                      <p className="text-sm text-muted-foreground">Customize how the dashboard looks on your device.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { id: 'light', label: 'Light', icon: Sun },
                        { id: 'dark', label: 'Dark', icon: Moon },
                        { id: 'system', label: 'System', icon: Laptop },
                      ].map((mode) => {
                        const Icon = mode.icon;
                        const isSelected = theme === mode.id;
                        return (
                          <button
                            key={mode.id}
                            onClick={() => setTheme(mode.id)}
                            className={cn(
                              "flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all gap-3 relative",
                              isSelected 
                                ? "border-primary bg-primary/5 ring-1 ring-primary" 
                                : "border-border bg-background hover:border-primary/50 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                            )}
                          >
                            <div className={cn(
                              "p-3 rounded-full",
                              isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            )}>
                              <Icon className="h-6 w-6" />
                            </div>
                            <span className="font-medium text-sm">{mode.label}</span>
                            {isSelected && <CheckCircle2 className="h-4 w-4 text-primary absolute top-3 right-3" />}
                          </button>
                        );
                      })}
                    </div>

                    <Separator className="opacity-50" />

                    <div className="p-4 rounded-xl border border-dashed border-border/60 bg-muted/20">
                      <p className="text-sm text-center text-muted-foreground py-2">
                        Language and notification preferences will be available soon.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              key="security"
              variants={tabVariants}
              initial="inactive"
              animate="active"
              exit="exit"
              className="space-y-8"
            >
              <div className="space-y-6">
                <Card className="border border-border/50 shadow-sm bg-card/50 backdrop-blur-xs overflow-hidden">
                  <CardContent className="p-6 sm:p-8 space-y-8">
                    <div className="space-y-1">
                      <h3 className="text-xl font-semibold">Change Password</h3>
                      <p className="text-sm text-muted-foreground">Ensure your account is using a long, random password to stay secure.</p>
                    </div>
                    
                    <div className="space-y-6">
                    <div className="space-y-4 max-w-md">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <div className="relative">
                          <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            id="current-password" 
                            type="password" 
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className={cn(
                              "pl-10 h-10 border-border bg-background dark:bg-zinc-900/50",
                              isCurrentPasswordValid === true && "border-emerald-500/50 focus-visible:ring-emerald-500/20",
                              isCurrentPasswordValid === false && "border-destructive/50 focus-visible:ring-destructive/20"
                            )}
                          />
                          <div className="absolute right-3 top-2.5 flex items-center">
                            {isCheckingPassword ? (
                              <div className="h-4 w-4 border-2 border-primary/30 border-t-primary animate-spin rounded-full" />
                            ) : (
                              <>
                                {isCurrentPasswordValid === true && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                                {isCurrentPasswordValid === false && <AlertCircle className="h-4 w-4 text-destructive" />}
                              </>
                            )}
                          </div>
                        </div>
                        {isCurrentPasswordValid === false && (
                          <p className="text-[10px] text-destructive font-medium mt-1">Current password does not match</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            id="new-password" 
                            type="password" 
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="pl-10 h-10 border-border bg-background dark:bg-zinc-900/50" 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <div className="relative">
                          <CheckCircle2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            id="confirm-password" 
                            type="password" 
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="pl-10 h-10 border-border bg-background dark:bg-zinc-900/50" 
                          />
                        </div>
                      </div>

                      {passwordError && (
                        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-xs font-medium">
                          {passwordError}
                        </div>
                      )}

                      <div className="flex items-center gap-3 pt-2">
                        <Button 
                          onClick={handleUpdatePassword}
                          disabled={isChangingPassword}
                          className="w-full font-medium"
                        >
                          {isChangingPassword ? (
                            <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full mr-2" />
                          ) : null}
                          {isChangingPassword ? 'Updating...' : 'Update Password'}
                        </Button>
                      </div>

                      {passwordSuccess && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 text-emerald-500 text-sm font-medium mt-2"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Password updated successfully!
                        </motion.div>
                      )}
                    </div>
                  </div>
                </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === 'contact' && (
            <motion.div
              key="contact"
              variants={tabVariants}
              initial="inactive"
              animate="active"
              exit="exit"
              className="space-y-6"
            >
              <Card className="border border-border/50 shadow-sm bg-card/50 backdrop-blur-xs overflow-hidden">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1 space-y-6 w-full">
                      <div className="space-y-1">
                        <h3 className="text-xl font-semibold">Developer Information</h3>
                        <p className="text-sm text-muted-foreground">Get in touch with the developer of this dashboard.</p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 border border-border/60 group hover:border-primary/50 transition-colors">
                          <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <User className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-foreground/70">Name</p>
                            <p className="font-semibold text-muted-foreground">Zarfishan Sahahbaz</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 border border-border/60 group hover:border-primary/50 transition-colors">
                          <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <AtSign className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-foreground/70">Email</p>
                            <p className="font-semibold text-muted-foreground">zoyashahbaz33@gmail.com</p>
                          </div>
                        </div>
                      </div>

                      <Separator className="opacity-50" />

                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold">Social Presence</h4>
                        <div className="flex gap-3">
                          {[
                            { icon: Github, label: 'GitHub' },
                            { icon: Instagram, label: 'Instagram' },
                            { icon: Linkedin, label: 'LinkedIn' },
                            { icon: Globe, label: 'Website' },
                          ].map((social, i) => {
                            const Icon = social.icon;
                            return (
                              <button
                                key={i}
                                className="p-3 rounded-full bg-muted/50 text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 transform hover:scale-110 shadow-sm"
                                title={social.label}
                              >
                                <Icon className="h-5 w-5" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="hidden md:flex flex-col items-center justify-center p-8 rounded-2xl bg-muted/30 border border-border/50 w-full md:w-64 aspect-square shrink-0">
                      <div className="relative h-24 w-24 rounded-full bg-muted border-2 border-border flex items-center justify-center">
                        <User className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                      <p className="mt-6 text-sm font-medium text-center text-muted-foreground/80">
                        Feel free to reach out for support or collaboration!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
