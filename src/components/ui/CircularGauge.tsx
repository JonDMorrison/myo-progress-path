interface CircularGaugeProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  className?: string;
}

export function CircularGauge({
  value = 0,
  size = 96,
  strokeWidth = 8,
  label,
  className = "",
}: CircularGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = ((100 - value) / 100) * circumference;

  return (
    <div className={`inline-flex flex-col items-center gap-2 ${className}`}>
      <div className="relative">
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
          role="img"
          aria-label={`${label}: ${value}%`}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            className="fill-none stroke-muted opacity-20"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className="fill-none stroke-primary transition-all duration-500"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">{value}%</span>
        </div>
      </div>
      <div className="text-sm font-medium text-muted-foreground text-center">{label}</div>
    </div>
  );
}
