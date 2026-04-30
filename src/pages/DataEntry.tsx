import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Enrollment } from '../types';
import { Trash2, Plus, Download, Database, Pencil, Users, School, BarChart3, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';
import { motion } from 'framer-motion';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
} from '@/components/ui/dialog';

export default function DataEntryPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [year, setYear] = useState('');
  const [className, setClassName] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [cityName, setCityName] = useState('');
  const [total, setTotal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchEnrollments = async () => {
    try {
      const data = await api.getEnrollments();
      setEnrollments(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.saveEnrollment({ 
        id: editId ?? undefined,
        year: parseInt(year), 
        total_enrolled: parseInt(total),
        class_name: className,
        college_name: collegeName,
        city_name: cityName
      });
      setEditId(null);
      setYear('');
      setClassName('');
      setCollegeName('');
      setCityName('');
      setTotal('');
      await fetchEnrollments();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: Enrollment) => {
    setEditId(record.id);
    setYear(record.year.toString());
    setClassName(record.class_name);
    setCollegeName(record.college_name);
    setCityName(record.city_name);
    setTotal(record.total_enrolled.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: number) => {
    setRecordToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (recordToDelete === null) return;
    
    setLoading(true);
    try {
      await api.deleteEnrollment(recordToDelete);
      await fetchEnrollments();
      setIsDeleteDialogOpen(false);
      setRecordToDelete(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const headers = ['Year', 'Class Name', 'College Name', 'City Name', 'Enrollment'];
    const csvData = enrollments.map(e => `${e.year},"${e.class_name || ''}","${e.college_name || ''}","${e.city_name || ''}",${e.total_enrolled}`);
    const csvContent = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enrollment_data_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
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

  const totalStudents = enrollments.reduce((sum, e) => sum + e.total_enrolled, 0);
  const uniqueColleges = new Set(enrollments.map(e => e.college_name)).size;
  const totalRecords = enrollments.length;

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={item} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Data Management</h2>
          <p className="text-muted-foreground text-sm mt-1">Manage and export historical records.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </motion.div>

      <motion.div variants={item} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <Card className="bg-card lg:col-span-2 h-full flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-2 mb-1">
                {editId ? <Pencil className="w-4 h-4 text-primary" /> : <Plus className="w-4 h-4 text-primary" />}
                <CardTitle className="text-lg">{editId ? 'Edit Record' : 'Add Record'}</CardTitle>
              </div>
              <CardDescription>{editId ? 'Update existing enrollment data.' : 'Enter enrollment data for a specific year.'}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Starting Academic Year</Label>
                    <Input
                      id="year"
                      placeholder="e.g., 2026"
                      type="number"
                      required
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="total">Total Enrolled</Label>
                    <Input
                      id="total"
                      placeholder="e.g., 14500"
                      type="number"
                      required
                      value={total}
                      onChange={(e) => setTotal(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="collegeName">College Name</Label>
                    <Input
                      id="collegeName"
                      placeholder="e.g., Superior College"
                      type="text"
                      required
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cityName">City Name</Label>
                    <Input
                      id="cityName"
                      placeholder="eg., Sargodha"
                      type="text"
                      required
                      value={cityName}
                      onChange={(e) => setCityName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="className">Class Name</Label>
                    <Input
                      id="className"
                      placeholder="e.g., A levels"
                      type="text"
                      required
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                    />
                  </div>
                </div>
                {error && (
                  <div className="p-3 rounded-md bg-destructive/10 text-destructive text-xs font-medium">
                    {error}
                  </div>
                )}
                <div className="flex justify-end items-center gap-3 mt-auto pt-6">
                  {saveSuccess && (
                    <motion.span 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-xs font-medium text-emerald-500 mr-2 flex items-center gap-1"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Changes saved successfully!
                    </motion.span>
                  )}
                  {editId && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-auto px-6" 
                      onClick={() => {
                        setEditId(null);
                        setYear('');
                        setClassName('');
                        setCollegeName('');
                        setCityName('');
                        setTotal('');
                        setError(null);
                        setSaveSuccess(false);
                      }}
                    >
                      Cancel Edit
                    </Button>
                  )}
                  <Button type="submit" className="w-auto px-8" disabled={loading}>
                    {loading ? 'Saving...' : (editId ? 'Update Record' : 'Save Record')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-card h-full flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-primary" />
                <CardTitle className="text-lg">Quick Insights</CardTitle>
              </div>
              <CardDescription>Live database overview.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Total Enrolled</p>
                  <p className="text-2xl font-bold tracking-tight tabular-nums">{totalStudents.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <School className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Colleges Tracked</p>
                  <p className="text-2xl font-bold tracking-tight tabular-nums">{uniqueColleges}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Total Records</p>
                  <p className="text-2xl font-bold tracking-tight tabular-nums">{totalRecords}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Database className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-lg">Database Records</CardTitle>
              </div>
              <CardDescription>Historical student enrollments.</CardDescription>
            </div>
            <div className="text-xs font-medium px-2 py-1 bg-secondary rounded text-secondary-foreground">
              {enrollments.length} Records
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>College Name</TableHead>
                    <TableHead>City Name</TableHead>
                    <TableHead>Class Name</TableHead>
                    <TableHead className="text-right">Enrollment</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        No historical data. Start by adding a record (e.g., A levels, Superior College).
                      </TableCell>
                    </TableRow>
                  ) : (
                    enrollments.map((record) => (
                      <TableRow key={record.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium">{record.year} - {record.year + 1}</TableCell>
                        <TableCell className="truncate max-w-[120px]">{record.college_name}</TableCell>
                        <TableCell className="truncate max-w-[100px]">{record.city_name}</TableCell>
                        <TableCell className="truncate max-w-[120px]">{record.class_name}</TableCell>
                        <TableCell className="text-right tabular-nums font-semibold">{record.total_enrolled.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                              onClick={() => handleEdit(record)}
                              title="Edit record"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(record.id)}
                              title="Delete record"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader className="flex flex-col items-center text-center pt-4">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <DialogTitle className="text-xl">Delete Record</DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete this record? This action cannot be undone and will remove the data permanently from the database.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              className="w-full sm:w-auto"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              className="w-full sm:w-auto gap-2"
              disabled={loading}
            >
              {loading ? 'Deleting...' : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete Record
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
