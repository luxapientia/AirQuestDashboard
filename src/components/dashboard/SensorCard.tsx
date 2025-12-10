import { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface SensorCardProps {
  title: string;
  value: number;
  unit: string;
  icon: LucideIcon;
  min: number;
  max: number;
  color: "primary" | "secondary" | "success" | "warning" | "destructive";
  index: number;
}

const colorClasses = {
  primary: {
    bg: "bg-primary/20",
    text: "text-primary",
    bar: "bg-primary",
    glow: "shadow-[0_0_20px_hsl(var(--primary)/0.3)]",
  },
  secondary: {
    bg: "bg-secondary/20",
    text: "text-secondary",
    bar: "bg-secondary",
    glow: "shadow-[0_0_20px_hsl(var(--secondary)/0.3)]",
  },
  success: {
    bg: "bg-success/20",
    text: "text-success",
    bar: "bg-success",
    glow: "shadow-[0_0_20px_hsl(var(--success)/0.3)]",
  },
  warning: {
    bg: "bg-warning/20",
    text: "text-warning",
    bar: "bg-warning",
    glow: "shadow-[0_0_20px_hsl(var(--warning)/0.3)]",
  },
  destructive: {
    bg: "bg-destructive/20",
    text: "text-destructive",
    bar: "bg-destructive",
    glow: "shadow-[0_0_20px_hsl(var(--destructive)/0.3)]",
  },
};

const SensorCard = ({ title, value, unit, icon: Icon, min, max, color, index }: SensorCardProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const percentage = ((value - min) / (max - min)) * 100;
  const colors = colorClasses[color];

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div 
      className="glass-card-hover p-5 opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${0.3 + index * 0.1}s` }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
        <div>
          <h3 className="font-medium text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">Real-time</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <span className={`text-4xl font-bold tracking-tight ${colors.text}`}>
            {displayValue.toFixed(1)}
          </span>
          <span className="text-lg text-muted-foreground">{unit}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 rounded-full bg-muted/50 overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${colors.bar} ${colors.glow} transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
};

export default SensorCard;
