import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminHeader from "./AdminHeader";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:5001/api/users",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch users");
            }

            setUsers(data.users || []);
        } catch (error) {
            console.error("Fetch Users Error:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers =
        activeTab === "all"
            ? users
            : users.filter((user) => user.role === activeTab);

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
                <div className="max-w-7xl mx-auto">
                    <p className="text-gray-500">Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminHeader
                onRefresh={fetchUsers}
                refreshing={loading}
            />
            <div className="max-w-7xl mx-auto p-6 md:p-8">

                <div className="mb-8">
                    <h1 className="text-3xl font-semibold text-gray-900">
                        Users
                    </h1>

                    <p className="mt-1 text-gray-500">
                        Manage registered users and account access.
                    </p>
                </div>


                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Tabs */}
                <div className="mb-6 flex flex-wrap gap-2">
                    {[
                        { key: "all", label: "All Users" },
                        { key: "hospital", label: "Hospitals" },
                        { key: "organBank", label: "Organ Banks" },
                        { key: "admin", label: "Admins" },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${activeTab === tab.key
                                ? "border-gray-900 bg-gray-900 text-white"
                                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Users */}
                {filteredUsers.length === 0 ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
                        <p className="text-gray-500">
                            No users found.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredUsers.map((user) => (
                            <div
                                key={user._id}
                                className="rounded-2xl border border-gray-200 bg-white p-5"
                            >
                                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                                    {/* User info */}
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                                            {user.name?.charAt(0)?.toUpperCase()}
                                        </div>

                                        <div>
                                            <h2 className="font-semibold text-gray-900">
                                                {user.name}
                                            </h2>

                                            <p className="mt-1 text-sm text-gray-500">
                                                {user.email}
                                            </p>

                                            <p className="mt-1 text-sm text-gray-500">
                                                {user.phone}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Role + Organization */}
                                    <div className="md:min-w-[220px]">
                                        <span
                                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getRoleStyle(
                                                user.role
                                            )}`}
                                        >
                                            {getRoleLabel(user.role)}
                                        </span>

                                        {user.organization && (
                                            <p className="mt-2 text-sm text-gray-700">
                                                {user.organization.name}
                                            </p>
                                        )}

                                        {user.organization?.city && (
                                            <p className="text-xs text-gray-400">
                                                {user.organization.city},{" "}
                                                {user.organization.state}
                                            </p>
                                        )}
                                    </div>

                                    {/* Status */}
                                    <div className="md:min-w-[100px]">
                                        <span
                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${user.isActive
                                                ? "bg-green-50 text-green-700"
                                                : "bg-red-50 text-red-700"
                                                }`}
                                        >
                                            {user.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </div>

                                    {/* Action */}
                                    <Link
                                        to={`/admin/users/${user._id}`}
                                        className="text-sm font-medium text-gray-900 hover:underline"
                                    >
                                        View Details →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Count */}
                <p className="mt-5 text-sm text-gray-400">
                    Showing {filteredUsers.length} of {users.length} users
                </p>
            </div>
        </div>
    );
};

export default Users;