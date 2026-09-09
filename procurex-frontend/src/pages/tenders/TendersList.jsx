import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FileText,
  PlusCircle,
  Pencil,
  Trash2,
  Eye,
  ExternalLink,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  Building,
  Landmark,
} from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Table from "../../components/common/Table";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import StatusBadge from "../../components/common/StatusBadge";
import TenderFormModal from "./TenderFormModal";
import { listTenders, deleteTender } from "../../api/tenders";
import {
  listGovernmentTenders,
  syncGovernmentTenders,
  getSyncStatus,
  addToMyOpportunities,
} from "../../api/governmentTenders";
import { formatCurrency, formatDate, isPastDeadline } from "../../utils/formatters";

export default function TendersList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab State: "all" | "my" | "government"
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "all");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const [tenders, setTenders] = useState([]);
  const [govTenders, setGovTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Government Tenders Filter & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGovCount, setTotalGovCount] = useState(0);

  // Feed Sync State
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Form & Modal States
  const [formOpen, setFormOpen] = useState(searchParams.get("create") === "1");
  const [editingTender, setEditingTender] = useState(null);
  const [deletingTender, setDeletingTender] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const fetchTenders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === "government") {
        const params = {
          page,
          page_size: 10,
          q: searchQuery || undefined,
          category: categoryFilter || undefined,
          location: locationFilter || undefined,
        };
        const res = await listGovernmentTenders(params);
        setGovTenders(res.items || []);
        setTotalPages(res.total_pages || 1);
        setTotalGovCount(res.total || 0);

        const statusRes = await getSyncStatus("CPPP").catch(() => null);
        setSyncStatus(statusRes);
      } else {
        const data = await listTenders();
        const items = Array.isArray(data) ? data : data?.items || [];
        if (activeTab === "my") {
          setTenders(items.filter((t) => !t.is_government_tender));
        } else {
          setTenders(items);
        }
      }
    } catch (err) {
      setError(err.message || "Failed to load tenders.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, searchQuery, categoryFilter, locationFilter]);

  useEffect(() => {
    fetchTenders();
  }, [fetchTenders]);

  async function handleTriggerSync() {
    setSyncing(true);
    setError(null);
    setActionSuccess(null);
    try {
      const res = await syncGovernmentTenders("CPPP");
      setActionSuccess(res.message || "Sync completed successfully.");
      fetchTenders();
    } catch (err) {
      setError(err.message || "Sync failed.");
    } finally {
      setSyncing(false);
    }
  }

  async function handleAddOpportunity(tenderId, e) {
    e.stopPropagation();
    setActionSuccess(null);
    try {
      const res = await addToMyOpportunities(tenderId);
      setActionSuccess(res.message);
      fetchTenders();
    } catch (err) {
      setError(err.message || "Failed to add opportunity.");
    }
  }

  function openCreateForm() {
    setEditingTender(null);
    setFormOpen(true);
  }

  function openEditForm(tender) {
    setEditingTender(tender);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingTender(null);
    if (searchParams.get("create")) {
      searchParams.delete("create");
      setSearchParams(searchParams, { replace: true });
    }
  }

  function handleSaved() {
    closeForm();
    fetchTenders();
  }

  async function handleDeleteConfirmed() {
    if (!deletingTender) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deleteTender(deletingTender.id);
      setDeletingTender(null);
      fetchTenders();
    } catch (err) {
      setDeleteError(err.message || "Failed to delete tender.");
    } finally {
      setDeleteLoading(false);
    }
  }

  const columns = [
    {
      key: "title",
      header: "Tender",
      render: (row) => (
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            {row.is_government_tender ? <Landmark size={16} /> : <FileText size={16} />}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="max-w-[260px] truncate font-semibold text-brand-950">
                {row.title || "Untitled tender"}
              </p>
              {row.is_government_tender && (
                <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                  CPPP Govt
                </span>
              )}
            </div>
            {row.reference_number && (
              <p className="truncate text-xs text-slate-400">Ref: {row.reference_number}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "organization",
      header: "Organization / Department",
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-slate-700">{row.organization || "—"}</p>
          {row.department && <p className="truncate text-[11px] text-slate-400">{row.department}</p>}
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (row) => row.category || "—",
    },
    {
      key: "estimated_value",
      header: "Est. Value",
      render: (row) => formatCurrency(row.estimated_value),
    },
    {
      key: "deadline",
      header: "Closing Date",
      render: (row) => (
        <span className={isPastDeadline(row.deadline || row.closing_date) ? "text-red-500 font-medium" : ""}>
          {formatDate(row.deadline || row.closing_date)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) => (
        <div className="flex justify-end items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <IconButton label="View Details" onClick={() => navigate(`/tenders/${row.id}`)} icon={Eye} />

          {row.source_url && (
            <a
              href={row.source_url}
              target="_blank"
              rel="noreferrer"
              title="View Official Government Portal"
              className="rounded-lg p-2 text-slate-400 hover:bg-brand-50 hover:text-brand-700 transition"
            >
              <ExternalLink size={16} />
            </a>
          )}

          {row.is_government_tender && !row.company_id && (
            <button
              onClick={(e) => handleAddOpportunity(row.id, e)}
              title="Add to My Opportunities"
              className="flex items-center gap-1 rounded-lg bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition"
            >
              <Plus size={14} /> Add
            </button>
          )}

          {!row.is_government_tender && (
            <>
              <IconButton label="Edit" onClick={() => openEditForm(row)} icon={Pencil} />
              <IconButton label="Delete" onClick={() => setDeletingTender(row)} icon={Trash2} danger />
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-950">Tender Opportunities</h1>
          <p className="mt-1 text-sm text-slate-500">
            Discover official government tenders & manage your procurement pipeline.
          </p>
        </div>
        <Button icon={PlusCircle} onClick={openCreateForm}>
          Add tender
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => {
            setActiveTab("all");
            setPage(1);
          }}
          className={`pb-3 px-4 text-sm font-semibold transition ${
            activeTab === "all"
              ? "border-b-2 border-brand-600 text-brand-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          All Tenders
        </button>
        <button
          onClick={() => {
            setActiveTab("my");
            setPage(1);
          }}
          className={`pb-3 px-4 text-sm font-semibold transition ${
            activeTab === "my"
              ? "border-b-2 border-brand-600 text-brand-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          My Opportunities
        </button>
        <button
          onClick={() => {
            setActiveTab("government");
            setPage(1);
          }}
          className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 transition ${
            activeTab === "government"
              ? "border-b-2 border-brand-600 text-brand-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Landmark size={15} /> Government Tenders (CPPP)
        </button>
      </div>

      {/* Feed Status Banner for Government Tenders */}
      {activeTab === "government" && (
        <Card className="border-amber-200 bg-amber-50/40">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500 animate-pulse" />
              <div className="text-xs">
                <span className="font-bold text-brand-950">Central Public Procurement Portal (CPPP) Feed</span>
                <span className="ml-2 inline-flex items-center rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900 border border-amber-300">
                  Demo/Seed Dataset
                </span>
                <span className="ml-2 text-slate-500">
                  {syncStatus?.last_sync_time ? `Last synced: ${syncStatus.last_sync_time}` : "Status: Active"}
                </span>
                <span className="ml-3 font-semibold text-brand-700">({totalGovCount} Tenders Ingested)</span>
              </div>
            </div>

            <Button size="sm" variant="secondary" icon={RefreshCw} loading={syncing} onClick={handleTriggerSync}>
              Sync Feed
            </Button>
          </div>
        </Card>
      )}

      {/* Search & Filter Bar */}
      {activeTab === "government" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search government tenders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
            />
          </div>
          <input
            type="text"
            placeholder="Filter by Category..."
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Filter by Location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-brand-500 focus:outline-none"
          />
        </div>
      )}

      <ErrorMessage message={error} onDismiss={() => setError(null)} />
      {actionSuccess && (
        <p className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-700">
          <CheckCircle2 size={15} /> {actionSuccess}
        </p>
      )}

      {/* Table Content */}
      {loading ? (
        <Card>
          <LoadingSpinner label="Loading tenders..." />
        </Card>
      ) : (activeTab === "government" ? govTenders : tenders).length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No tenders found"
          description={
            activeTab === "government"
              ? "No official government tenders match your filter."
              : "Create your first tender to start tracking its status."
          }
          action={
            activeTab !== "government" && (
              <Button icon={PlusCircle} onClick={openCreateForm}>
                Add tender
              </Button>
            )
          }
        />
      ) : (
        <>
          <Table
            columns={columns}
            rows={activeTab === "government" ? govTenders : tenders}
            onRowClick={(row) => navigate(`/tenders/${row.id}`)}
          />

          {/* Pagination Controls */}
          {activeTab === "government" && totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
              <span>
                Page {page} of {totalPages} ({totalGovCount} Total)
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <TenderFormModal
        open={formOpen}
        onClose={closeForm}
        tender={editingTender}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={Boolean(deletingTender)}
        title="Delete tender"
        message={`Are you sure you want to delete "${deletingTender?.title}"? This action cannot be undone.`}
        loading={deleteLoading}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => {
          setDeletingTender(null);
          setDeleteError(null);
        }}
      />
      {deleteError && (
        <ErrorMessage message={deleteError} onDismiss={() => setDeleteError(null)} />
      )}
    </div>
  );
}

function IconButton({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`rounded-lg p-2 transition ${
        danger
          ? "text-slate-400 hover:bg-red-50 hover:text-red-600"
          : "text-slate-400 hover:bg-brand-50 hover:text-brand-700"
      }`}
    >
      <Icon size={16} />
    </button>
  );
}
