import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/auth/Login";

import HospitalDashboard from "./pages/hospital/HospitalDashboard";
import OrganBankDashboard from "./pages/organBank/OrganBankDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import FindOrgan from "./pages/hospital/FindOrgan";
import ProtectedRoute from "./components/ProtectedRoute";
import RequestOrgan from "./pages/hospital/RequestOrgan";
import MyTransfers from "./pages/hospital/MyTransfers";
import ManageTransfers from "./pages/organBank/ManageTransfers";
import Organizations from "./pages/admin/Organizations";
import OrganizationDetails from "./pages/admin/OrganizationDetails";
import Users from "./pages/admin/Users";
import UserDetails from "./pages/admin/UserDetails";
import AuditLogs from "./pages/admin/AuditLogs";

const App = () => {
  return (
    <Routes>

      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Hospital */}
      <Route
        path="/hospital"
        element={
          <ProtectedRoute allowedRoles={["hospital"]}>
            <HospitalDashboard />
          </ProtectedRoute>
        }
      />

      {/* Organ Bank */}
      <Route
        path="/organ-bank"
        element={
          <ProtectedRoute allowedRoles={["organBank"]}>
            <OrganBankDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />


      <Route
        path="/hospital/request-organ/:organId"
        element={
          <ProtectedRoute allowedRoles={["hospital"]}>
            <RequestOrgan />
          </ProtectedRoute>
        }
      />

      <Route
        path="/hospital/find-organ"
        element={
          <ProtectedRoute allowedRoles={["hospital"]}>
            <FindOrgan />
          </ProtectedRoute>
        }
      />

      <Route
        path="/hospital/transfers"
        element={
          <ProtectedRoute allowedRoles={["hospital"]}>
            <MyTransfers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/organ-bank/transfers"
        element={
          <ProtectedRoute allowedRoles={["organBank"]}>
            <ManageTransfers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/organizations"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Organizations />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/organizations/:organizationId"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <OrganizationDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Users />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users/:userId"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <UserDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/audit-logs"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AuditLogs />
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
};

export default App;