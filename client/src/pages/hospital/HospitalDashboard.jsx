import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const HospitalDashboard = () => {
    const { user, logout } = useAuth();

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await api.get("/dashboard/hospital");

                setStats(response.data.stats);
            } catch (error) {
                console.error("Dashboard Error:", error);

                setError(
                    error.response?.data?.message ||
                    "Unable to load dashboard"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    const handleLogout = () => {
        logout();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                Loading dashboard...
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error}</p>

                    <button
                        onClick={handleLogout}
                        className="rounded-lg bg-slate-800 px-5 py-2 text-sm hover:bg-slate-700"
                    >
                        Logout
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">

            {/* Navbar */}
            <header className="border-b border-slate-800 bg-slate-900">
                <div className="flex items-center justify-between px-6 py-4">

                    <div>
                        <h1 className="text-xl font-bold">
                            OrganLink
                        </h1>

                        <p className="text-xs text-slate-400">
                            Hospital Portal
                        </p>
                    </div>

                    <div className="flex items-center gap-4">

                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-medium">
                                Hospital
                            </p>

                            <p className="text-xs text-slate-400">
                                {user?.role}
                            </p>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
                        >
                            Logout
                        </button>

                    </div>

                </div>
            </header>


            {/* Main */}
            <main className="mx-auto max-w-7xl px-6 py-8">

                <div className="mb-8">
                    <h2 className="text-3xl font-bold">
                        Hospital Dashboard
                    </h2>

                    <p className="mt-2 text-slate-400">
                        Overview of your organ requests and transfers.
                    </p>

                    <a
                        href="/hospital/find-organ"
                        className="inline-block rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-500"
                    >
                        Find an Organ
                    </a>

                    <a
                        href="/hospital/transfers"
                        className="ml-3 mt-5 inline-block rounded-lg border border-slate-700 px-5 py-3 font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                    >
                        My Transfers
                    </a>
                </div>


                {/* Stats */}
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

                    <StatCard
                        title="Total Requests"
                        value={stats.totalRequests}
                    />

                    <StatCard
                        title="Pending Requests"
                        value={stats.pendingRequests}
                    />

                    <StatCard
                        title="Completed Requests"
                        value={stats.completedRequests}
                    />

                    <StatCard
                        title="Active Transfers"
                        value={stats.activeTransfers}
                    />

                </div>


                {/* Additional information */}
                <div className="mt-8 grid gap-5 md:grid-cols-2">

                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

                        <h3 className="text-lg font-semibold">
                            Request Overview
                        </h3>

                        <div className="mt-5 space-y-4">

                            <InfoRow
                                label="Total requests"
                                value={stats.totalRequests}
                            />

                            <InfoRow
                                label="Pending"
                                value={stats.pendingRequests}
                            />

                            <InfoRow
                                label="Approved"
                                value={stats.approvedRequests}
                            />

                            <InfoRow
                                label="Completed"
                                value={stats.completedRequests}
                            />

                        </div>

                    </div>


                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

                        <h3 className="text-lg font-semibold">
                            Transfer Overview
                        </h3>

                        <div className="mt-5 space-y-4">

                            <InfoRow
                                label="Active transfers"
                                value={stats.activeTransfers}
                            />

                            <InfoRow
                                label="Completed transfers"
                                value={stats.completedTransfers}
                            />

                        </div>

                    </div>

                </div>

            </main>

        </div>
    );
};


const StatCard = ({ title, value }) => {
    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <p className="text-sm text-slate-400">
                {title}
            </p>

            <p className="mt-3 text-3xl font-bold">
                {value}
            </p>

        </div>
    );
};


const InfoRow = ({ label, value }) => {
    return (
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 last:border-0">

            <span className="text-sm text-slate-400">
                {label}
            </span>

            <span className="font-semibold">
                {value}
            </span>

        </div>
    );
};


export default HospitalDashboard;