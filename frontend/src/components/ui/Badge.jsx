export default function Badge({ children, variant = "default" }) {
  const variants = {
    default:  "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
    success:  "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    warning:  "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
    danger:   "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
    brand:    "bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400",
    info:     "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    active:   "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    inactive: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${variants[variant] || variants.default}`}>
      {children}
    </span>
  );
}
