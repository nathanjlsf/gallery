  import { Routes, Route } from "react-router-dom";
  import { AllImages } from "./images/AllImages";
  import { ImageDetails } from "./images/ImageDetails";
  import { UploadPage } from "./UploadPage";
  import { LoginPage } from "./LoginPage";
  import { MainLayout } from "./MainLayout";
  import { ValidRoutes } from "csc437-monorepo-backend/src/shared/ValidRoutes";
  import type { IApiImageData } from "csc437-monorepo-backend/src/common/ApiImageData";
  import { useEffect, useRef, useState } from "react";
  import { ImageSearchForm } from "./images/ImageSearchForm";
  import { ProtectedRoute } from "./ProtectedRoute";

  function App() {
    const [images, setImages] = useState<IApiImageData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [searchString, setSearchString] = useState("");
    const [authToken, setAuthToken] = useState("");

    const currentRequestNumber = useRef(0);

    async function fetchImages(searchQuery: string = "") {
      const thisRequest = ++currentRequestNumber.current;
      setIsLoading(true);
      setIsError(false);

      try {
        const url = searchQuery
          ? `/api/images?name=${encodeURIComponent(searchQuery)}`
          : `/api/images`;

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        if (!res.ok) throw new Error("Fetch failed");

        const data = await res.json();
        if (thisRequest === currentRequestNumber.current) {
          setImages(data);
        }
      } catch {
        if (thisRequest === currentRequestNumber.current) {
          setIsError(true);
        }
      } finally {
        if (thisRequest === currentRequestNumber.current) {
          setIsLoading(false);
        }
      }
    }

    useEffect(() => {
      if (authToken) {
        fetchImages();
      }
    }, [authToken]);

    async function renameImage(imageId: string, newName: string) {
      try {
        const res = await fetch(`/api/images/${imageId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authToken}`,
          },
          body: JSON.stringify({ newName }),
        });

        if (!res.ok) throw new Error("Failed to rename image");

        const updatedImage = await res.json();
        setImages((prev) =>
          prev.map((img) => (img.id === imageId ? updatedImage : img))
        );
      } catch (err) {
        console.error("Error renaming image:", err);
      }
    }

    function handleImageSearch() {
      fetchImages(searchString);
    }

    const searchPanel = (
      <ImageSearchForm
        searchString={searchString}
        onSearchStringChange={setSearchString}
        onSearchRequested={handleImageSearch}
      />
    );

    return (
      <Routes>
        <Route path={ValidRoutes.HOME} element={<MainLayout />}>
          <Route
            index
            element={
              <ProtectedRoute authToken={authToken}>
                <AllImages
                  images={images}
                  isLoading={isLoading}
                  isError={isError}
                  renameImage={renameImage}
                  searchPanel={searchPanel}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path={ValidRoutes.UPLOAD.slice(1)}
            element={
              <ProtectedRoute authToken={authToken}>
                <UploadPage authToken={authToken}/>
              </ProtectedRoute>
            }
          />
          <Route
            path={ValidRoutes.IMAGES_ID.slice(1)}
            element={
              <ProtectedRoute authToken={authToken}>
                <ImageDetails
                  images={images}
                  isLoading={isLoading}
                  isError={isError}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={<LoginPage onAuthSuccess={setAuthToken} />}
          />
          <Route
            path="/register"
            element={<LoginPage isRegistering={true} onAuthSuccess={setAuthToken} />}
          />
        </Route>
      </Routes>
    );
  }

  export default App;
