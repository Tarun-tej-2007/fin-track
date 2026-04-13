import React from 'react';
import { Loader2 } from 'lucide-react';

// ─── Button ────────────────────────────────────────────────────────────
export const Button = ({ children, variant = 'primary', size = 'md', loading, className = '', ...props }) => {
  const variants = {
    primary: 'bg-violet-600 hover:bg-violet-500 text-white border border-violet-500/30',
    secondary: 'bg-[#1e1e2a] hover:bg-[#252535] border border-[#2a2a38] text-[#f1f0ff]',
    danger: 'bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400',
    ghost: 'hover:bg-[#1e1e2a] text-[#a09db5] hover:text-[#f1f0ff]',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-4 py-2.5 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl',
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  );
};

// ─── Input ─────────────────────────────────────────────────────────────
export const Input = ({ label, error, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="label">{label}</label>}
    <input
      className={`input ${error ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20' : ''} ${className}`}
      {...props}
    />
    {error && <p className="mt-1.5 text-xs text-rose-400">{error}</p>}
  </div>
);

// ─── Select ────────────────────────────────────────────────────────────
export const Select = ({ label, error, children, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="label">{label}</label>}
    <select
      className={`input appearance-none cursor-pointer ${error ? 'border-rose-500/50' : ''} ${className}`}
      {...props}
    >
      {children}
    </select>
    {error && <p className="mt-1.5 text-xs text-rose-400">{error}</p>}
  </div>
);

// ─── Card ──────────────────────────────────────────────────────────────
export const Card = ({ children, className = '', ...props }) => (
  <div className={`card p-6 ${className}`} {...props}>
    {children}
  </div>
);

// ─── Modal ─────────────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#16161f] border border-[#2a2a38] rounded-2xl w-full max-w-md shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a38]">
          <h2 className="text-base font-semibold text-[#f1f0ff]">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#6b6880] hover:text-[#f1f0ff] hover:bg-[#1e1e2a] transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

// ─── Alert ─────────────────────────────────────────────────────────────
export const Alert = ({ type = 'error', message }) => {
  if (!message) return null;
  const styles = {
    error: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  };
  return (
    <div className={`border rounded-xl px-4 py-3 text-sm ${styles[type]}`}>
      {message}
    </div>
  );
};

// ─── Spinner ───────────────────────────────────────────────────────────
export const Spinner = ({ size = 20 }) => (
  <Loader2 size={size} className="animate-spin text-violet-400" />
);

// ─── Empty State ───────────────────────────────────────────────────────
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    {Icon && (
      <div className="w-14 h-14 rounded-2xl bg-[#1e1e2a] border border-[#2a2a38] flex items-center justify-center mb-4">
        <Icon size={24} className="text-[#6b6880]" />
      </div>
    )}
    <h3 className="text-base font-semibold text-[#f1f0ff] mb-1">{title}</h3>
    {description && <p className="text-sm text-[#6b6880] max-w-xs mb-4">{description}</p>}
    {action}
  </div>
);

// ─── Stat Card ─────────────────────────────────────────────────────────
export const StatCard = ({ label, value, icon: Icon, color = 'violet', sub }) => {
  const colors = {
    violet: 'from-violet-500/20 to-purple-500/10 border-violet-500/20 text-violet-400',
    emerald: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/20 text-emerald-400',
    rose: 'from-rose-500/20 to-pink-500/10 border-rose-500/20 text-rose-400',
    amber: 'from-amber-500/20 to-orange-500/10 border-amber-500/20 text-amber-400',
  };
  return (
    <div className={`card p-5 bg-gradient-to-br ${colors[color]} animate-fade-in`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-[#a09db5] uppercase tracking-wider">{label}</p>
        {Icon && <Icon size={18} className="opacity-70" />}
      </div>
      <p className="text-2xl font-bold text-[#f1f0ff] tracking-tight">{value}</p>
      {sub && <p className="text-xs text-[#6b6880] mt-1">{sub}</p>}
    </div>
  );
};
