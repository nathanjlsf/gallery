import { Routes, Route } from "react-router-dom";
import { AllImages } from "./images/AllImages";
import { ImageDetails } from "./images/ImageDetails";
import { UploadPage } from "./UploadPage";
import { LoginPage } from "./LoginPage";
import { MainLayout } from "./MainLayout";
import { ValidRoutes } from "csc437-monorepo-backend/src/shared/ValidRoutes.ts";
import { fetchDataFromServer } from "./MockAppData";
import { useState } from "react";

function App() {
  const [images] = useState(fetchDataFromServer());

  return (
    <Routes>
      <Route path={ValidRoutes.HOME} element={<MainLayout />}>
        <Route index element={<AllImages images={images} />} />
        <Route path={ValidRoutes.LOGIN.slice(1)} element={<LoginPage />} />
        <Route path={ValidRoutes.UPLOAD.slice(1)} element={<UploadPage />} />
        <Route
          path={ValidRoutes.IMAGES_ID.slice(1)}
          element={<ImageDetails images={images} />}
        />
      </Route>
    </Routes>
  );
}

export default App;
