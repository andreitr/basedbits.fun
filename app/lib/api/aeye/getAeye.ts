import { supabase } from "@/app/lib/supabase/client";
import { DBAeye } from "@/app/lib/types/types";

interface PaginatedResponse {
  data: DBAeye[];
  total: number;
  page: number;
  limit: number;
}

export async function getAeye(limit?: number, page: number = 1): Promise<DBAeye[] | PaginatedResponse> {
  const pageSize = limit || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error, count } = await supabase
    .from("zeitgeist")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(start, end);

  if (error) {
    console.error("Error fetching zeitgeist:", error);
    return limit ? {
      data: [],
      total: 0,
      page,
      limit: pageSize
    } : [];
  }

  return limit ? {
    data: data as DBAeye[],
    total: count || 0,
    page,
    limit: pageSize
  } : data as DBAeye[];
}
