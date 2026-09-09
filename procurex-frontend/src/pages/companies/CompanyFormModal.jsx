import { useEffect, useState } from "react";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import ErrorMessage from "../../components/common/ErrorMessage";
import { createCompany, updateCompany } from "../../api/companies";

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  registration_number: "",
  industry: "",
  address: "",
  website: "",
};

export default function CompanyFormModal({ open, onClose, company, onSaved }) {
  const isEditing = Boolean(company);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        company
          ? {
              name: company.name || "",
              email: company.email || "",
              phone: company.phone || "",
              registration_number: company.registration_number || "",
              industry: company.industry || "",
              address: company.address || "",
              website: company.website || "",
            }
          : EMPTY_FORM
      );
      setError(null);
    }
  }, [open, company]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError("Company name is required.");
      return;
    }

    // Only send fields that have a value, so we don't overwrite existing
    // data with empty strings on partial forms.
    const payload = Object.fromEntries(
      Object.entries(form).filter(([, value]) => value !== "")
    );

    setSubmitting(true);
    try {
      if (isEditing) {
        await updateCompany(company.id, payload);
      } else {
        await createCompany(payload);
      }
      onSaved?.();
    } catch (err) {
      setError(err.message || "Failed to save company.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit company" : "Add company"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={submitting}>
            {isEditing ? "Save changes" : "Create company"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          id="name"
          name="name"
          label="Company name"
          required
          placeholder="Acme Construction Ltd."
          value={form.name}
          onChange={handleChange}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="contact@company.com"
            value={form.email}
            onChange={handleChange}
          />
          <Input
            id="phone"
            name="phone"
            label="Phone"
            placeholder="+1-555-0199"
            value={form.phone}
            onChange={handleChange}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="registration_number"
            name="registration_number"
            label="Registration number"
            placeholder="REG-000123"
            value={form.registration_number}
            onChange={handleChange}
          />
          <Input
            id="industry"
            name="industry"
            label="Industry"
            placeholder="Construction"
            value={form.industry}
            onChange={handleChange}
          />
        </div>
        <Input
          id="website"
          name="website"
          type="url"
          label="Website"
          placeholder="https://example.com"
          value={form.website}
          onChange={handleChange}
        />
        <Input
          id="address"
          name="address"
          label="Address"
          placeholder="123 Business Ave, City, Country"
          value={form.address}
          onChange={handleChange}
        />

        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      </form>
    </Modal>
  );
}
