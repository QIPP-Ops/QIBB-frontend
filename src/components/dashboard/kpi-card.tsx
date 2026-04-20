import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isUp: boolean;
  };
  description?: string;
  className?: string;
  color?: "lilac" | "lime" | "purple" | "default";
}

export function KPICard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  description,
  className,
  color = "default"
}: KPICardProps) {
  const colorMap = {
    lilac: "border-brand-lilac/30 bg-brand-lilac/5 text-brand-lilac",
    lime: "border-brand-lime/30 bg-brand-lime/5 text-brand-lime",
    purple: "border-brand-purple/30 bg-brand-purple/5 text-white",
    default: "border-border bg-card text-card-foreground"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden p-6 rounded-2xl border transition-all hover:shadow-xl hover:shadow-brand-lilac/5 group",
        colorMap[color],
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          "p-2 rounded-xl bg-white/10 ring-1 ring-white/20 transition-transform group-hover:scale-110",
        )}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={cn(
            "text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1",
            trend.isUp ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
          )}>
            {trend.isUp ? "↑" : "↓"} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-sm font-medium opacity-70 mb-1">{title}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold tracking-tight">{value}</span>
          {unit && <span className="text-sm font-medium opacity-50">{unit}</span>}
        </div>
        {description && (
          <p className="mt-2 text-xs opacity-60 line-clamp-1">{description}</p>
        )}
      </div>

      <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
        <Icon size={120} />
      </div>
    </motion.div>
  );
}
