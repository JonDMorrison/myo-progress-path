import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExportButton } from "@/components/admin/ExportButton";
import { Shield, Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MasterPatientTable } from "@/components/admin/MasterPatientTable";
import { fetchMasterPatientList, fetchAllClinics, type MasterPatientFilters } from "@/lib/masterAdmin";
import { exportPatientsToCSV } from "@/lib/exportCSV";
import { toast } from "sonner";
import { AdminLayout } from "@/components/layout/AdminLayout";

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
    weekNumber: undefined,
    minCompletion: undefined,
    maxCompletion: undefined,
    startDate: undefined,
    endDate: undefined,
    page: 1,
    pageSize: 50
  });

  const { isAuthReady: isReady, user: authUser, isSuperAdmin } = useAuth();

  useEffect(() => {
    if (!isReady) return;
    if (!authUser || !isSuperAdmin) {
      if (isReady && authUser && !isSuperAdmin) {
        toast.error('Access denied. Super admin privileges required.');
        navigate('/therapist');
      }
      setLoading(false);
      return;
    }
    setIsAuthorized(true);
    loadData();
  }, [isReady, authUser?.id, isSuperAdmin]);

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

  useEffect(() => {
    if (isAuthorized) {
      loadData();
    }
  }, [filters, isAuthorized]);

  const handleExportCSV = () => {
    try {
      toast.info('Preparing export...');
      exportPatientsToCSV(patients);
      toast.success('Export complete');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      clinicId: undefined,
      patientStatus: undefined,
      weekStatus: undefined,
      weekNumber: undefined,
      minCompletion: undefined,
      maxCompletion: undefined,
      startDate: undefined,
      endDate: undefined,
      page: 1,
      pageSize: 50
    });
  };

  const avgCompletion = patients.length > 0
    ? Math.round(
        patients
          .filter(p => p.adherence_14d !== null)
          .reduce((sum, p) => sum + (p.adherence_14d || 0), 0) /
        patients.filter(p => p.adherence_14d !== null).length
      )
    : 0;

  if (!isAuthorized) {
    return null;
  }

  return (
    <AdminLayout title="Master Dashboard" description="View and manage all patients across the platform">
      <div className="space-y-6">
        {/* Security Banner */}
        <Alert className="border-primary">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Master Admin Access:</strong> You are viewing platform-wide data across all clinics.
          </AlertDescription>
        </Alert>

        {/* Filters */}
        <div className="space-y-4">
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

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              value={filters.weekNumber?.toString()}
              onValueChange={(value) => setFilters({ ...filters, weekNumber: value === 'all' ? undefined : parseInt(value), page: 1 })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Weeks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Weeks</SelectItem>
                {Array.from({ length: 24 }, (_, i) => i + 1).map((week) => (
                  <SelectItem key={week} value={week.toString()}>
                    Week {week}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min %"
                min="0"
                max="100"
                value={filters.minCompletion ?? ''}
                onChange={(e) => setFilters({ ...filters, minCompletion: e.target.value ? parseInt(e.target.value) : undefined, page: 1 })}
                className="w-24"
              />
              <Input
                type="number"
                placeholder="Max %"
                min="0"
                max="100"
                value={filters.maxCompletion ?? ''}
                onChange={(e) => setFilters({ ...filters, maxCompletion: e.target.value ? parseInt(e.target.value) : undefined, page: 1 })}
                className="w-24"
              />
            </div>

            <Input
              type="date"
              placeholder="From Date"
              value={filters.startDate ?? ''}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value || undefined, page: 1 })}
            />

            <Input
              type="date"
              placeholder="To Date"
              value={filters.endDate ?? ''}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value || undefined, page: 1 })}
            />
          </div>

          {/* Clear Filters Button */}
          {(filters.search || filters.clinicId || filters.patientStatus || filters.weekStatus || filters.weekNumber || filters.minCompletion || filters.maxCompletion || filters.startDate || filters.endDate) && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div>
              <div className="text-2xl font-bold">{avgCompletion}%</div>
              <div className="text-sm text-muted-foreground">Avg Completion</div>
            </div>
          </div>
        </div>

        {/* Table Actions */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Patient List</h2>
          <ExportButton onExport={handleExportCSV} />
        </div>
        {loading ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        ) : (
          <MasterPatientTable patients={patients} onExport={handleExportCSV} onRefresh={loadData} />
        )}
      </div>
    </AdminLayout>
  );
};

export default MasterAdmin;
