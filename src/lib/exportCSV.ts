import { MasterPatientListItem } from "./masterAdmin";

/**
 * Convert master patient list to CSV format
 */
export function patientListToCSV(patients: MasterPatientListItem[]): string {
  if (!patients || patients.length === 0) {
    return 'No patients found';
  }

  const headers = [
    'Patient Name',
    'Patient Email',
    'Clinic',
    'Therapist Name',
    'Therapist Email',
    'Status',
    'Program Variant',
    'Current Week',
    'Week Status',
    'Adherence %',
    'Last Activity',
    'Enrolled Date'
  ];

  const rows = patients.map(patient => [
    patient.patient_name || '',
    patient.patient_email || '',
    patient.clinic_name || '',
    patient.therapist_name || 'Unassigned',
    patient.therapist_email || '',
    patient.patient_status || '',
    patient.program_variant || '',
    patient.current_week_number?.toString() || '',
    patient.current_week_status || '',
    patient.adherence_14d !== null ? patient.adherence_14d.toString() : '',
    patient.last_activity ? new Date(patient.last_activity).toLocaleString() : '',
    patient.enrolled_at ? new Date(patient.enrolled_at).toLocaleString() : ''
  ]);

  // Escape CSV values
  const escapeCSV = (value: string): string => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.map(escapeCSV).join(','))
  ].join('\n');

  return csvContent;
}

/**
 * Download CSV file
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Export patient list to CSV and trigger download
 */
export function exportPatientsToCSV(patients: MasterPatientListItem[]): void {
  const csvContent = patientListToCSV(patients);
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `patient-list-${timestamp}.csv`;
  downloadCSV(csvContent, filename);
}
