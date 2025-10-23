import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Patient {
  id: string;
  users: {
    name: string;
    email: string;
  };
}

interface PatientMultiSelectProps {
  patients: Patient[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function PatientMultiSelect({ patients, selected, onChange }: PatientMultiSelectProps) {
  const [open, setOpen] = useState(false);

  const togglePatient = (patientId: string) => {
    const isSelected = selected.includes(patientId);
    if (isSelected) {
      onChange(selected.filter(id => id !== patientId));
    } else {
      onChange([...selected, patientId]);
    }
  };

  const toggleAll = () => {
    if (selected.length === 0) {
      onChange(patients.map(p => p.id));
    } else {
      onChange([]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[300px] justify-between"
        >
          {selected.length === 0
            ? "All Patients"
            : `${selected.length} patient${selected.length !== 1 ? 's' : ''} selected`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Search patients..." />
          <CommandEmpty>No patient found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            <CommandItem onSelect={toggleAll}>
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  selected.length === 0 || selected.length === patients.length
                    ? "opacity-100"
                    : "opacity-0"
                )}
              />
              {selected.length === patients.length ? "Deselect All" : "Select All"}
            </CommandItem>
            {patients.map((patient) => (
              <CommandItem
                key={patient.id}
                onSelect={() => togglePatient(patient.id)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selected.includes(patient.id) ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col">
                  <span>{patient.users?.name || 'Unknown'}</span>
                  <span className="text-xs text-muted-foreground">
                    {patient.users?.email}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
