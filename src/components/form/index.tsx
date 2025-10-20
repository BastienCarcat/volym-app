/**
 * Form Components - Unified export for all form-related components
 *
 * Modern form architecture using shadcn Field components and React Hook Form:
 * - Form: Auto-wrapping form component with submit handling
 * - useZodForm: Hook for creating forms with Zod schema validation
 * - FieldWrapper: Render-props wrapper for Controller + Field integration
 * - Input components: Low-level, composable input primitives
 */

// ============================================================================
// Form Core
// ============================================================================

// Modern Form component with auto-submit handling
export { Form, useZodForm, FormProvider, useFormContext } from "./form";

// ============================================================================
// Field Components (shadcn)
// ============================================================================

// Re-export Field components from shadcn for manual composition
export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldSet,
  FieldLegend,
  FieldSeparator,
  FieldContent,
  FieldTitle,
} from "@/components/ui/field";

// ============================================================================
// Field Wrapper (for convenience)
// ============================================================================

// FieldWrapper: Convenience wrapper for Controller + Field
// Use this for simple inputs to avoid repetitive boilerplate
export { FieldWrapper } from "./fields/field-wrapper";

// ============================================================================
// Input Components (low-level primitives)
// ============================================================================

// Base input components - use with FieldWrapper or Controller
export { Input } from "./fields/inputs/input";
export { Textarea } from "./fields/inputs/textarea";

// Specialized input components with built-in logic
export { NumberInput } from "./fields/inputs/number-input";
export { TitleInput } from "./fields/inputs/title-input";
export { DurationInput } from "./fields/inputs/duration-input";
export { SelectInput, type SelectOption } from "./fields/inputs/select-input";

// ============================================================================
// Types
// ============================================================================

export type { InputProps } from "./fields/inputs/input";
export type { TextareaProps } from "./fields/inputs/textarea";
export type { NumberInputProps } from "./fields/inputs/number-input";
export type { TitleInputProps } from "./fields/inputs/title-input";
export type { DurationInputProps } from "./fields/inputs/duration-input";
export type { SelectInputProps } from "./fields/inputs/select-input";
