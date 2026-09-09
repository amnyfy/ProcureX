import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Building2, PlusCircle, Pencil, Trash2, Eye } from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Table from "../../components/common/Table";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import CompanyFormModal from "./CompanyFormModal";
import { listCompanies, deleteCompany } from "../../api/companies";

export default function CompaniesList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formOpen, setFormOpen] = useState(searchParams.get("create") === "1");
  const [editingCompany, setEditingCompany] = useState(null);
  const [deletingCompany, setDeletingCompany] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listCompanies();
      setCompanies(Array.isArray(data) ? data : data?.items || []);
    } catch (err) {
      setError(err.message || "Failed to load companies.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  function openCreateForm() {
    setEditingCompany(null);
    setFormOpen(true);
  }

  function openEditForm(company) {
    setEditingCompany(company);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingCompany(null);
    if (searchParams.get("create")) {
      searchParams.delete("create");
      setSearchParams(searchParams, { replace: true });
    }
  }

  function handleSaved() {
    closeForm();
    fetchCompanies();
  }

  async function handleDeleteConfirmed() {
    if (!deletingCompany) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deleteCompany(deletingCompany.id);
      setDeletingCompany(null);
      fetchCompanies();
    } catch (err) {
      setDeleteError(err.message || "Failed to delete company.");
    } finally {
      setDeleteLoading(false);
    }
  }

  const columns = [
    {
      key: "name",
      header: "Company",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Building2 size={16} />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-brand-950">{row.name || "Untitled"}</p>
            {row.industry && <p className="truncate text-xs text-slate-400">{row.industry}</p>}
          </div>
        </div>
      ),
    },
    {
      key: "registration_number",
      header: "Registration No.",
      render: (row) => row.registration_number || "—",
    },
    {
      key: "website",
      header: "Website",
      render: (row) =>
        row.website ? (
          <a
            href={row.website}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-brand-700 hover:underline"
          >
            {row.website.replace(/^https?:\/\//, "")}
          </a>
        ) : (
          "—"
        ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) => (
        <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <IconButton label="View" onClick={() => navigate(`/companies/${row.id}`)} icon={Eye} />
          <IconButton label="Edit" onClick={() => openEditForm(row)} icon={Pencil} />
          <IconButton
            label="Delete"
            onClick={() => setDeletingCompany(row)}
            icon={Trash2}
            danger
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-950">Companies</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage the companies participating in your procurement pipeline.
          </p>
        </div>
        <Button icon={PlusCircle} onClick={openCreateForm}>
          Add company
        </Button>
      </div>

      <ErrorMessage message={error} onDismiss={() => setError(null)} />

      {loading ? (
        <Card>
          <LoadingSpinner label="Loading companies…" />
        </Card>
      ) : companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No companies yet"
          description="Add your first company to start associating tenders with it."
          action={
            <Button icon={PlusCircle} onClick={openCreateForm}>
              Add company
            </Button>
          }
        />
      ) : (
        <Table
          columns={columns}
          rows={companies}
          onRowClick={(row) => navigate(`/companies/${row.id}`)}
        />
      )}

      <CompanyFormModal
        open={formOpen}
        onClose={closeForm}
        company={editingCompany}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={Boolean(deletingCompany)}
        title="Delete company"
        message={`Are you sure you want to delete "${deletingCompany?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => {
          setDeletingCompany(null);
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
