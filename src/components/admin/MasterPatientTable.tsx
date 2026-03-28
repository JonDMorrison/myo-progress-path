import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Eye, Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MasterPatientListItem } from "@/lib/masterAdmin";
import { TherapistAssignmentSelect } from "./TherapistAssignmentSelect";
import { toast } from "sonner";

interface MasterPatientTableProps {
  patients: MasterPatientListItem[];
  onExport?: () => void;
  onRefresh?: () => void;
}

export const MasterPatientTable = ({ patients, onExport, onRefresh }: MasterPatientTableProps) => {
  const [videoFlags, setVideoFlags] = useState<Record<string, boolean>>({});
  const [pathways, setPathways] = useState<Record<string, string>>({});

  // Load requires_video and program_variant for all patients
  useEffect(() => {
    const ids = patients.map(p => p.patient_id);
    if (ids.length === 0) return;
    supabase
      .from('patients')
      .select('id, requires_video, program_variant')
      .in('id', ids)
      .then(({ data }) => {
        const flags: Record<string, boolean> = {};
        const variants: Record<string, string> = {};
        data?.forEach(p => {
          flags[p.id] = p.requires_video !== false;
          variants[p.id] = p.program_variant || 'frenectomy';
        });
        setVideoFlags(flags);
        setPathways(variants);
      });
  }, [patients]);

  const handleToggleVideo = async (patientId: string, value: boolean) => {
    const { error } = await supabase
      .from('patients')
      .update({ requires_video: value } as any)
      .eq('id', patientId);
    if (error) {
      toast.error('Could not update setting');
    } else {
      setVideoFlags(prev => ({ ...prev, [patientId]: value }));
      toast.success(value ? 'Video submissions enabled' : 'Video submissions disabled');
    }
  };

  const handleChangePathway = async (patientId: string, variant: string) => {
    const { error } = await supabase
      .from('patients')
      .update({ program_variant: variant } as any)
      .eq('id', patientId);
    if (error) {
      toast.error('Could not update pathway');
    } else {
      setPathways(prev => ({ ...prev, [patientId]: variant }));
      toast.success('Pathway updated');
      onRefresh?.();
    }
  };

  const getStatusColor = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case 'completed': return 'secondary';
      case 'inactive': return 'destructive';
      default: return 'default';
    }
  };

  const getWeekStatusColor = (status: string | null): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'approved': return 'default';
      case 'submitted': return 'outline';
      case 'needs_more': return 'destructive';
      case 'locked': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Showing {patients.length} patients
        </p>
        {onExport && (
          <Button onClick={onExport} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Clinic</TableHead>
              <TableHead>Therapist</TableHead>
              <TableHead>Pathway</TableHead>
              <TableHead>Current Week</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead>Adherence</TableHead>
              <TableHead>Video</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                  No patients found
                </TableCell>
              </TableRow>
            ) : (
              patients.map((patient) => (
                <TableRow key={patient.patient_id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{patient.patient_name}</div>
                      <div className="text-sm text-muted-foreground">{patient.patient_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{patient.clinic_name}</TableCell>
                  <TableCell>
                    <TherapistAssignmentSelect
                      patientId={patient.patient_id}
                      currentTherapistId={patient.therapist_id}
                      currentTherapistName={patient.therapist_name}
                      onAssigned={onRefresh}
                    />
                  </TableCell>
                  <TableCell>
                    <select
                      value={pathways[patient.patient_id] || patient.program_variant || 'frenectomy'}
                      onChange={(e) => handleChangePathway(patient.patient_id, e.target.value)}
                      className="text-xs border rounded px-2 py-1 bg-background"
                    >
                      <option value="frenectomy">Frenectomy</option>
                      <option value="frenectomy_video">Frenectomy + Video</option>
                      <option value="non_frenectomy">Non-Frenectomy</option>
                      <option value="non_frenectomy_video">Non-Fren + Video</option>
                      <option value="standard">Standard</option>
                    </select>
                  </TableCell>
                  <TableCell>
                    {patient.current_week_number ? (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Week {patient.current_week_number}</span>
                        {patient.current_week_status && (
                          <Badge variant={getWeekStatusColor(patient.current_week_status)} className="text-xs">
                            {patient.current_week_status}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {patient.last_activity ? (
                      <span className="text-sm">
                        {formatDistanceToNow(new Date(patient.last_activity), { addSuffix: true })}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">Never</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {patient.adherence_14d !== null ? (
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${patient.adherence_14d}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{patient.adherence_14d}%</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={videoFlags[patient.patient_id] ?? true}
                        onCheckedChange={(checked) => handleToggleVideo(patient.patient_id, checked)}
                      />
                      <span className="text-xs text-muted-foreground">
                        {videoFlags[patient.patient_id] !== false ? 'On' : 'Off'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(patient.patient_status)}>
                      {patient.patient_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/admin/patients/${patient.patient_id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {patients.length === 0 ? (
          <div className="text-center text-muted-foreground py-8 border rounded-lg">
            No patients found
          </div>
        ) : (
          patients.map((patient) => (
            <div key={patient.patient_id} className="border rounded-xl p-4 space-y-3 bg-card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">{patient.patient_name}</div>
                  <div className="text-sm text-muted-foreground">{patient.patient_email}</div>
                </div>
                <Badge variant={getStatusColor(patient.patient_status)}>
                  {patient.patient_status}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground font-medium">{patient.clinic_name}</span>
                <TherapistAssignmentSelect
                  patientId={patient.patient_id}
                  currentTherapistId={patient.therapist_id}
                  currentTherapistName={patient.therapist_name}
                  onAssigned={onRefresh}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Pathway</span>
                <select
                  value={pathways[patient.patient_id] || patient.program_variant || 'frenectomy'}
                  onChange={(e) => handleChangePathway(patient.patient_id, e.target.value)}
                  className="text-xs border rounded px-2 py-1 bg-background"
                >
                  <option value="frenectomy">Frenectomy</option>
                  <option value="frenectomy_video">Frenectomy + Video</option>
                  <option value="non_frenectomy">Non-Frenectomy</option>
                  <option value="non_frenectomy_video">Non-Fren + Video</option>
                  <option value="standard">Standard</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {patient.current_week_number ? (
                    <>
                      <span>Week {patient.current_week_number}</span>
                      {patient.current_week_status && (
                        <Badge variant={getWeekStatusColor(patient.current_week_status)} className="text-xs">
                          {patient.current_week_status}
                        </Badge>
                      )}
                    </>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
                {patient.adherence_14d !== null && (
                  <span className="font-medium">{patient.adherence_14d}%</span>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {patient.last_activity 
                    ? formatDistanceToNow(new Date(patient.last_activity), { addSuffix: true })
                    : 'Never active'}
                </span>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/admin/patients/${patient.patient_id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Link>
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};