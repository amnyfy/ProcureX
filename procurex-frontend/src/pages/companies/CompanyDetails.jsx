import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Building2, Pencil, Trash2, Globe, MapPin, Hash, Briefcase, Mail, Phone } from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import CompanyFormModal from "./CompanyFormModal";
import { getCompany, deleteCompany } from "../../api/companies";

export default function CompanyDetails() {
  const { companyId } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const fetchCompany = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCompany(companyId);
      setCompany(data);
    } catch (err) {
      setError(err.message || "Failed to load company.");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  async function handleDeleteConfirmed() {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deleteCompany(companyId);
      navigate("/companies", { replace: true });
    } catch (err) {
      setDeleteError(err.message || "Failed to delete company.");
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/companies")}
        className="flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
      >
        <ArrowLeft size={16} /> Back to companies
      </button>

      <ErrorMessage message={error} onDismiss={() => setError(null)} />

      {loading ? (
        <Card>
          <LoadingSpinner label="Loading company…" />
        </Card>
      ) : company ? (
        <>
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Building2 size={26} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-brand-950">{company.name}</h1>
                  {company.industry && (
                    <p className="mt-0.5 text-sm text-slate-500">{company.industry}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" icon={Pencil} onClick={() => setEditOpen(true)}>
                  Edit
                </Button>
                <Button variant="danger" icon={Trash2} onClick={() => setDeleteOpen(true)}>
                  Delete
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 text-base font-semibold text-brand-950">Company details</h3>
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <DetailItem icon={Hash} label="Registration number" value={company.registration_number} />
              <DetailItem icon={Briefcase} label="Industry" value={company.industry} />
              <DetailItem icon={Mail} label="Email" value={company.email} />
              <DetailItem icon={Phone} label="Phone" value={company.phone} />
              <DetailItem
                icon={Globe}
                label="Website"
                value={
                  company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-700 hover:underline"
                    >
                      {company.website}
                    </a>
                  ) : null
                }
              />
              <DetailItem icon={MapPin} label="Address" value={company.address} />
            </dl>
          </Card>
        </>
      ) : (
        !error && <p className="text-sm text-slate-500">Company not found.</p>
      )}

      <CompanyFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        company={company}
        onSaved={() => {
          setEditOpen(false);
          fetchCompany();
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete company"
        message={`Are you sure you want to delete "${company?.name}"? This action cannot be undone.`}
        loading={deleteLoading}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => {
          setDeleteOpen(false);
          setDeleteError(null);
        }}
      />
      {deleteError && (
        <ErrorMessage message={deleteError} onDismiss={() => setDeleteError(null)} />
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
