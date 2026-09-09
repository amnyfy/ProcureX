import { useEffect, useState } from "react";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Textarea from "../../components/common/Textarea";
import Button from "../../components/common/Button";
import ErrorMessage from "../../components/common/ErrorMessage";
import { createTender, updateTender } from "../../api/tenders";
import { listCompanies } from "../../api/companies";
import { toDatetimeLocalValue } from "../../utils/formatters";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "open", label: "Open" },
  { value: "under_review", label: "Under Review" },
  { value: "awarded", label: "Awarded" },
  { value: "closed", label: "Closed" },
  { value: "cancelled", label: "Cancelled" },
];

const EMPTY_FORM = {
  title: "",
  reference_number: "",
  organization: "",
  description: "",
  category: "",
  location: "",
  estimated_value: "",
  deadline: "",
  status: "draft",
  company_id: "",
};

export default function TenderFormModal({ open, onClose, tender, onSaved }) {
  const isEditing = Boolean(tender);
  const [form, setForm] = useState(EMPTY_FORM);
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [companiesLoading, setCompaniesLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setForm(
      tender
        ? {
            title: tender.title || "",
            reference_number: tender.reference_number || "",
            organization: tender.organization || "",
            description: tender.description || "",
            category: tender.category || "",
            location: tender.location || "",
            estimated_value: tender.estimated_value ?? "",
            deadline: toDatetimeLocalValue(tender.deadline),
            status: tender.status || "draft",
            company_id: tender.company_id ?? "",
          }
        : EMPTY_FORM
    );
    setError(null);

    async function loadCompanies() {
      setCompaniesLoading(true);
      try {
        const data = await listCompanies();
        setCompanies(Array.isArray(data) ? data : data?.items || []);
      } catch {
        // Non-fatal — the company field simply won't have options.
      } finally {
        setCompaniesLoading(false);
      }
    }
    loadCompanies();
  }, [open, tender]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      setError("Tender title is required.");
      return;
    }

    const payload = {
      ...form,
      estimated_value: form.estimated_value === "" ? undefined : Number(form.estimated_value),
      deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
      company_id: form.company_id === "" ? undefined : Number(form.company_id),
    };

    // Strip empty/undefined optional fields so we don't overwrite existing
    // data with blanks on partial updates.
    Object.keys(payload).forEach((key) => {
      if (payload[key] === "" || payload[key] === undefined) delete payload[key];
    });

    setSubmitting(true);
    try {
      if (isEditing) {
        await updateTender(tender.id, payload);
      } else {
        await createTender(payload);
      }
      onSaved?.();
    } catch (err) {
      setError(err.message || "Failed to save tender.");
    } finally {
      setSubmitting(false);
    }
  }

  const companyOptions = companies.map((c) => ({ value: c.id, label: c.name }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit tender" : "Add tender"}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={submitting}>
            {isEditing ? "Save changes" : "Create tender"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          id="title"
          name="title"
          label="Title"
          required
          placeholder="Supply of Office Equipment"
          value={form.title}
          onChange={handleChange}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="reference_number"
            name="reference_number"
            label="Reference number"
            placeholder="TND-2026-0042"
            value={form.reference_number}
            onChange={handleChange}
          />
          <Input
            id="organization"
            name="organization"
            label="Organization"
            placeholder="Ministry of Public Works"
            value={form.organization}
            onChange={handleChange}
          />
        </div>

        <Textarea
          id="description"
          name="description"
          label="Description"
          placeholder="Describe the scope of work, requirements, and evaluation criteria…"
          value={form.description}
          onChange={handleChange}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="category"
            name="category"
            label="Category"
            placeholder="IT Equipment"
            value={form.category}
            onChange={handleChange}
          />
          <Input
            id="location"
            name="location"
            label="Location"
            placeholder="Nairobi, Kenya"
            value={form.location}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="estimated_value"
            name="estimated_value"
            type="number"
            min="0"
            step="0.01"
            label="Estimated value (USD)"
            placeholder="50000"
            value={form.estimated_value}
            onChange={handleChange}
          />
          <Input
            id="deadline"
            name="deadline"
            type="datetime-local"
            label="Deadline"
            value={form.deadline}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            id="status"
            name="status"
            label="Status"
            options={STATUS_OPTIONS}
            value={form.status}
            onChange={handleChange}
          />
          <Select
            id="company_id"
            name="company_id"
            label="Company"
            placeholder={companiesLoading ? "Loading companies…" : "Select a company"}
            options={companyOptions}
            value={form.company_id}
            onChange={handleChange}
            disabled={companiesLoading}
          />
        </div>

        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      </form>
    </Modal>
  );
}
