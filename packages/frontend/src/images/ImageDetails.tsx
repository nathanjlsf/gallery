import { useParams } from "react-router-dom";
import { useState } from "react";
import type { IApiImageData } from "csc437-monorepo-backend/src/common/ApiImageData";
import { ImageNameEditor } from "./ImageNameEditor";

interface ImageDetailsProps {
  images: IApiImageData[];
  isLoading: boolean;
  isError: boolean;
}

export function ImageDetails({ images, isLoading, isError }: ImageDetailsProps) {
  const { imageId } = useParams();

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error fetching image data.</p>;

  const image = images.find(image => image.id === imageId);
  if (!image) {
    return <h2>Image not found</h2>;
  }

  const [name, setName] = useState(image.name);

  return (
    <>
      <h2>{name}</h2>
      <p>By {image.author.username}</p>
      <ImageNameEditor
        initialValue={name}
        imageId={image.id}
        onNameUpdated={(newName) => setName(newName)}
      />
      <img className="ImageDetails-img" src={image.src} alt={name} />
    </>
  );
}
