import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StepCardProps {
  stepNumber: number;
  title: string;
  description: string;
}

export const StepCard = ({ stepNumber, title, description }: StepCardProps) => {
  return (
    <Card className="relative border-2">
      <div className="absolute -top-6 left-6 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
        {stepNumber}
      </div>
      <CardHeader className="pt-10">
        <CardTitle className="text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  );
};
