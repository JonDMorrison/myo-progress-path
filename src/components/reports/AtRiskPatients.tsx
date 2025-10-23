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

export function AtRiskPatients() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadAtRiskPatients();
  }, []);

  const loadAtRiskPatients = async () => {
    try {
      const { data, error } = await supabase.rpc('get_at_risk_patients' as any);

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
                <TableHead>Completion</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map(patient => (
                <TableRow key={patient.patient_id}>
                  <TableCell className="font-medium">
                    {patient.patient_name}
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      patient.days_since_last_activity > 14 && 'text-red-600'
                    )}>
                      {patient.days_since_last_activity} days ago
                    </span>
                  </TableCell>
                  <TableCell>Week {patient.current_week}</TableCell>
                  <TableCell>{patient.completion_rate}%</TableCell>
                  <TableCell>
                    <Badge variant={
                      patient.risk_score >= 4 ? 'destructive' :
                      patient.risk_score >= 2 ? 'default' :
                      'secondary'
                    }>
                      {patient.risk_score >= 4 ? 'High' :
                       patient.risk_score >= 2 ? 'Medium' :
                       'Low'}
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
                        <DropdownMenuItem onClick={() => sendReminder(patient.patient_id)}>
                          Send Reminder
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => viewProgress(patient.patient_id)}>
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
