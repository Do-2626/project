import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in the environment');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toSnakeCase = (key: string) =>
  key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const toCamelCase = (key: string) =>
  key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

export function toSnake<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => toSnake(item)) as unknown as T;
  }

  if (isObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [toSnakeCase(key), toSnake(item)])
    ) as T;
  }

  return value;
}

export function toCamel<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => toCamel(item)) as unknown as T;
  }

  if (isObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [toCamelCase(key), toCamel(item)])
    ) as T;
  }

  return value;
}

export function pickSnake(obj: Record<string, unknown>, keys: string[]) {
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    if (key in obj) {
      result[toSnakeCase(key)] = obj[key];
    }
  }
  return result;
}
