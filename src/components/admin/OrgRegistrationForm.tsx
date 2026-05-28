/**
 * OrgRegistrationForm — admin-only organization creation form.
 */
import { useState } from "react";
import { api } from "../../services/api";
import type { Organization } from "../../types";
import { Button } from "../ui/button";
import { Building2, Loader2, CheckCircle2 } from "lucide-react";

interface FormValues {
  name: string;
  domain: string;
  description: string;
  status: "active" | "inactive";
}

interface OrgRegistrationFormProps {
  onSuccess?: (org: Organization) => void;
}

const INITIAL: FormValues = { name: "", domain: "", description: "", status: "active" };

export function OrgRegistrationForm({ onSuccess }: OrgRegistrationFormProps) {
  const [values, setValues] = useState<FormValues>(INITIAL);
  const [errors, setErrors] = useState<Partial<FormValues>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<Organization | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = (): boolean => {
    const e: Partial<FormValues> = {};
    if (!values.name.trim()) e.name = "Organization name is required.";
    if (values.domain && !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(values.domain)) {
      e.domain = "Enter a valid domain (e.g. acme.io).";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError(null);
    try {
      const { data } = await api.post<Organization>("/organizations", values);
      setSuccess(data);
      setValues(INITIAL);
      onSuccess?.(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create organization.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const field = (label: string, key: keyof FormValues, props?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="space-y-1">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <input
        {...props}
        value={values[key]}
        onChange={(e) => { setValues((v) => ({ ...v, [key]: e.target.value })); setErrors((er) => ({ ...er, [key]: undefined })); }}
        className={`w-full rounded-md border ${errors[key] ? "border-destructive" : "border-border"} bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring transition-colors`}
      />
      {errors[key] && <p className="text-xs text-destructive">{errors[key]}</p>}
    </div>
  );

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle2 className="h-10 w-10 text-emerald-400" />
        <h3 className="font-semibold">Organization Created</h3>
        <p className="text-sm text-muted-foreground">
          <strong>{success.name}</strong> has been created successfully.
        </p>
        <Button variant="outline" size="sm" onClick={() => setSuccess(null)}>
          Create another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Building2 className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">New Organization</h2>
      </div>

      {serverError && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      {field("Organization Name *", "name", { placeholder: "Acme Corp", autoFocus: true })}
      {field("Domain", "domain", { placeholder: "acme.io", type: "text" })}

      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Description</label>
        <textarea
          value={values.description}
          onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
          rows={3}
          placeholder="Brief description of this organization…"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring transition-colors resize-none"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground">Status</label>
        <select
          value={values.status}
          onChange={(e) => setValues((v) => ({ ...v, status: e.target.value as "active" | "inactive" }))}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring transition-colors"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={loading} className="gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Creating…" : "Create Organization"}
        </Button>
      </div>
    </form>
  );
}
