import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  notFoundComponent: () => (
    <div style={{ padding: 24 }}>
      <h1>404 — Sayfa bulunamadı</h1>
    </div>
  ),
  component: () => <Outlet />,
});
