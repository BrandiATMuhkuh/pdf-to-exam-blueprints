import supabase from "@/lib/supabaseClient";
import { QueryData } from "@supabase/supabase-js";
export const query = supabase
  .from("blueprints")
  .select("*,blueprint_edges(*)");

export type BluePrintWithContent = QueryData<typeof query>[0]