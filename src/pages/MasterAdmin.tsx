import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Shield, Search, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MasterPatientTable } from "@/components/admin/MasterPatientTable";
import { fetchMasterPatientList, fetchAllClinics, type MasterPatientFilters } from "@/lib/masterAdmin";
import { toast } from "sonner";

const MasterAdmin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [clinics, setClinics] = useState<{ id: string; name: string }[]>([]);
  
  const [filters, setFilters] = useState<MasterPatientFilters>({
    search: '',
    clinicId: undefined,
    patientStatus: undefined,
    weekStatus: undefined,
    page: 1,
    pageSize: 50
  });

  // Check authorization
  useEffect(() => {
    checkAuthorization();
  }, []);

  const checkAuthorization = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      // Check if user is super_admin
      const { data: userData, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || userData?.role !== 'super_admin') {
        toast.error('Access denied. Super admin privileges required.');
        navigate('/dashboard');
        return;
      }

      setIsAuthorized(true);
      await loadData();
    } catch (error) {
      console.error('Authorization error:', error);
      navigate('/dashboard');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [patientResult, clinicResult] = await Promise.all([
        fetchMasterPatientList(filters),
        fetchAllClinics()
      ]);

      if (patientResult.error) {
        toast.error('Failed to load patients');
        console.error(patientResult.error);
      } else {
        setPatients(patientResult.data);
        setTotalCount(patientResult.count);
      }

      if (clinicResult.error) {
        console.error('Failed to load clinics:', clinicResult.error);
      } else {
        setClinics(clinicResult.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Reload data when filters change
  useEffect(() => {
    if (isAuthorized) {
      loadData();
    }
  }, [filters, isAuthorized]);

  const handleExportCSV = async () => {
    try {
      toast.info('Preparing export...');
      const { data, error } = await supabase.functions.invoke('export-master-patients', {
        body: filters
      });

      if (error) throw error;

      // Create download link
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `master-patients-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Export complete');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Master Admin - MyoCoach</title>
      </Helmet>

      <div className="container mx-auto py-8 space-y-6">
        {/* Security Banner */}
        <Alert className="border-primary">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Master Admin Access:</strong> You are viewing platform-wide data across all clinics.
          </AlertDescription>
        </Alert>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Master Admin Dashboard</h1>
          <p className="text-muted-foreground">View and manage all patients across the platform</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="pl-9"
            />
          </div>

          <Select
            value={filters.clinicId}
            onValueChange={(value) => setFilters({ ...filters, clinicId: value === 'all' ? undefined : value, page: 1 })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Clinics" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clinics</SelectItem>
              {clinics.map((clinic) => (
                <SelectItem key={clinic.id} value={clinic.id}>
                  {clinic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.patientStatus}
            onValueChange={(value) => setFilters({ ...filters, patientStatus: value === 'all' ? undefined : value, page: 1 })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.weekStatus}
            onValueChange={(value) => setFilters({ ...filters, weekStatus: value === 'all' ? undefined : value, page: 1 })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Week Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Week Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="needs_more">Needs More</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold">{totalCount}</div>
              <div className="text-sm text-muted-foreground">Total Patients</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{clinics.length}</div>
              <div className="text-sm text-muted-foreground">Total Clinics</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {patients.filter(p => p.patient_status === 'active').length}
              </div>
              <div className="text-sm text-muted-foreground">Active Patients</div>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        ) : (
          <MasterPatientTable patients={patients} onExport={handleExportCSV} />
        )}
      </div>
    </>
  );
};

export default MasterAdmin;