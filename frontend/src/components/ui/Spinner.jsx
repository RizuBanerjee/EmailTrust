export default function Spinner({ size = "md", className = "" }) {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-3",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size] || sizes.md} rounded-full border-slate-200 dark:border-slate-700 border-t-brand-600 dark:border-t-brand-400 animate-spin`}
      />
    </div>
  );
}
