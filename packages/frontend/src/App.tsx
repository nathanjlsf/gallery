import { Routes, Route } from "react-router-dom";
import { AllImages } from "./images/AllImages";
import { ImageDetails } from "./images/ImageDetails";
import { UploadPage } from "./UploadPage";
import { LoginPage } from "./LoginPage";
import { MainLayout } from "./MainLayout";
import { ValidRoutes } from "csc437-monorepo-backend/src/shared/ValidRoutes";
import type { IApiImageData } from "csc437-monorepo-backend/src/common/ApiImageData";
import { useEffect, useState } from "react";

function App() {
  const [images, setImages] = useState<IApiImageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    fetch("/api/images")
      .then((res) => {
        if (!res.ok) throw new Error("Fetch failed");
        return res.json();
      })
      .then((data) => {
        setImages(data);
        setIsError(false);
      })
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <Routes>
      <Route path={ValidRoutes.HOME} element={<MainLayout />}>
        <Route
          index
          element={<AllImages images={images} isLoading={isLoading} isError={isError} />}
        />
        <Route path={ValidRoutes.LOGIN.slice(1)} element={<LoginPage />} />
        <Route path={ValidRoutes.UPLOAD.slice(1)} element={<UploadPage />} />
        <Route
          path={ValidRoutes.IMAGES_ID.slice(1)}
          element={<ImageDetails images={images} isLoading={isLoading} isError={isError} />}
        />
      </Route>
    </Routes>
  );
}

export default App;
