"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateProfile } from "../_actions/update-profile.action";
import { onboardingSchema } from "@/lib/schemas/auth";
import { Form, useZodForm, FieldWrapper } from "@/components/ui/form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useAction } from "next-safe-action/hooks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function OnboardingPage() {
  const form = useZodForm({
    schema: onboardingSchema,
    defaultValues: {
      firstname: "",
      lastname: "",
      gender: "Male" as const,
    },
  });

  const { execute, isExecuting } = useAction(updateProfile, {
    onError: ({ error }) => {
      const errorMessage =
        typeof error.serverError === "string"
          ? error.serverError
          : "An error occurred while updating your profile";
      toast.error(errorMessage);
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Complete your profile</CardTitle>
          <CardDescription>
            Tell us a bit more about yourself to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form form={form} onSubmit={execute}>
            <div className="grid gap-6">
              <FieldWrapper
                name="firstname"
                control={form.control}
                label="First Name"
                required
              >
                {(props) => (
                  <Input
                    {...props.field}
                    placeholder="John"
                  />
                )}
              </FieldWrapper>

              <FieldWrapper
                name="lastname"
                control={form.control}
                label="Last Name"
                required
              >
                {(props) => (
                  <Input
                    {...props.field}
                    placeholder="Doe"
                  />
                )}
              </FieldWrapper>

              <FieldWrapper
                name="gender"
                control={form.control}
                label="Gender"
                required
              >
                {(props) => (
                  <Select
                    onValueChange={(value) =>
                      form.setValue("gender", value as "Male" | "Female")
                    }
                    defaultValue={props.field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </FieldWrapper>

              <Button type="submit" className="w-full" disabled={isExecuting}>
                {isExecuting ? "Saving..." : "Complete Profile"}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
