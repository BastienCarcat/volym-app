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
import { loginSchema } from "@/lib/schemas/auth";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/better-auth/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useZodForm({
    schema: loginSchema,
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: { email: string; password: string }) => {
    setIsLoading(true);

    const { error } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setIsLoading(false);
      toast.error(error.message || "Failed to login. Please try again.");
      return;
    }

    toast.success("Successfully logged in");
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Login to continue on Volym.</CardDescription>
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

              <div className="space-y-2">
                <FieldWrapper
                  name="password"
                  control={form.control}
                  label="Password"
                  required
                >
                  {(props) => (
                    <Input {...props.field} type="password" required />
                  )}
                </FieldWrapper>

                <div className="text-right">
                  <a
                    href="/auth/forgot-password"
                    className="text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a href="/auth/signup" className="underline underline-offset-4">
                  Sign up
                </a>
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
