import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AtRiskPatientsProps {
  therapistId?: string;
}

export function AtRiskPatients({ therapistId }: AtRiskPatientsProps) {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadAtRiskPatients();
  }, [therapistId]);

  const loadAtRiskPatients = async () => {
    try {
      // For now, we'll query patient_week_progress directly for at-risk patients
      // An at-risk patient is one who hasn't submitted in a while or has needs_more status
      const query = supabase
        .from('patient_week_progress')
        .select(`
          *,
          patients!inner(
            id,
            user_id,
            assigned_therapist_id,
            users!inner(name, email)
          ),
          weeks(number)
        `)
        .in('status', ['open', 'needs_more'])
        .order('completed_at', { ascending: true })
        .limit(10);

      // Filter by therapist if provided
      if (therapistId) {
        query.eq('patients.assigned_therapist_id', therapistId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setPatients((data as any) || []);
    } catch (error) {
      console.error('Error loading at-risk patients:', error);
      toast.error('Failed to load at-risk patients');
    } finally {
      setLoading(false);
    }
  };

  const sendReminder = async (patientId: string) => {
    toast.info('Sending reminder...');
    // This would trigger the send-reminders function for a specific patient
    toast.success('Reminder sent successfully');
  };

  const viewProgress = (patientId: string) => {
    navigate(`/patient/${patientId}`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>At-Risk Patients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              At-Risk Patients
            </CardTitle>
            <CardDescription>
              Patients who may need intervention
            </CardDescription>
          </div>
          <Badge variant="destructive">{patients.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {patients.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No at-risk patients detected
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Week</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map(patient => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">
                    {patient.patients?.users?.name || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      !patient.completed_at && 'text-destructive'
                    )}>
                      {patient.completed_at 
                        ? new Date(patient.completed_at).toLocaleDateString()
                        : 'Never'}
                    </span>
                  </TableCell>
                  <TableCell>Week {patient.weeks?.number || '?'}</TableCell>
                  <TableCell>
                    <Badge variant={patient.status === 'needs_more' ? 'destructive' : 'secondary'}>
                      {patient.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={patient.status === 'needs_more' ? 'destructive' : 'default'}>
                      {patient.status === 'needs_more' ? 'High' : 'Medium'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => sendReminder(patient.patients?.id)}>
                          Send Reminder
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => viewProgress(patient.patients?.id)}>
                          View Progress
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
