import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/toast-provider";
import { api, getErrorMessage } from "@/lib/api";
import type { AuthResponse } from "@/lib/types";
import { useAuthStore } from "@/store/useAuthStore";

export function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { pushToast } = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister() {
    setIsSubmitting(true);

    try {
      const response = await api.post<AuthResponse>("/auth/register", form);
      setAuth(response.data.data.user, response.data.data.session.id);
      pushToast({
        title: "Account created",
        description: "Your SaaS workspace is ready to configure.",
        tone: "success",
      });
      navigate("/dashboard");
    } catch (error) {
      pushToast({
        title: "Registration failed",
        description: getErrorMessage(error),
        tone: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Create your PulsePoint account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "username", label: "Username" },
            { key: "password", label: "Password", type: "password" },
          ].map((field) => (
            <Input
              key={field.key}
              aria-label={field.label}
              type={field.type ?? "text"}
              value={form[field.key as keyof typeof form]}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  [field.key]: event.target.value,
                }))
              }
              placeholder={field.label}
            />
          ))}
          <Button className="w-full" disabled={isSubmitting} onClick={handleRegister}>
            {isSubmitting ? "Creating..." : "Register"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Already have an account? <Link className="text-pulse-200 hover:text-white" to="/login">Login</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

