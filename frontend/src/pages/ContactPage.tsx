import { Mail, PhoneCall } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/toast-provider";

export function ContactPage() {
  const { pushToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Contact PulsePoint</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-pulse-300" />
            <span>operators@pulsepoint.app</span>
          </div>
          <div className="flex items-center gap-3">
            <PhoneCall className="h-4 w-4 text-pulse-300" />
            <span>+1 (212) 555-0184</span>
          </div>
          <p>
            Use this page for product questions, enterprise onboarding, or pricing and deployment help.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Send a message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input aria-label="Contact name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
          <Input aria-label="Contact email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" />
          <Textarea aria-label="Contact message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tell us what you need help with." />
          <Button
            onClick={() => {
              setIsSubmitting(true);
              window.setTimeout(() => {
                setIsSubmitting(false);
                pushToast({
                  title: "Message queued",
                  description: "We saved your inquiry locally and opened your mail client fallback.",
                  tone: "success",
                });
                window.location.href = `mailto:operators@pulsepoint.app?subject=${encodeURIComponent(`PulsePoint inquiry from ${name || "website visitor"}`)}&body=${encodeURIComponent(message)}`;
              }, 500);
            }}
            disabled={isSubmitting || !email || !message}
          >
            {isSubmitting ? "Sending..." : "Send message"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

