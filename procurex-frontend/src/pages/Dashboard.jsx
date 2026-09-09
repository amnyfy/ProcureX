import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, FileText, PlusCircle, ArrowRight, Clock } from "lucide-react";
import Card, { CardHeader } from "../components/common/Card";
import Button from "../components/common/Button";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";
import EmptyState from "../components/common/EmptyState";
import StatusBadge from "../components/common/StatusBadge";
import { useAuth } from "../context/useAuth";
import { formatCurrency, formatDate } from "../utils/formatters";

import { listCompanies } from "../api/companies";
import { listTenders } from "../api/tenders";
import { getDashboardStats } from "../api/dashboard";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    async function fetchDashboardData() {
      setLoading(true);
      setError(null);
      try {
        const [compData, tendData, statsData] = await Promise.all([
          listCompanies().catch(() => []),
          listTenders().catch(() => []),
          getDashboardStats().catch(() => null),
        ]);

        if (active) {
          setCompanies(Array.isArray(compData) ? compData : compData?.items || []);
          setTenders(Array.isArray(tendData) ? tendData : tendData?.items || []);
          setStats(statsData);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Failed to load dashboard data.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchDashboardData();
    return () => {
      active = false;
    };
  }, []);

  const recentTenders = useMemo(() => {
    return [...tenders]
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 5);
  }, [tenders]);

  const greetName = user?.full_name?.split(" ")[0] || user?.email || "there";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-950">Welcome back, {greetName} 👋</h1>
        <p className="mt-1 text-sm text-slate-500">
          Here&apos;s what&apos;s happening across your procurement pipeline today.
        </p>
      </div>

      <ErrorMessage message={error} onDismiss={() => setError(null)} />

      {loading ? (
        <Card>
          <LoadingSpinner label="Loading dashboard…" />
        </Card>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              icon={Building2}
              label="Companies"
              value={companies.length}
              onClick={() => navigate("/companies")}
            />
            <StatCard
              icon={FileText}
              label="Tenders"
              value={tenders.length}
              onClick={() => navigate("/tenders")}
            />
            <StatCard
              icon={Clock}
              label="Open Tenders"
              value={tenders.filter((t) => ["open", "published", "active"].includes(
                (t.status || "").toLowerCase()
              )).length}
              onClick={() => navigate("/tenders")}
            />
          </div>

          {/* Quick actions */}
          <Card>
            <CardHeader title="Quick actions" subtitle="Jump straight into common tasks" />
            <div className="flex flex-wrap gap-3">
              <Button icon={PlusCircle} onClick={() => navigate("/companies?create=1")}>
                Add company
              </Button>
              <Button
                icon={PlusCircle}
                variant="secondary"
                onClick={() => navigate("/tenders?create=1")}
              >
                Add tender
              </Button>
              <Button variant="ghost" icon={ArrowRight} onClick={() => navigate("/tenders")}>
                View all tenders
              </Button>
            </div>
          </Card>

          {/* Recent tenders */}
          <Card padded={false}>
            <div className="flex items-center justify-between px-5 pt-5 sm:px-6 sm:pt-6">
              <CardHeader title="Recent tenders" subtitle="The latest additions to your pipeline" />
              <button
                onClick={() => navigate("/tenders")}
                className="mb-4 flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
              >
                View all <ArrowRight size={14} />
              </button>
            </div>

            {recentTenders.length === 0 ? (
              <div className="px-6 pb-6">
                <EmptyState
                  icon={FileText}
                  title="No tenders yet"
                  description="Create your first tender to start tracking it here."
                  action={
                    <Button size="sm" icon={PlusCircle} onClick={() => navigate("/tenders?create=1")}>
                      Add tender
                    </Button>
                  }
                />
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentTenders.map((tender) => (
                  <li
                    key={tender.id}
                    onClick={() => navigate(`/tenders/${tender.id}`)}
                    className="flex cursor-pointer flex-col gap-2 px-5 py-4 transition hover:bg-brand-50/60 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-brand-950">
                        {tender.title || "Untitled tender"}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {tender.organization || "Unknown organization"}
                        {tender.deadline && ` · Due ${formatDate(tender.deadline)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 sm:shrink-0">
                      <span className="text-sm font-medium text-slate-600">
                        {formatCurrency(tender.estimated_value)}
                      </span>
                      <StatusBadge status={tender.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, onClick }) {
  return (
    <Card
      className="cursor-pointer transition hover:shadow-md"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-brand-950">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Icon size={22} />
        </div>
      </div>
    </Card>
  );
}
