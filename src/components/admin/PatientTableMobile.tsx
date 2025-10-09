import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PatientRow {
  id: string;
  name: string;
  email: string;
  week: number;
  progress: number;
  status: string;
}

interface PatientTableMobileProps {
  rows: PatientRow[];
  onOpenPatient: (id: string) => void;
}

export function PatientTableMobile({ rows, onOpenPatient }: PatientTableMobileProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:hidden">
      {rows.map((row) => (
        <Card key={row.id} className="rounded-2xl border hover:shadow-md transition-shadow">
          <CardContent className="p-4 space-y-3">
            <div>
              <div className="font-medium text-base">{row.name}</div>
              <div className="text-sm text-muted-foreground">{row.email}</div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Week {row.week}</span>
              <span className="font-medium">{row.progress}%</span>
            </div>
            
            <div className="flex items-center justify-between gap-2">
              <Badge variant="outline" className="capitalize">
                {row.status}
              </Badge>
              <Button 
                size="sm" 
                onClick={() => onOpenPatient(row.id)}
                className="h-9"
              >
                Open
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
