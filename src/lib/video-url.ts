import { VIDEO_BUCKET } from "./constants";

export type VideoRow = {
  id: string;
  title: string;
  storage_path: string;
  size_bytes: number;
  mime: string;
  created_at: string;
  owner_id: string;
};

export function storagePublicUrl(supabaseUrl: string, storagePath: string) {
  const base = supabaseUrl.replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${VIDEO_BUCKET}/${storagePath}`;
}

export function watchPath(id: string) {
  return `/v/${id}`;
}
