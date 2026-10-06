import { useEffect, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import AdminHeader from "./AdminHeader";

const groupActivities = (activities) => {
    const groups = {};

    activities.forEach((activity) => {
        const key = `${activity.entityType}-${activity.entityId}`;

        if (!groups[key]) {
            groups[key] = {
                entityType: activity.entityType,
                entityId: activity.entityId,
                activities: [],
            };
        }

        groups[key].activities.push(activity);
    });

    return Object.values(groups);
};

const AdminDashboard = () => {
    const { logout } = useAuth();

    const [stats, setStats] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/dashboard/admin");

            setStats(response.data.stats);
            setRecentActivity(response.data.recentActivity || []);
        } catch (error) {
            console.error("Admin Dashboard Error:", error);

            setError(
                error.response?.data?.message ||
                "Failed to load admin dashboard"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const groupedActivities = groupActivities(recentActivity);

    // Only show the latest few activity groups on the dashboard.
    const visibleActivities = groupedActivities.slice(0, 5);

    const formatAction = (action) => {
        return action
            .replaceAll("_", " ")
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getActionStyle = (action) => {
        if (action.includes("DELIVERED")) {
            return "text-green-400";
        }

        if (action.includes("APPROVED")) {
            return "text-blue-400";
        }

        if (action.includes("IN_TRANSIT")) {
            return "text-yellow-400";
        }

        if (
            action.includes("REJECTED") ||
            action.includes("CANCELLED")
        ) {
            return "text-red-400";
        }

        if (action.includes("CREATED")) {
            return "text-purple-400";
        }

        return "text-slate-400";
    };

    const getActionIcon = (action) => {
        if (action.includes("DELIVERED")) return "✓";
        if (action.includes("APPROVED")) return "✓";
        if (action.includes("IN_TRANSIT")) return "→";
        if (action.includes("REJECTED")) return "×";
        if (action.includes("CANCELLED")) return "×";
        if (action.includes("CREATED")) return "+";

        return "•";
    };

    const getActivityDescription = (action) => {
        switch (action) {
            case "TRANSFER_DELIVERED":
                return "Organ transfer successfully delivered";

            case "TRANSFER_IN_TRANSIT":
                return "Transfer status changed to in transit";

            case "TRANSFER_CREATED":
                return "New organ transfer was created";

            case "REQUEST_APPROVED":
                return "Organ request approved and transfer initiated";

            case "REQUEST_REJECTED":
                return "Organ request was rejected";

            case "USER_STATUS_UPDATED":
                return "User account status was changed";

            case "ORGANIZATION_STATUS_UPDATED":
                return "Organization status was changed";

            default:
                return "System activity recorded";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                <p className="text-sm text-slate-500">
                    Loading admin dashboard...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 text-white p-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-2xl font-semibold">
                        Admin Dashboard
                    </h1>

                    <div className="mt-5 border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
                        {error}
                    </div>

                    <button
                        onClick={fetchDashboard}
                        className="mt-4 px-4 py-2 bg-white text-black text-sm font-medium hover:bg-slate-200 transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">

            <AdminHeader
                onRefresh={fetchDashboard}
                refreshing={loading}
            />


            <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">

                {/* Intro */}
                <section className="mb-8">

                    <p className="text-xs uppercase tracking-[0.16em] text-slate-600">
                        System Overview
                    </p>

                    <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">

                        <div>
                            <h2 className="text-2xl font-semibold">
                                OrganLink Network
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Current system activity and operational status.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-green-400">
                            <span className="h-2 w-2 rounded-full bg-green-400" />
                            Operational
                        </div>

                    </div>

                </section>


                {/* Top Metrics */}
                <section className="border-y border-slate-800">

                    <div className="grid grid-cols-2 md:grid-cols-6">

                        <Metric
                            label="Users"
                            value={stats.totalUsers}
                        />

                        <Metric
                            label="Hospitals"
                            value={stats.totalHospitals}
                        />

                        <Metric
                            label="Organ Banks"
                            value={stats.totalOrganBanks}
                        />

                        <Metric
                            label="Organs"
                            value={stats.totalOrgans}
                        />

                        <Metric
                            label="Requests"
                            value={stats.totalRequests}
                        />

                        <Metric
                            label="Transfers"
                            value={stats.totalTransfers}
                        />

                    </div>

                </section>


                {/* Operations */}
                <section className="mt-10">

                    <div className="mb-5">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-600">
                            Operations
                        </p>

                        <h2 className="mt-1 text-lg font-semibold">
                            Current state
                        </h2>
                    </div>


                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12">

                        {/* Organ Inventory */}
                        <OperationBlock
                            title="Organ Inventory"
                            rows={[
                                {
                                    label: "Total",
                                    value: stats.totalOrgans,
                                },
                                {
                                    label: "Available",
                                    value: stats.availableOrgans,
                                    valueClass: "text-green-400",
                                },
                                {
                                    label: "Reserved",
                                    value: stats.reservedOrgans,
                                },
                                {
                                    label: "Expired",
                                    value: stats.expiredOrgans,
                                    valueClass: "text-red-400",
                                },
                            ]}
                        />


                        {/* Requests */}
                        <OperationBlock
                            title="Requests"
                            rows={[
                                {
                                    label: "Total",
                                    value: stats.totalRequests,
                                },
                                {
                                    label: "Pending",
                                    value: stats.pendingRequests,
                                    valueClass: "text-yellow-400",
                                },
                                {
                                    label: "Completed",
                                    value: stats.completedRequests,
                                    valueClass: "text-green-400",
                                },
                            ]}
                        />


                        {/* Transfers */}
                        <OperationBlock
                            title="Transfers"
                            rows={[
                                {
                                    label: "Total",
                                    value: stats.totalTransfers,
                                },
                                {
                                    label: "Active",
                                    value: stats.activeTransfers,
                                    valueClass: "text-yellow-400",
                                },
                                {
                                    label: "Completed",
                                    value: stats.completedTransfers,
                                    valueClass: "text-green-400",
                                },
                            ]}
                        />


                    </div>

                </section>


                {/* Recent Activity */}
                <section className="mt-12">

                    <div className="flex items-end justify-between mb-5">

                        <div>
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-600">
                                Activity
                            </p>

                            <h2 className="mt-1 text-lg font-semibold">
                                Recent Activity
                            </h2>
                        </div>

                        <Link
                            to="/admin/audit-logs"
                            className="text-sm text-slate-500 hover:text-white transition"
                        >
                            View all →
                        </Link>

                    </div>


                    {visibleActivities.length === 0 ? (

                        <div className="border-y border-slate-800 py-8 text-sm text-slate-500">
                            No recent activity.
                        </div>

                    ) : (

                        <div className="border-y border-slate-800">

                            {visibleActivities.map((group, index) => {

                                const latestActivity =
                                    group.activities[0];

                                const action =
                                    latestActivity.action;

                                return (
                                    <div
                                        key={`${group.entityType}-${group.entityId}`}
                                        className={`flex items-center justify-between gap-6 py-4 ${index !==
                                                visibleActivities.length - 1
                                                ? "border-b border-slate-900"
                                                : ""
                                            }`}
                                    >

                                        <div className="flex items-center gap-4 min-w-0">

                                            {/* Status marker */}
                                            <div
                                                className={`flex h-8 w-8 shrink-0 items-center justify-center border border-slate-800 bg-slate-900 text-sm font-medium ${getActionStyle(
                                                    action
                                                )}`}
                                            >
                                                {getActionIcon(action)}
                                            </div>


                                            <div className="min-w-0">

                                                <div className="flex items-center gap-2 flex-wrap">

                                                    <h3 className="text-sm font-medium text-slate-200">
                                                        {formatAction(action)}
                                                    </h3>

                                                    <span className="text-[10px] uppercase tracking-wide text-slate-600">
                                                        {group.entityType}
                                                    </span>

                                                    {group.activities.length > 1 && (
                                                        <span className="text-[10px] text-slate-600">
                                                            {group.activities.length} events
                                                        </span>
                                                    )}

                                                </div>

                                                <p className="mt-1 text-xs text-slate-600">
                                                    {getActivityDescription(action)}
                                                </p>

                                                <p className="mt-1 text-xs text-slate-700">
                                                    {latestActivity.organization?.name ||
                                                        "System"}
                                                    {" · "}
                                                    By{" "}
                                                    {latestActivity.performedBy?.name ||
                                                        "Unknown User"}
                                                </p>

                                            </div>

                                        </div>


                                        <time className="shrink-0 text-xs text-slate-600">
                                            {formatDate(
                                                latestActivity.createdAt
                                            )}
                                        </time>

                                    </div>
                                );
                            })}

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
};


/* ---------------- Components ---------------- */

const Metric = ({ label, value }) => {
    return (
        <div className="border-r border-slate-800 px-5 py-5 last:border-r-0">
            <p className="text-xs uppercase tracking-wide text-slate-600">
                {label}
            </p>

            <p className="mt-2 text-2xl font-semibold text-slate-100">
                {value}
            </p>
        </div>
    );
};


const OperationBlock = ({ title, rows }) => {
    return (
        <div className="border-t border-slate-800 py-6">

            <h3 className="text-sm font-medium text-slate-300">
                {title}
            </h3>

            <div className="mt-3">

                {rows.map((row, index) => (
                    <div
                        key={row.label}
                        className={`flex items-center justify-between py-2.5 ${index !== rows.length - 1
                                ? "border-b border-slate-900"
                                : ""
                            }`}
                    >
                        <span className="text-sm text-slate-500">
                            {row.label}
                        </span>

                        <span
                            className={`text-sm font-medium ${row.valueClass || "text-slate-300"
                                }`}
                        >
                            {row.value}
                        </span>
                    </div>
                ))}

            </div>

        </div>
    );
};


export default AdminDashboard;