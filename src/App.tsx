import { BrowserRouter, Route, Routes } from "react-router-dom";

import { DefaultProviders } from "./components/providers/default.tsx";
import Index from "./pages/Index.tsx";
import ParentDashboard from "./pages/parent/Dashboard.tsx";
import AdminDashboard from "./pages/admin/Dashboard.tsx";
import DriverApp from "./pages/driver/Dashboard.tsx";
import NotFound from "./pages/NotFound.tsx";

export default function App() {
  return (
    <DefaultProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/parent" element={<ParentDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/driver" element={<DriverApp />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </DefaultProviders>
  );
}