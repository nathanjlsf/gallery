import React from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header.tsx";

export function MainLayout({ children }: React.PropsWithChildren) {
  return (
    <div>
      <Header />
      <div style={{ padding: "0 2em" }}>
        {children ?? <Outlet />}
      </div>
    </div>
  );
}
