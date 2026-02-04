import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface WeekIntroductionModalProps {
  open: boolean;
  weekNumber: number;
  introduction: string;
  onContinue: () => void;
}

const numberToWord = (num: number): string => {
  const words = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
                 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 
                 'Nineteen', 'Twenty', 'Twenty-One', 'Twenty-Two', 'Twenty-Three', 'Twenty-Four'];
  return words[num] || num.toString();
};

export function WeekIntroductionModal({ 
  open, 
  weekNumber, 
  introduction, 
  onContinue 
}: WeekIntroductionModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onContinue(); }}>
      <DialogContent 
        className="sm:max-w-[500px] rounded-2xl"
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <DialogTitle className="text-2xl">Part {numberToWord(weekNumber)}</DialogTitle>
          </div>
          <DialogDescription className="text-base leading-relaxed pt-4 text-foreground">
            {introduction}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-end mt-6">
          <Button onClick={onContinue} size="lg" className="rounded-xl">
            Get Started
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
