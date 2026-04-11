import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/toast-provider";
import { api, getErrorMessage } from "@/lib/api";
import type { AuthResponse } from "@/lib/types";
import { useAuthStore } from "@/store/useAuthStore";

export function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { pushToast } = useToast();
  const [email, setEmail] = useState("demo@pulsepoint.app");
  const [password, setPassword] = useState("demo-password");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    setIsSubmitting(true);

    try {
      const response = await api.post<AuthResponse>("/auth/login", {
        email,
        password,
      });
      setAuth(response.data.data.user, response.data.data.session.id);
      pushToast({
        title: "Welcome back",
        description: "Your PulsePoint dashboard is ready.",
        tone: "success",
      });
      navigate("/dashboard");
    } catch (error) {
      pushToast({
        title: "Login failed",
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
          <CardTitle>Sign in to PulsePoint</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input aria-label="Login email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
          <Input aria-label="Login password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" />
          <Button className="w-full" disabled={isSubmitting} onClick={handleLogin}>
            {isSubmitting ? "Signing in..." : "Login"}
          </Button>
          <p className="text-sm text-muted-foreground">
            New here? <Link className="text-pulse-200 hover:text-white" to="/register">Create an account</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

