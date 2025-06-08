import React, { useState } from "react";
import type { IApiImageData } from "csc437-monorepo-backend/src/common/ApiImageData";

interface AllImagesProps {
  images: IApiImageData[];
  isLoading: boolean;
  isError: boolean;
  renameImage: (imageId: string, newName: string) => Promise<void>;
  searchPanel: React.ReactNode;
}

export function AllImages({
  images,
  isLoading,
  isError,
  renameImage,
  searchPanel,
}: AllImagesProps) {
  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading images.</p>;

  return (
    <div>
      <h2>All Images</h2>
      {searchPanel}
      <ul>
        {images.map((img) => (
          <li key={img.id}>
            <p>Current name: {img.name}</p>
            <RenameImageForm
              imageId={img.id}
              currentName={img.name}
              onRename={renameImage}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function RenameImageForm({
  imageId,
  currentName,
  onRename,
}: {
  imageId: string;
  currentName: string;
  onRename: (id: string, newName: string) => Promise<void>;
}) {
  const [newName, setNewName] = useState(currentName);
  const [isRenaming, setIsRenaming] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newName.trim() === "" || newName === currentName) return;
    setIsRenaming(true);
    onRename(imageId, newName).finally(() => setIsRenaming(false));
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        disabled={isRenaming}
      />
      <button type="submit" disabled={isRenaming || newName === currentName}>
        Rename
      </button>
    </form>
  );
}
