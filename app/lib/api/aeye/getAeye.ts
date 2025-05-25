import { supabase } from "@/app/lib/supabase/client";
import { DBAeye } from "@/app/lib/types/types";

interface PaginatedResponse {
  data: DBAeye[];
  total: number;
  page: number;
  limit: number;
}

interface PaginationOptions {
  limit?: number;
  page?: number;
}

const DEFAULT_PAGINATION: PaginationOptions = {
  limit: 20,
  page: 1
};

export async function getAeye(options: PaginationOptions = DEFAULT_PAGINATION): Promise<PaginatedResponse> {
  
  const pageSize = options.limit || DEFAULT_PAGINATION.limit!;
  const page = options.page || DEFAULT_PAGINATION.page!;
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error, count } = await supabase
    .from("zeitgeist")
    .select("*", { count: "exact" })
    .not('token', 'is', null)
    .order("created_at", { ascending: false })
    .range(start, end);

  if (error) {
    
    return {
      data: [],
      total: 0,
      page,
      limit: pageSize
    };
  }

  return {
    data: data as DBAeye[],
    total: count || 0,
    page,
    limit: pageSize
  };
}
