import { api } from "@/lib/api";

// Calls POST /uploads with the file as multipart/form-data. Don't set a
// Content-Type header manually - axios sets the right multipart boundary
// on its own when given a FormData body.
export async function uploadFile(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);

  return api.post("/uploads", formData);
}
