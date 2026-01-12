import { Video, Check, X } from "lucide-react";

export const VideoGuideStep = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
          <Video className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Video Upload Guide</h2>
        <p className="text-lg text-muted-foreground">
          Your therapist may request video submissions as part of your biweekly check-ins
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="p-6 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Check className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-900 dark:text-green-100">Good Practices</h3>
          </div>
          <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
            <li>✓ Good lighting (natural light is best)</li>
            <li>✓ <strong>Full face, neck, and lower face visible</strong></li>
            <li>✓ <strong>Clear intraoral view when demonstrating exercises</strong></li>
            <li>✓ Stable camera position</li>
            <li>✓ Quiet environment</li>
            <li>✓ 30-60 seconds length</li>
          </ul>
        </div>

        <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <X className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-900 dark:text-red-100">Avoid</h3>
          </div>
          <ul className="space-y-2 text-sm text-red-800 dark:text-red-200">
            <li>✗ Too dark or backlit</li>
            <li>✗ Camera too far away</li>
            <li>✗ Shaky or moving camera</li>
            <li>✗ Background noise</li>
            <li>✗ Videos over 2 minutes</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 p-6 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-2">When Videos Are Required</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Your therapist will let you know when "first attempt" and "last attempt" videos are needed to track your progress with new exercises.
        </p>
        <p className="text-sm text-muted-foreground">
          <strong>Privacy Note:</strong> Your videos are only visible to your assigned therapist and are stored securely. They are never shared without your consent.
        </p>
      </div>
    </div>
  );
};
