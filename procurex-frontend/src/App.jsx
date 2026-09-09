import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import CompaniesList from "./pages/companies/CompaniesList";
import CompanyDetails from "./pages/companies/CompanyDetails";
import TendersList from "./pages/tenders/TendersList";
import TenderDetails from "./pages/tenders/TenderDetails";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/companies" element={<CompaniesList />} />
            <Route path="/companies/:companyId" element={<CompanyDetails />} />
            <Route path="/tenders" element={<TendersList />} />
            <Route path="/tenders/:tenderId" element={<TenderDetails />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
