import { createServerFn } from "@tanstack/react-start";

export type CloudinaryBatch = {
  images: string[];
  cursor: string | null;
  configured: boolean;
  error?: string;
};

type CloudinaryResource = {
  public_id: string;
  format?: string;
  resource_type?: string;
};

/**
 * Fetch one batch of background images from Cloudinary using the Admin API.
 *
 * Returns optimized delivery URLs (f_auto,q_auto, width-capped) plus a
 * `next_cursor` so the client can page through the full library a batch at a
 * time. If Cloudinary credentials are missing or the request fails, returns
 * `configured: false` (or an `error`) so the client can fall back gracefully to
 * the curated set.
 */
export const fetchCloudinaryBatch = createServerFn({ method: "GET" })
  .inputValidator((data: { cursor?: string } | undefined) => ({
    cursor: typeof data?.cursor === "string" ? data.cursor : undefined,
  }))
  .handler(async ({ data }): Promise<CloudinaryBatch> => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const folder = process.env.CLOUDINARY_FOLDER; // optional, e.g. "Assets"

    if (!cloudName || !apiKey || !apiSecret) {
      return { images: [], cursor: null, configured: false };
    }

    try {
      const params = new URLSearchParams({
        max_results: "100",
        type: "upload",
      });
      if (folder) params.set("prefix", folder.endsWith("/") ? folder : `${folder}/`);
      if (data.cursor) params.set("next_cursor", data.cursor);

      const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?${params.toString()}`,
        { headers: { Authorization: `Basic ${auth}` } },
      );

      if (!res.ok) {
        return {
          images: [],
          cursor: null,
          configured: true,
          error: `Cloudinary responded ${res.status}`,
        };
      }

      const json = (await res.json()) as {
        resources?: CloudinaryResource[];
        next_cursor?: string;
      };

      const images = (json.resources ?? [])
        .filter((r) => r.public_id)
        .map((r) => {
          const ext = r.format ? `.${r.format}` : "";
          return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_1600/${r.public_id}${ext}`;
        });

      return {
        images,
        cursor: json.next_cursor ?? null,
        configured: true,
      };
    } catch (err) {
      return {
        images: [],
        cursor: null,
        configured: true,
        error: err instanceof Error ? err.message : "Cloudinary request failed",
      };
    }
  });
