import { Route, Routes as RouterRoutes } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import WizardPage from "./pages/WizardPage";

export const Routes = () => {
  return (
    <RouterRoutes>
      <Route path="/" element={<Index />} />
      <Route path="/wizard/:feature" element={<WizardPage />} />
      <Route path="*" element={<NotFound />} />
    </RouterRoutes>
  );
};