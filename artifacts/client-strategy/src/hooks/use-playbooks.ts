import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/react";

export type PlaybookSummary = {
  id: number;
  title: string;
  industry: string;
  target_audience: string;
  main_product: string;
  created_at: string;
  updated_at: string;
};

export type PlaybookFull = PlaybookSummary & {
  mac_context: string;
  playbook_data: Record<string, unknown>;
};

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export function usePlaybooks() {
  const { isSignedIn } = useUser();
  return useQuery<PlaybookSummary[]>({
    queryKey: ["playbooks"],
    queryFn: () => apiFetch<PlaybookSummary[]>("/api/playbooks"),
    enabled: !!isSignedIn,
    staleTime: 30_000,
  });
}

export function usePlaybook(id: number | null) {
  const { isSignedIn } = useUser();
  return useQuery<PlaybookFull>({
    queryKey: ["playbooks", id],
    queryFn: () => apiFetch<PlaybookFull>(`/api/playbooks/${id}`),
    enabled: !!isSignedIn && id !== null,
  });
}

type SavePayload = {
  title: string;
  industry: string;
  targetAudience: string;
  mainProduct: string;
  macContext: string;
  playbookData: Record<string, unknown>;
};

export function useSavePlaybook() {
  const qc = useQueryClient();
  return useMutation<PlaybookFull, Error, SavePayload>({
    mutationFn: (payload) =>
      apiFetch<PlaybookFull>("/api/playbooks", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["playbooks"] });
    },
  });
}

export function useDeletePlaybook() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) =>
      apiFetch<void>(`/api/playbooks/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["playbooks"] });
    },
  });
}

export function useRenamePlaybook() {
  const qc = useQueryClient();
  return useMutation<PlaybookFull, Error, { id: number; title: string }>({
    mutationFn: ({ id, title }) =>
      apiFetch<PlaybookFull>(`/api/playbooks/${id}`, {
        method: "PUT",
        body: JSON.stringify({ title }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["playbooks"] });
    },
  });
}

export async function fetchPlaybook(id: number): Promise<PlaybookFull> {
  return apiFetch<PlaybookFull>(`/api/playbooks/${id}`);
}
