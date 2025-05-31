import { useState } from "react";

interface INameEditorProps {
  initialValue: string;
  imageId: string;
  onNameUpdated: (newName: string) => void;
}

export function ImageNameEditor({ initialValue, imageId, onNameUpdated }: INameEditorProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [input, setInput] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmitPressed() {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/images/${imageId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newName: input }),
      });

      if (!response.ok) {
        throw new Error("Server returned an error");
      }

      setIsEditingName(false);
      onNameUpdated(input);
    } catch (err) {
      setError("Failed to update image name.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isEditingName) {
    return (
      <div style={{ margin: "1em 0" }}>
        <label>
          New Name{" "}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isSubmitting}
          />
        </label>
        <button
          disabled={input.length === 0 || isSubmitting}
          onClick={handleSubmitPressed}
        >
          Submit
        </button>
        <button onClick={() => setIsEditingName(false)} disabled={isSubmitting}>
          Cancel
        </button>
        {isSubmitting && <p>Working...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    );
  } else {
    return (
      <div style={{ margin: "1em 0" }}>
        <button onClick={() => setIsEditingName(true)}>Edit name</button>
      </div>
    );
  }
}
