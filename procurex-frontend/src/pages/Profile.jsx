import { UserRound, Mail, Shield } from "lucide-react";
import Card from "../components/common/Card";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useAuth } from "../context/useAuth";

export default function Profile() {
  const { user, initializing } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-950">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Your account details.</p>
      </div>

      {initializing || !user ? (
        <Card>
          <LoadingSpinner label="Loading profile…" />
        </Card>
      ) : (
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-700 text-xl font-semibold text-white">
              {(user.full_name || user.email || "U").slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-brand-950">
                {user.full_name || "Unnamed user"}
              </h2>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-1 gap-5 border-t border-slate-100 pt-6 sm:grid-cols-2">
            <DetailItem icon={UserRound} label="Full name" value={user.full_name} />
            <DetailItem icon={Mail} label="Email" value={user.email} />
            <DetailItem icon={Shield} label="Role" value={user.role} />
            <DetailItem icon={Shield} label="User ID" value={user.id} />
          </dl>
        </Card>
      )}
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
        <Icon size={15} />
      </div>
      <div className="min-w-0">
        <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
        <dd className="mt-0.5 text-sm text-brand-950">{value || "—"}</dd>
      </div>
    </div>
  );
}
