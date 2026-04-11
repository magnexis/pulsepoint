import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api, getErrorMessage } from "@/lib/api";

export function ReportDialog({
  businessId,
  onSubmitted,
}: {
  businessId: string;
  onSubmitted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("COMPLAINT");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState(3);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);

    try {
      await api.post("/report", {
        businessId,
        type,
        title,
        description,
        severity,
        sentiment: type === "FEEDBACK" ? 35 : -35,
        user: {
          name,
          email,
        },
      });

      setOpen(false);
      setTitle("");
      setDescription("");
      setName("");
      setEmail("");
      onSubmitted();
    } catch (submissionError) {
      setError(getErrorMessage(submissionError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Submit report</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit a verified field report</DialogTitle>
          <DialogDescription>
            Reports are persisted to the backend and immediately influence trust and risk.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input aria-label="Reporter name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
            <Input aria-label="Reporter email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" type="email" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <select
              aria-label="Report type"
              className="h-11 rounded-2xl border border-white/10 bg-white/6 px-4 text-sm text-white"
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              <option value="COMPLAINT">Complaint</option>
              <option value="FEEDBACK">Feedback</option>
              <option value="SCAM_FLAG">Flag as scam</option>
            </select>
            <select
              aria-label="Report severity"
              className="h-11 rounded-2xl border border-white/10 bg-white/6 px-4 text-sm text-white"
              value={severity}
              onChange={(event) => setSeverity(Number(event.target.value))}
            >
              <option value={1}>Severity 1</option>
              <option value={2}>Severity 2</option>
              <option value={3}>Severity 3</option>
              <option value={4}>Severity 4</option>
              <option value={5}>Severity 5</option>
            </select>
          </div>
          <Input aria-label="Report title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Short summary" />
          <Textarea
            aria-label="Report description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Explain what happened and why this should affect the business score."
          />
          {error ? <p className="text-sm text-coral-400">{error}</p> : null}
          <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit report"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
