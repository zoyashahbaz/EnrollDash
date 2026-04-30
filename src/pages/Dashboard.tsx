import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Enrollment, Prediction } from '../types';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ComposedChart, Line } from 'recharts';
import { Sparkles, Activity, Target, Users, Calendar, Filter, Clock } from 'lucide-react';
import { api } from '../lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorBoundary } from '../components/error-boundary';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function DashboardPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all');


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [enrollmentData, predictionData] = await Promise.all([
          api.getEnrollments(),
          api.getPrediction(),
        ]);
        setEnrollments(enrollmentData);
        if (predictionData && predictionData.predictedEnrollment) {
          setPrediction(predictionData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredEnrollments = useMemo(() => {
    if (timeRange === 'all') return enrollments;
    const count = parseInt(timeRange);
    return enrollments.slice(-count);
  }, [enrollments, timeRange]);

  const chartData = useMemo(() => {
    const data = [...filteredEnrollments].map(e => ({
      name: `${e.year}`,
      historical: e.total_enrolled,
      forecast: null
    }));

    if (prediction && filteredEnrollments.length > 0) {
      const lastRecord = data[data.length - 1];
      // Bridge the line
      const bridgedRecord = { ...lastRecord, forecast: lastRecord.historical as any };
      data[data.length - 1] = bridgedRecord;

      data.push({
        name: `${prediction.nextYear}`,
        historical: null as any,
        forecast: prediction.predictedEnrollment as any,
      });
    }
    return data;
  }, [filteredEnrollments, prediction]);

  const stats = useMemo(() => {
    const current = enrollments.length > 0 ? enrollments[enrollments.length - 1].total_enrolled : 0;
    const previous = enrollments.length > 1 ? enrollments[enrollments.length - 2].total_enrolled : 0;
    const diff = current - previous;
    const growth = previous ? ((diff / previous) * 100).toFixed(1) : '0';
    return { current, previous, diff, growth };
  }, [enrollments]);

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

  if (loading) {
    return (
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        <motion.div variants={item} className="h-10 w-48 bg-muted animate-pulse rounded" />
        <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="bg-card">
              <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
              <CardContent><Skeleton className="h-8 w-16 mb-2" /><Skeleton className="h-3 w-32" /></CardContent>
            </Card>
          ))}
        </motion.div>
        <motion.div variants={item} className="grid lg:grid-cols-[2fr,1fr] gap-6">
          <Skeleton className="h-[450px] rounded-xl" />
          <Skeleton className="h-[450px] rounded-xl" />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={item} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Enrollment Overview</h2>
          <p className="text-muted-foreground text-sm mt-1">Historical trends and predictive forecasting</p>
        </div>
        

      </motion.div>

      {/* KPI Stats */}
      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border-border/50 hover:border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs text-foreground/70 font-medium uppercase mb-1">Current Enrollment</CardTitle>
            <Users className="h-4 w-4 text-foreground/50" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.current.toLocaleString()}</div>
            <p className={cn("text-[10px] mt-1", stats.diff >= 0 ? 'text-emerald-500' : 'text-red-500')}>
              {stats.diff >= 0 ? '↑' : '↓'} {Math.abs(stats.diff).toLocaleString()} from last year
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border-primary/20 hover:border-primary/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs text-foreground/70 font-medium uppercase mb-1">Forecasted (Next Yr)</CardTitle>
            <Sparkles className="h-4 w-4 text-foreground/50 dark:text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {prediction ? prediction.predictedEnrollment.toLocaleString() : 'N/A'}
            </div>
            <p className="text-[10px] text-foreground/60 mt-1">Linear Regression Model</p>
          </CardContent>
        </Card>

        <Card className="bg-card hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border-border/50 hover:border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs text-foreground/70 font-medium uppercase mb-1">Growth Rate</CardTitle>
            <Activity className="h-4 w-4 text-foreground/50" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.diff >= 0 ? '+' : ''}{stats.growth}%</div>
            <p className="text-[10px] text-foreground/60 mt-1">Year-over-year</p>
          </CardContent>
        </Card>

        <Card className="bg-card hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border-border/50 hover:border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs text-foreground/70 font-medium uppercase mb-1">Model Confidence</CardTitle>
            <Target className="h-4 w-4 text-foreground/50" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {prediction?.rSquared !== undefined ? `${(prediction.rSquared * 100).toFixed(1)}%` : 'N/A'}
            </div>
            {prediction?.rSquared !== undefined ? (
              prediction.rSquared >= 0.8 ? (
                <p className="text-[10px] text-emerald-500 mt-1 flex items-center gap-1">High Reliability</p>
              ) : (
                <p className="text-[10px] text-yellow-500 mt-1">Moderate Reliability</p>
              )
            ) : (
              <p className="text-[10px] text-foreground/60 mt-1">Needs more data</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item} className="grid lg:grid-cols-[2fr,1fr] gap-6">
        {/* Main Chart */}
        <Card className="col-span-1 border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Enrollment Trend & Forecast</CardTitle>
              <CardDescription>Historical data with AI-powered future projection.</CardDescription>
            </div>
            <Calendar className="w-4 h-4 text-muted-foreground opacity-50" />
          </CardHeader>
          <CardContent>
            <ErrorBoundary>
              {chartData.length > 0 ? (
                <div className="h-[350px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorHistorical" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="rgb(16, 185, 129)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="rgb(16, 185, 129)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis 
                        dataKey="name" 
                        stroke="var(--muted-foreground)" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        dy={10}
                      />
                      <YAxis 
                        stroke="var(--muted-foreground)" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)', borderRadius: '8px' }}
                        itemStyle={{ color: 'var(--popover-foreground)' }}
                        labelStyle={{ color: 'var(--popover-foreground)', fontWeight: '600' }}
                        formatter={(value: any) => [value.toLocaleString(), 'Students']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="historical" 
                        stroke="rgb(16, 185, 129)" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorHistorical)" 
                        activeDot={{ r: 6 }} 
                        animationDuration={1500}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="forecast" 
                        stroke="#818cf8" 
                        strokeWidth={3} 
                        strokeDasharray="5 5" 
                        dot={{ r: 4, fill: "#818cf8" }}
                        activeDot={{ r: 6 }}
                        animationDuration={1500}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  No data available.
                </div>
              )}
            </ErrorBoundary>
          </CardContent>
        </Card>

        {/* Secondary Bar Chart */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Yearly Breakdown</CardTitle>
            <CardDescription>Visual comparison of strength.</CardDescription>
          </CardHeader>
          <CardContent>
            <ErrorBoundary>
              {filteredEnrollments.length > 0 ? (
                <div className="h-[350px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredEnrollments} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis 
                        dataKey="year" 
                        stroke="var(--muted-foreground)" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        dy={10}
                      />
                      <YAxis 
                        stroke="var(--muted-foreground)" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)', borderRadius: '8px' }}
                        cursor={{ fill: 'var(--secondary)', opacity: 0.4 }}
                        itemStyle={{ color: 'var(--popover-foreground)' }}
                        labelStyle={{ color: 'var(--popover-foreground)', fontWeight: '600' }}
                      />
                      <Bar 
                        dataKey="total_enrolled" 
                        name="Total Enrolled"
                        fill="var(--color-indigo-600)" 
                        radius={[4, 4, 0, 0]} 
                        barSize={30}
                        animationDuration={1000}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground text-sm text-center px-4">
                  Not enough data for comparison.
                </div>
              )}
            </ErrorBoundary>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
