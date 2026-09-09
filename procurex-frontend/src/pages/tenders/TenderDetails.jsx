import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Pencil,
  Trash2,
  Building2,
  MapPin,
  Tag,
  Wallet,
  CalendarClock,
  Hash,
  Upload,
  Sparkles,
  Award,
  CheckCircle2,
  FileCheck,
  ExternalLink,
  Plus,
  Landmark,
  AlertCircle,
  Info,
} from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import StatusBadge from "../../components/common/StatusBadge";
import TenderFormModal from "./TenderFormModal";
import TenderCopilot from "../../components/tenders/TenderCopilot";
import { getTender, deleteTender } from "../../api/tenders";
import { getCompany } from "../../api/companies";
import { uploadDocument } from "../../api/documents";
import { analyzeTender } from "../../api/ai";
import { createBid, listBids, updateBidStatus } from "../../api/bids";
import { addToMyOpportunities } from "../../api/governmentTenders";
import { formatCurrency, formatDateTime, isPastDeadline } from "../../utils/formatters";

export default function TenderDetails() {
  const { tenderId } = useParams();
  const navigate = useNavigate();

  const [tender, setTender] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Document states
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const [docError, setDocError] = useState(null);
  const [docSuccess, setDocSuccess] = useState(null);

  // AI Analysis states
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [aiError, setAiError] = useState(null);

  // Bid states
  const [bid, setBid] = useState(null);
  const [bidSubmitting, setBidSubmitting] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const fetchTender = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTender(tenderId);
      setTender(data);

      if (data.company_id) {
        try {
          const companyData = await getCompany(data.company_id);
          setCompany(companyData);
        } catch {
          setCompany(null);
        }
      }

      // Check existing bid for this tender
      try {
        const allBids = await listBids();
        const existingBid = allBids.find((b) => b.tender_id === Number(tenderId));
        if (existingBid) {
          setBid(existingBid);
        }
      } catch {
        // Non-fatal
      }
    } catch (err) {
      setError(err.message || "Failed to load tender.");
    } finally {
      setLoading(false);
    }
  }, [tenderId]);

  useEffect(() => {
    fetchTender();
  }, [fetchTender]);

  async function handleAddOpportunity() {
    setActionSuccess(null);
    setError(null);
    try {
      const res = await addToMyOpportunities(tenderId);
      setActionSuccess(res.message);
      fetchTender();
    } catch (err) {
      setError(err.message || "Failed to add opportunity.");
    }
  }

  async function handleFileUpload(e) {
    e.preventDefault();
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setDocError("Only PDF files are allowed.");
      return;
    }

    setUploading(true);
    setDocError(null);
    setDocSuccess(null);
    try {
      const res = await uploadDocument(tenderId, selectedFile);
      setUploadedDoc(res);
      setDocSuccess(`Document "${res.filename || selectedFile.name}" uploaded successfully!`);
      setSelectedFile(null);
    } catch (err) {
      setDocError(err.message || "Failed to upload PDF.");
    } finally {
      setUploading(false);
    }
  }

  async function handleAnalyze() {
    setAnalyzing(true);
    setAiError(null);
    try {
      const res = await analyzeTender(tenderId);
      setAnalysis(res);
      // Refresh bid info after analysis
      const allBids = await listBids();
      const existingBid = allBids.find((b) => b.tender_id === Number(tenderId));
      if (existingBid) setBid(existingBid);
    } catch (err) {
      setAiError(err.message || "AI Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleCreateOrSubmitBid(targetStatus = "submitted") {
    setBidSubmitting(true);
    try {
      if (bid) {
        const updated = await updateBidStatus(bid.id, targetStatus);
        setBid(updated);
      } else {
        const newBid = await createBid({
          tender_id: Number(tenderId),
          eligibility_score: analysis?.eligibility_score || 0,
          winning_probability: analysis?.winning_probability || 0,
          status: targetStatus,
        });
        setBid(newBid);
      }
    } catch (err) {
      setError(err.message || "Failed to update bid status.");
    } finally {
      setBidSubmitting(false);
    }
  }

  async function handleDeleteConfirmed() {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deleteTender(tenderId);
      navigate("/tenders", { replace: true });
    } catch (err) {
      setDeleteError(err.message || "Failed to delete tender.");
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/tenders")}
        className="flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
      >
        <ArrowLeft size={16} /> Back to tenders
      </button>

      <ErrorMessage message={error} onDismiss={() => setError(null)} />
      {actionSuccess && (
        <p className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-700">
          <CheckCircle2 size={15} /> {actionSuccess}
        </p>
      )}

      {loading ? (
        <Card>
          <LoadingSpinner label="Loading tender details…" />
        </Card>
      ) : tender ? (
        <>
          {/* Header Card */}
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  {tender.is_government_tender ? <Landmark size={26} /> : <FileText size={26} />}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-2xl font-bold text-brand-950">{tender.title}</h1>
                    <StatusBadge status={tender.status} />
                    {tender.is_government_tender && (
                      <span className="inline-flex items-center rounded-md bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
                        CPPP Government Tender
                      </span>
                    )}
                  </div>
                  {tender.reference_number && (
                    <p className="mt-1 text-sm text-slate-500">Ref: {tender.reference_number}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {tender.source_url && (
                  <a
                    href={tender.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition"
                  >
                    <ExternalLink size={14} /> View Official Tender
                  </a>
                )}
                {tender.is_government_tender && !tender.company_id && (
                  <Button icon={Plus} size="sm" onClick={handleAddOpportunity}>
                    Add to My Opportunities
                  </Button>
                )}
                {!tender.is_government_tender && (
                  <>
                    <Button variant="secondary" icon={Pencil} onClick={() => setEditOpen(true)}>
                      Edit
                    </Button>
                    <Button variant="danger" icon={Trash2} onClick={() => setDeleteOpen(true)}>
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* Description */}
          {tender.description && (
            <Card>
              <h3 className="mb-2 text-base font-semibold text-brand-950">Description & Scope of Work</h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {tender.description}
              </p>
            </Card>
          )}

          {/* Tender Details Grid */}
          <Card>
            <h3 className="mb-4 text-base font-semibold text-brand-950">Tender details</h3>
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <DetailItem icon={Building2} label="Organization" value={tender.organization} />
              {tender.department && <DetailItem icon={Landmark} label="Department" value={tender.department} />}
              <DetailItem icon={Tag} label="Category" value={tender.category} />
              <DetailItem icon={MapPin} label="Location" value={tender.location} />
              <DetailItem
                icon={Wallet}
                label="Estimated value"
                value={formatCurrency(tender.estimated_value)}
              />
              <DetailItem
                icon={CalendarClock}
                label="Deadline / Closing Date"
                value={
                  tender.deadline || tender.closing_date ? (
                    <span className={isPastDeadline(tender.deadline || tender.closing_date) ? "text-red-500 font-semibold" : ""}>
                      {formatDateTime(tender.deadline || tender.closing_date)}
                    </span>
                  ) : null
                }
              />
              {tender.source && <DetailItem icon={Info} label="Source Portal" value={tender.source} />}
              <DetailItem
                icon={Building2}
                label="Assigned Company"
                value={
                  company ? (
                    <button
                      onClick={() => navigate(`/companies/${company.id}`)}
                      className="text-brand-700 hover:underline font-medium"
                    >
                      {company.name}
                    </button>
                  ) : tender.company_id ? (
                    tender.company_id
                  ) : (
                    <span className="text-slate-400 italic">Unassigned (Public Government Opportunity)</span>
                  )
                }
              />
              <DetailItem icon={Hash} label="Tender ID" value={tender.id} />
            </dl>
          </Card>

          {/* PDF Document Upload Section */}
          <Card>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-brand-950">Tender PDF Specification Document</h3>
                <p className="text-xs text-slate-500">Upload or analyze official tender specification PDF for AI evaluation</p>
              </div>

              <form onSubmit={handleFileUpload} className="flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="text-xs text-slate-500 file:mr-2 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
                />
                <Button type="submit" size="sm" icon={Upload} loading={uploading} disabled={!selectedFile}>
                  Upload PDF
                </Button>
              </form>
            </div>

            <ErrorMessage message={docError} onDismiss={() => setDocError(null)} />
            {docSuccess && (
              <p className="mt-2 text-xs font-medium text-emerald-600 flex items-center gap-1">
                <CheckCircle2 size={14} /> {docSuccess}
              </p>
            )}

            {uploadedDoc && (
              <div className="mt-4 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <FileCheck size={20} className="text-emerald-600" />
                <div className="text-xs">
                  <p className="font-semibold text-brand-950">{uploadedDoc.filename}</p>
                  <p className="text-slate-400">Path: {uploadedDoc.filepath}</p>
                </div>
              </div>
            )}
          </Card>

          {/* AI Tender Analysis Section */}
          <Card className="border-brand-200 bg-gradient-to-br from-white to-brand-50/30">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="flex items-center gap-2 text-base font-bold text-brand-950">
                  <Sparkles size={18} className="text-brand-600" /> AI Tender Intelligence & Evaluation
                </h3>
                <p className="text-xs text-slate-500">Extract requirements, eligibility score, and AI winning probability</p>
              </div>
              <Button icon={Sparkles} onClick={handleAnalyze} loading={analyzing}>
                {analysis ? "Re-run AI Analysis" : "Analyze Tender PDF"}
              </Button>
            </div>

            <ErrorMessage message={aiError} onDismiss={() => setAiError(null)} />

            {analysis && (
              <div className="mt-5 space-y-4 rounded-xl border border-brand-100 bg-white p-5 shadow-sm">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-lg bg-emerald-50 p-4 border border-emerald-100">
                    <p className="text-xs font-medium text-emerald-800 uppercase tracking-wider">Eligibility Score</p>
                    <p className="mt-1 text-3xl font-extrabold text-emerald-700">{analysis.eligibility_score}%</p>
                  </div>
                  <div className="rounded-lg bg-brand-50 p-4 border border-brand-100">
                    <p className="text-xs font-medium text-brand-800 uppercase tracking-wider">AI-Estimated Winning Probability</p>
                    <p className="mt-1 text-3xl font-extrabold text-brand-700">{analysis.winning_probability}%</p>
                  </div>
                  <div className="rounded-lg bg-amber-50 p-4 border border-amber-100">
                    <p className="text-xs font-medium text-amber-800 uppercase tracking-wider">Recommendation</p>
                    <p className="mt-1 text-lg font-bold text-amber-900">{analysis.recommendation}</p>
                  </div>
                </div>

                {/* Mandatory Disclaimer */}
                <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 border border-slate-200 text-[11px] text-slate-500">
                  <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>AI Winning Probability Disclaimer:</strong> This score is an AI-generated decision-support estimate based on available tender information and should not be considered a guarantee of award.
                  </span>
                </div>

                {analysis.summary && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Executive Summary</h4>
                    <p className="mt-1 text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                      {analysis.summary}
                    </p>
                  </div>
                )}

                {analysis.matched_requirements && analysis.matched_requirements.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Matched Requirements</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.matched_requirements.map((req, i) => (
                        <span key={i} className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                          <CheckCircle2 size={12} /> {req}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* AI Tender Copilot Section */}
          <TenderCopilot tenderId={tenderId} tenderTitle={tender?.title} />

          {/* Bid Management Section */}
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="flex items-center gap-2 text-base font-semibold text-brand-950">
                  <Award size={18} className="text-brand-600" /> Bid Submission & Opportunity Tracking
                </h3>
                <p className="text-xs text-slate-500">Track bid status and qualification in PostgreSQL</p>
              </div>

              <div className="flex items-center gap-3">
                {bid && <StatusBadge status={bid.status} />}
                <Button
                  size="sm"
                  loading={bidSubmitting}
                  onClick={() => handleCreateOrSubmitBid(bid?.status === "submitted" ? "awarded" : "submitted")}
                >
                  {bid?.status === "submitted" ? "Mark as Awarded" : "Submit Bid"}
                </Button>
              </div>
            </div>

            {bid && (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs">
                <div>
                  <span className="text-slate-400">Bid ID:</span> <span className="font-semibold text-slate-700">{bid.id}</span>
                </div>
                <div>
                  <span className="text-slate-400">Eligibility Score:</span> <span className="font-semibold text-emerald-600">{bid.eligibility_score ?? "—"}%</span>
                </div>
                <div>
                  <span className="text-slate-400">Winning Probability:</span> <span className="font-semibold text-brand-600">{bid.winning_probability ?? "—"}%</span>
                </div>
              </div>
            )}
          </Card>
        </>
      ) : (
        !error && <p className="text-sm text-slate-500">Tender not found.</p>
      )}

      <TenderFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        tender={tender}
        onSaved={() => {
          setEditOpen(false);
          fetchTender();
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete tender"
        message={`Are you sure you want to delete "${tender?.title}"? This action cannot be undone.`}
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
