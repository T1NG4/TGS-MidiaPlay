import * as tus from "tus-js-client";
import { VIDEO_BUCKET } from "./constants";

type UploadOptions = {
  file: File;
  objectName: string;
  accessToken: string;
  onProgress?: (ratio: number) => void;
};

export function uploadResumable({
  file,
  objectName,
  accessToken,
  onProgress,
}: UploadOptions) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return Promise.reject(new Error("NEXT_PUBLIC_SUPABASE_URL ausente."));
  }

  return new Promise<void>((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: `${supabaseUrl.replace(/\/$/, "")}/storage/v1/upload/resumable`,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${accessToken}`,
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
        "x-upsert": "false",
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      metadata: {
        bucketName: VIDEO_BUCKET,
        objectName,
        contentType: file.type || "video/mp4",
        cacheControl: "3600",
      },
      chunkSize: 6 * 1024 * 1024,
      onError(error) {
        reject(error);
      },
      onProgress(bytesUploaded, bytesTotal) {
        if (bytesTotal > 0) {
          onProgress?.(bytesUploaded / bytesTotal);
        }
      },
      onSuccess() {
        resolve();
      },
    });

    upload.findPreviousUploads().then((previous) => {
      if (previous.length > 0) {
        upload.resumeFromPreviousUpload(previous[0]);
      }
      upload.start();
    }, reject);
  });
}
