"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FieldWrapper, Form, useZodForm } from "@/components/ui/form";
import { resetPasswordSchema } from "@/lib/schemas/auth";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/better-auth/client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      toast.error("Invalid reset link. Please request a new one.");
      router.push("/auth/forgot-password");
      return;
    }
    setToken(tokenParam);
  }, [searchParams, router]);

  const form = useZodForm({
    schema: resetPasswordSchema,
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: {
    password: string;
    confirmPassword: string;
  }) => {
    if (!token) {
      toast.error("Invalid reset link. Please request a new one.");
      return;
    }

    setIsLoading(true);

    const { error } = await authClient.resetPassword({
      newPassword: data.password,
      token,
    });

    setIsLoading(false);

    if (error) {
      toast.error(
        error.message || "Failed to reset password. Please try again."
      );
      return;
    }

    toast.success("Password reset successfully! You can now login.");
    router.push("/auth/login");
  };

  if (!token) {
    return (
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Reset your password</CardTitle>
          <CardDescription>
            Enter your new password below to reset your account password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form form={form} onSubmit={onSubmit}>
            <div className="grid gap-6">
              <FieldWrapper
                name="password"
                control={form.control}
                label="New Password"
                required
              >
                {(props) => (
                  <Input {...props.field} type="password" required />
                )}
              </FieldWrapper>

              <FieldWrapper
                name="confirmPassword"
                control={form.control}
                label="Confirm New Password"
                required
              >
                {(props) => (
                  <Input {...props.field} type="password" required />
                )}
              </FieldWrapper>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Resetting password..." : "Reset password"}
              </Button>

              <div className="text-center text-sm">
                Remember your password?{" "}
                <Link
                  href="/auth/login"
                  className="underline underline-offset-4"
                >
                  Login
                </Link>
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
