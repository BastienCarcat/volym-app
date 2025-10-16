import { up } from "up-fetch";

/**
 * Enhanced fetch client with schema validation, automatic JSON handling, and query parameters
 *
 * @description
 * upfetch is a wrapper around the native fetch API built with up-fetch that provides:
 * - Schema validation with automatic type inference using Zod
 * - Automatic JSON/text response parsing (no .json() needed)
 * - Automatic JSON serialization for request bodies
 * - Query parameter handling via params object
 * - Enhanced error handling with ResponseError and ValidationError
 * - Full TypeScript support with type inference
 *
 * @param input - URL string, URL object, or Request object
 * @param options - Enhanced options object with schema, params, and standard fetch options
 * @param options.schema - Zod schema for response validation and type inference
 * @param options.params - Query parameters as key-value object (automatically serialized)
 * @param options.method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param options.headers - Request headers
 * @param options.body - Request body (automatically JSON-serialized if object)
 * @returns Promise<InferredType> when schema provided, Promise<any> (parsed JSON/text) otherwise
 *
 * @throws {ResponseError} When HTTP response status >= 400
 * @throws {ValidationError} When response doesn't match provided schema
 */
export const upfetch = up(fetch);
