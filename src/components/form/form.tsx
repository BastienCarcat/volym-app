"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type * as React from "react";
import type {
  SubmitHandler,
  UseFormProps,
  UseFormReturn,
} from "react-hook-form";
import { FormProvider, useForm, type FieldValues } from "react-hook-form";
import type * as z from "zod";

/**
 * Form component with automatic FormProvider wrapping and submit handling
 *
 * Features:
 * - Automatically wraps with FormProvider for nested form context
 * - Handles form.handleSubmit() automatically
 * - Disables all inputs during submission via fieldset
 *
 * @example
 * const form = useZodForm({ schema: mySchema });
 *
 * <Form form={form} onSubmit={handleSubmit}>
 *   <FieldWrapper name="email" control={form.control}>
 *     {(props) => <Input {...props.field} />}
 *   </FieldWrapper>
 *   <Button type="submit">Submit</Button>
 * </Form>
 */
export type FormProps<T extends FieldValues> = Omit<
  React.ComponentProps<"form">,
  "onSubmit"
> & {
  form: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
  disabled?: boolean;
};

export const Form = <T extends FieldValues>({
  form,
  onSubmit,
  children,
  className,
  disabled,
  ...props
}: FormProps<T>) => {
  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={className}
        {...props}
      >
        <fieldset
          disabled={disabled ?? form.formState.isSubmitting}
          className="contents"
        >
          {children}
        </fieldset>
      </form>
    </FormProvider>
  );
};

/**
 * Hook to create a form with automatic Zod schema validation
 *
 * @example
 * const schema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8),
 * });
 *
 * const form = useZodForm({
 *   schema,
 *   defaultValues: { email: "", password: "" }
 * });
 */
type UseZodFormProps<T extends z.ZodType<any, any, any>> = Exclude<
  UseFormProps<z.output<T>>,
  "resolver"
> & {
  schema: T;
};

export const useZodForm = <T extends z.ZodType<any, any, any>>({
  schema,
  ...formProps
}: UseZodFormProps<T>) => {
  return useForm<z.infer<T>>({
    ...formProps,
    resolver: zodResolver(schema) as any,
  });
};

// Export FormProvider alias for advanced use cases where you need context without the form wrapper
export { FormProvider } from "react-hook-form";

// Export useFormContext for accessing form from nested components
export { useFormContext } from "react-hook-form";
