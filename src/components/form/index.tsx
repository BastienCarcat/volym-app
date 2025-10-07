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
export { Textarea } from "./fields/inputs/textarea";
export { DurationInput } from "./fields/inputs/duration-input";

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
