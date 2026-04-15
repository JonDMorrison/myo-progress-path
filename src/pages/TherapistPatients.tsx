import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { TherapistLayout } from '@/components/layout/TherapistLayout';

export default function TherapistPatients() {
  const [patients, setPatients] = useState<any[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;

      if (session?.user) {
        loadPatients(session.user.id);
      } else {
        // Wait for session to restore
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, newSession) => {
            if (newSession?.user && !cancelled) {
              subscription.unsubscribe();
              loadPatients(newSession.user.id);
            }
          }
        );
        // Safety timeout
        const timer = setTimeout(() => {
          subscription.unsubscribe();
          if (!cancelled) setLoading(false);
        }, 10000);
        return () => clearTimeout(timer);
      }
    };

    init();
    return () => { cancelled = true; };
  }, []);

  const loadPatients = async (_userId?: string) => {
    try {
      const { data } = await supabase
        .from('v_master_patient_list')
        .select('*')
        .order('last_activity', { ascending: false });

      setPatients(data || []);
      setFilteredPatients(data || []);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    let filtered = [...patients];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.patient_email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.patient_status === statusFilter);
    }

    setFilteredPatients(filtered);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: 'default',
      inactive: 'secondary',
      completed: 'outline',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getWeekStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      open: 'secondary',
      submitted: 'default',
      approved: 'outline',
      needs_more: 'destructive',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status.replace('_', ' ')}</Badge>;
  };

  if (loading) {
    return (
      <TherapistLayout title="Patients" description="Manage and view patient progress">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-12 h-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading patients...</p>
          </div>
        </div>
      </TherapistLayout>
    );
  }

  return (
    <TherapistLayout title="Patients" description="Manage and view patient progress">
      <div className="space-y-6">

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Patients Table - Desktop */}
        <Card className="hidden sm:block">
          <CardHeader>
            <CardTitle>Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Current Module</TableHead>
                    <TableHead>Module Status</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Adherence (14d)</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No patients found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPatients.map(patient => (
                      <TableRow
                        key={patient.patient_id}
                        className="cursor-pointer hover:bg-slate-50"
                        onClick={(e) => {
                          if ((e.target as HTMLElement).closest('button')) return;
                          const weekNum = patient.current_week_number || 1;
                          navigate(`/therapist/patient/${patient.patient_id}`);
                        }}
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium">{patient.patient_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {patient.patient_email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(patient.patient_status)}</TableCell>
                        <TableCell>Module {Math.ceil((patient.current_week_number || 1) / 2)}</TableCell>
                        <TableCell>
                          {patient.current_week_status
                            ? getWeekStatusBadge(patient.current_week_status)
                            : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          {patient.last_activity ? (
                            <span className="text-sm">
                              {formatDistanceToNow(new Date(patient.last_activity), {
                                addSuffix: true,
                              })}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Never</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {patient.adherence_14d !== null ? (
                            <span className="font-medium">
                              {Math.round(patient.adherence_14d)}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const weekNum = patient.current_week_number || 1;
                              navigate(`/therapist/patient/${patient.patient_id}`);
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Patients Cards - Mobile */}
        <div className="grid grid-cols-1 gap-3 sm:hidden">
          {filteredPatients.length === 0 ? (
            <Card className="rounded-2xl">
              <CardContent className="p-6 text-center text-muted-foreground">
                No patients found
              </CardContent>
            </Card>
          ) : (
            filteredPatients.map(patient => (
              <Card
                key={patient.patient_id}
                className="rounded-2xl border hover:shadow-md transition-shadow cursor-pointer hover:bg-slate-50"
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('button')) return;
                  const weekNum = patient.current_week_number || 1;
                  navigate(`/therapist/patient/${patient.patient_id}`);
                }}
              >
                <CardContent className="p-4 space-y-3">
                  <div>
                    <div className="font-medium text-base">{patient.patient_name}</div>
                    <div className="text-sm text-muted-foreground">{patient.patient_email}</div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Module {Math.ceil((patient.current_week_number || 1) / 2)}</span>
                    {patient.current_week_status && getWeekStatusBadge(patient.current_week_status)}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {patient.last_activity 
                        ? formatDistanceToNow(new Date(patient.last_activity), { addSuffix: true })
                        : 'Never active'}
                    </span>
                    {patient.adherence_14d !== null && (
                      <span className="font-medium">{Math.round(patient.adherence_14d)}%</span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between gap-2">
                    {getStatusBadge(patient.patient_status)}
                    <Button 
                      size="sm" 
                      onClick={() => {
                        const weekNum = patient.current_week_number || 1;
                        navigate(`/therapist/patient/${patient.patient_id}`);
                      }}
                      className="h-9"
                    >
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </TherapistLayout>
  );
}
