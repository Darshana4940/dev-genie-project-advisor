
import { Json } from "@/integrations/supabase/types";

/**
 * Converts any value to a Json compatible value
 * This is needed because Supabase requires Json type for certain fields
 */
export const toJson = <T>(value: T): Json => {
  return value as unknown as Json;
};
