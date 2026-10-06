import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5001/api/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch user");
      }

      setUser(data.user);
    } catch (error) {
      console.error("Fetch User Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const updateStatus = async () => {
    if (!user) return;

    const action = user.isActive ? "deactivate" : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this user?`
    );

    if (!confirmed) return;

    try {
      setUpdating(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5001/api/users/${userId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isActive: !user.isActive,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update user status"
        );
      }

      setUser(data.user);
    } catch (error) {
      console.error("Update User Status Error:", error);
      setError(error.message);
    } finally {
      setUpdating(false);
    }
  };

  const getRoleLabel = (role) => {
    if (role === "organBank") return "Organ Bank";

    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const getRoleStyle = (role) => {
    if (role === "hospital") {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }

    if (role === "organBank") {
      return "bg-purple-50 text-purple-700 border-purple-200";
    }

    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-gray-500">Loading user...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-5xl mx-auto">
          <Link
            to="/admin/users"
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            ← Back to Users
          </Link>

          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <Link
          to="/admin/users"
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          ← Back to Users
        </Link>

        {/* Header */}
        <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-lg font-semibold text-gray-700">
                {user.name?.charAt(0)?.toUpperCase()}
              </div>

              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {user.name}
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  {user.email}
                </p>

                <div className="mt-2">
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getRoleStyle(
                      user.role
                    )}`}
                  >
                    {getRoleLabel(user.role)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <span
                className={`inline-flex rounded-full px-4 py-2 text-sm font-medium ${
                  user.isActive
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {user.isActive ? "Active Account" : "Inactive Account"}
              </span>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* User Information */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            User Information
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Full Name
              </p>
              <p className="mt-1 text-sm text-gray-900">
                {user.name}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Email
              </p>
              <p className="mt-1 text-sm text-gray-900">
                {user.email}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Phone
              </p>
              <p className="mt-1 text-sm text-gray-900">
                {user.phone}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Role
              </p>
              <p className="mt-1 text-sm text-gray-900">
                {getRoleLabel(user.role)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Account Status
              </p>
              <p
                className={`mt-1 text-sm font-medium ${
                  user.isActive
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {user.isActive ? "Active" : "Inactive"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Registered
              </p>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>

          </div>
        </div>

        {/* Organization */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Organization
          </h2>

          {user.organization ? (
            <div className="mt-5 grid gap-5 md:grid-cols-2">

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Organization Name
                </p>
                <p className="mt-1 text-sm text-gray-900">
                  {user.organization.name}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Organization Type
                </p>
                <p className="mt-1 text-sm text-gray-900">
                  {user.organization.type === "organBank"
                    ? "Organ Bank"
                    : "Hospital"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Registration Number
                </p>
                <p className="mt-1 text-sm text-gray-900">
                  {user.organization.registrationNumber || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Location
                </p>
                <p className="mt-1 text-sm text-gray-900">
                  {user.organization.city},{" "}
                  {user.organization.state}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Organization Status
                </p>
                <p
                  className={`mt-1 text-sm font-medium ${
                    user.organization.isActive
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {user.organization.isActive
                    ? "Active"
                    : "Inactive"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Verification
                </p>
                <p
                  className={`mt-1 text-sm font-medium ${
                    user.organization.isVerified
                      ? "text-green-600"
                      : "text-orange-600"
                  }`}
                >
                  {user.organization.isVerified
                    ? "Verified"
                    : "Not Verified"}
                </p>
              </div>

            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-500">
              This user is not linked to an organization.
            </p>
          )}
        </div>

        {/* Account Actions */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Account Actions
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Control whether this user can access OrganLink.
          </p>

          <button
            onClick={updateStatus}
            disabled={updating || user.role === "admin"}
            className={`mt-5 rounded-lg px-5 py-2.5 text-sm font-medium transition ${
              user.role === "admin"
                ? "cursor-not-allowed bg-gray-100 text-gray-400"
                : user.isActive
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {updating
              ? "Updating..."
              : user.role === "admin"
              ? "Admin Account"
              : user.isActive
              ? "Deactivate User"
              : "Activate User"}
          </button>

          {user.role === "admin" && (
            <p className="mt-2 text-xs text-gray-400">
              Admin accounts cannot be deactivated from this panel.
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default UserDetails;