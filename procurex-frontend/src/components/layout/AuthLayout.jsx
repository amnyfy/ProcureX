import { Radar, ShieldCheck, TrendingUp, FileSearch } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-surface">
      {/* Brand / value proposition panel */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-brand-950 px-12 py-10 text-brand-50 lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700">
            <Radar size={18} className="text-white" />
          </div>
          <span className="font-display text-lg font-bold text-white">ProcureX</span>
        </div>

        <div className="max-w-md space-y-8">
          <h1 className="font-display text-3xl font-bold leading-tight text-white">
            AI-powered tender intelligence for modern procurement teams.
          </h1>
          <ul className="space-y-5">
            <li className="flex items-start gap-3">
              <FileSearch size={20} className="mt-0.5 shrink-0 text-brand-300" />
              <span className="text-sm text-brand-200">
                Centralize every tender, deadline, and organization in one workspace.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <TrendingUp size={20} className="mt-0.5 shrink-0 text-brand-300" />
              <span className="text-sm text-brand-200">
                Track estimated value and status across your entire pipeline.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck size={20} className="mt-0.5 shrink-0 text-brand-300" />
              <span className="text-sm text-brand-200">
                Secure, role-based access for your whole company.
              </span>
            </li>
          </ul>
        </div>

        <p className="text-xs text-brand-400">
          © {new Date().getFullYear()} ProcureX. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700">
            <Radar size={18} className="text-white" />
          </div>
          <span className="font-display text-lg font-bold text-brand-950">ProcureX</span>
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
