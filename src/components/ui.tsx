import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export function Button({ className = "", variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }) {
  const styles = {
    primary: "bg-teal-700 text-white hover:bg-teal-800",
    ghost: "border border-stone-300 hover:bg-stone-100",
    danger: "text-red-700 hover:bg-red-50",
  }[variant];
  return <button className={`rounded-md px-3 py-2 text-sm font-medium disabled:opacity-50 ${styles} ${className}`} {...props} />;
}

export function Input({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-stone-700">{label}</span>
      <input className="w-full rounded-md border border-stone-300 px-3 py-2 focus:border-teal-700 focus:outline-none" {...props} />
    </label>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-lg border border-stone-200 bg-white p-5 ${className}`}>{children}</div>;
}

export function ErrorText({ children }: { children: ReactNode }) {
  return children ? <p className="text-sm text-red-700">{children}</p> : null;
}
