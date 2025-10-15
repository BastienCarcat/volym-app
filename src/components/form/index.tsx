/**
 * Field Components - Unified export for all field-related components
 *
 * These components provide a consistent interface for form inputs with:
 * - Labels and error messages
 * - Accessibility features
 * - Consistent styling using shadcn/ui components
 */

export { FieldWrapper } from "./fields/field-wrapper";

// Export individual components
export { Input } from "./fields/inputs/input";
export { InputV2 } from "./fields/inputs/input-v2";
export { NumberInputV2 } from "./fields/inputs/number-input-v2";
export { TitleInput } from "./fields/inputs/title-input";
export { Textarea } from "./fields/inputs/textarea";
export { TextareaV2 } from "./fields/inputs/textarea-v2";
export { DurationInput } from "./fields/inputs/duration-input";
export { DurationInputV2 } from "./fields/inputs/duration-input-v2";

// Export new field wrappers
export { FieldWrapperV2 } from "./fields/field-wrapper-v2";

// Re-export original form components for advanced use cases
export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  useFormField,
} from "@/components/form/form";
