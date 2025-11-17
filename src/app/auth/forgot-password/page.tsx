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
import { forgotPasswordSchema } from "@/lib/schemas/auth";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/better-auth/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useZodForm({
    schema: forgotPasswordSchema,
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: { email: string }) => {
    setIsLoading(true);

    const email = await authClient.forgetPassword(
      {
        email: data.email,
        redirectTo: "/auth/reset-password",
      },
      {
        onSuccess: () => {
          router.push(`auth/verify?email=${data.email}`);
          router.refresh();
        },
        onError: (error) => {
          toast.error(
            error.error.message ||
              "Failed to send reset email. Please try again."
          );
        },
      }
    );

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Forgot your password?</CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form form={form} onSubmit={onSubmit}>
            <div className="grid gap-6">
              <FieldWrapper
                name="email"
                control={form.control}
                label="Email"
                required
              >
                {(props) => (
                  <Input
                    {...props.field}
                    type="email"
                    placeholder="mail@example.com"
                    required
                  />
                )}
              </FieldWrapper>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send reset link"}
              </Button>

              <div className="text-center">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center text-sm underline-offset-4 hover:underline"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Link>
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
