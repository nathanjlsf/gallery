import React, { useState } from "react";

interface UploadPageProps {
  authToken: string;
}

export function UploadPage({ authToken }: UploadPageProps) {
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPreviewURL(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreviewURL(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/images", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({} as any));
        setMessage(json.error || "Upload failed.");
      } else {
        setMessage("Upload successful!");
      }
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <h2>Upload</h2>

      <form onSubmit={handleSubmit} className="UploadPage-form">
        <div>
          <label htmlFor="imageInput">Choose image to upload:</label>
          <input
            id="imageInput"
            name="image"
            type="file"
            accept=".png,.jpg,.jpeg"
            required
            disabled={isPending}
            onChange={handleFileChange}
          />
        </div>

        <div>
          <label htmlFor="titleInput">
            <span>Image title:</span>
          </label>
          <input
            id="titleInput"
            name="name"
            required
            disabled={isPending}
            type="text"
          />
        </div>

        {previewURL && (
          <div aria-live="polite" className="UploadPage-preview">
            <img
              style={{ width: "20em", maxWidth: "100%" }}
              src={previewURL}
              alt="Preview"
            />
          </div>
        )}

        <button type="submit" disabled={isPending}>
          {isPending ? "Uploading…" : "Confirm upload"}
        </button>

        {message && (
          <div className="UploadPage-message" aria-live="polite">
            {message}
          </div>
        )}
      </form>
    </>
  );
}
