import { ImageGrid } from "./ImageGrid.tsx";
import type { IApiImageData } from "csc437-monorepo-backend/src/common/ApiImageData.ts";

interface AllImagesProps {
  images: IApiImageData[];
  isLoading: boolean;
  isError: boolean;
}

export function AllImages({ images }: AllImagesProps) {
    return (
        <>
            <h2>All Images</h2>
            <ImageGrid images={images} />
        </>
    );
}
