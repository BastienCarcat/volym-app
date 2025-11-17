"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signupSchema } from "@/lib/schemas/auth";
import { Form, useZodForm } from "@/components/ui/form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { FieldWrapper } from "@/components/ui/form";
import { authClient } from "@/lib/better-auth/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useZodForm({
    schema: signupSchema,
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: {
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    setIsLoading(true);

    const { error: signUpError } = await authClient.signUp.email({
      email: data.email,
      password: data.password,
      name: data.email.split("@")[0],
    });

    if (signUpError) {
      setIsLoading(false);
      toast.error(
        signUpError.message || "Failed to create account. Please try again."
      );
      return;
    }

    const { error: signInError } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    });

    if (signInError) {
      setIsLoading(false);
      toast.error("Account created but failed to login. Please login manually.");
      router.push("/auth/login");
      return;
    }

    toast.success("Account created successfully");
    router.push("/auth/onboarding");
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create an account</CardTitle>
          <CardDescription>
            Sign up to access all features of Volym. It's free and easy!
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

              <FieldWrapper
                name="password"
                control={form.control}
                label="Password"
                required
              >
                {(props) => <Input {...props.field} type="password" required />}
              </FieldWrapper>

              <FieldWrapper
                name="confirmPassword"
                control={form.control}
                label="Confirm password"
                required
              >
                {(props) => <Input {...props.field} type="password" required />}
              </FieldWrapper>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <a href="/auth/login" className="underline underline-offset-4">
                  Login
                </a>
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
