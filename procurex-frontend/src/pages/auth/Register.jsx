import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import AuthLayout from "../../components/layout/AuthLayout";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import ErrorMessage from "../../components/common/ErrorMessage";
import { useAuth } from "../../context/useAuth";

const ROLE_OPTIONS = [
  { value: "buyer", label: "Buyer / Procurement Officer" },
  { value: "supplier", label: "Supplier / Vendor" },
  { value: "admin", label: "Administrator" },
  { value: "analyst", label: "Analyst" },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!form.full_name || !form.email || !form.password || !form.role) {
      setError("Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    try {
      await register(form);
      setSuccess(true);
      setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (err) {
      setError(err.message || "Unable to register. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-brand-950">Create your account</h2>
        <p className="mt-1.5 text-sm text-slate-500">
          Start tracking tenders and managing your procurement pipeline.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          id="full_name"
          name="full_name"
          type="text"
          label="Full name"
          placeholder="Jane Doe"
          autoComplete="name"
          required
          value={form.full_name}
          onChange={handleChange}
        />
        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="you@company.com"
          autoComplete="email"
          required
          value={form.email}
          onChange={handleChange}
        />
        <Input
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="Create a strong password"
          autoComplete="new-password"
          required
          value={form.password}
          onChange={handleChange}
        />
        <Select
          id="role"
          name="role"
          label="Role"
          required
          options={ROLE_OPTIONS}
          value={form.role}
          onChange={handleChange}
        />

        <ErrorMessage message={error} onDismiss={() => setError(null)} />
        {success && (
          <p className="fade-in rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Account created! Redirecting you to log in…
          </p>
        )}

        <Button type="submit" icon={UserPlus} loading={submitting} className="w-full">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-brand-700 hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
