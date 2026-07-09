import { motion } from "framer-motion";

export default function StatCard({ title, value, icon: Icon, subtitle, color = "brand" }) {
  const colorMap = {
    brand:  { bg: "bg-brand-50 dark:bg-brand-900/20",  icon: "text-brand-600 dark:text-brand-400" },
    green:  { bg: "bg-green-50 dark:bg-green-900/20",   icon: "text-green-600 dark:text-green-400" },
    amber:  { bg: "bg-amber-50 dark:bg-amber-900/20",   icon: "text-amber-600 dark:text-amber-400" },
    violet: { bg: "bg-violet-50 dark:bg-violet-900/20", icon: "text-violet-600 dark:text-violet-400" },
    red:    { bg: "bg-red-50 dark:bg-red-900/20",       icon: "text-red-600 dark:text-red-400" },
    slate:  { bg: "bg-slate-100 dark:bg-slate-800",     icon: "text-slate-600 dark:text-slate-400" },
  };

  const c = colorMap[color] || colorMap.brand;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5 flex items-start gap-4"
    >
      {Icon && (
        <div className={`p-2.5 rounded-lg ${c.bg} flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5 tabular-nums">
          {value ?? "—"}
        </p>
        {subtitle && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}
