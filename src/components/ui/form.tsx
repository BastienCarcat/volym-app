"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type * as React from "react";
import type {
  Control,
  SubmitHandler,
  UseFormProps,
  UseFormReturn,
} from "react-hook-form";
import {
  Controller,
  FormProvider,
  useForm,
  type FieldValues,
} from "react-hook-form";
import type * as z from "zod";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";

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

export interface FieldWrapperProps {
  name: string;
  control: Control<any>;
  label?: string;
  description?: string;
  required?: boolean;
  className?: string;
  children: (renderProps: {
    field: any;
    fieldState: any;
    formState: any;
  }) => React.ReactNode;
}

/**
 * FieldWrapper - Modern wrapper using shadcn Field components with React Hook Form Controller
 *
 * Provides a clean interface for custom inputs with automatic field state management.
 * Just wrap your custom input and use {...renderProps} to get field, fieldState, and formState.
 *
 * Usage:
 * <FieldWrapper name="note" control={control} label="Note">
 *   {(renderProps) => <CustomInput {...renderProps} />}
 * </FieldWrapper>
 *
 * Or even simpler:
 * <FieldWrapper name="note" control={control} label="Note">
 *   {(props) => <Textarea {...props.field} aria-invalid={props.fieldState.invalid} />}
 * </FieldWrapper>
 */
export function FieldWrapper({
  name,
  control,
  label,
  description,
  required,
  className,
  children,
}: FieldWrapperProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState, formState }) => (
        <Field className={className} data-invalid={fieldState.invalid}>
          {label && (
            <FieldLabel htmlFor={field.name}>
              {label}
              {required && <span className="text-destructive">*</span>}
            </FieldLabel>
          )}

          {children({ field, fieldState, formState })}

          {description && <FieldDescription>{description}</FieldDescription>}

          {fieldState.invalid && fieldState.error && (
            <FieldError errors={[fieldState.error]} />
          )}
        </Field>
      )}
    />
  );
}
