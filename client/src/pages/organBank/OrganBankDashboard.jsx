import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const OrganBankDashboard = () => {
    const { user, logout } = useAuth();

    const [stats, setStats] = useState(null);
    const [requests, setRequests] = useState([]);

    const [loading, setLoading] = useState(true);
    const [requestLoading, setRequestLoading] = useState(false);

    const [error, setError] = useState("");
    const [actionMessage, setActionMessage] = useState("");

    const fetchDashboard = async () => {
        try {
            const [dashboardResponse, requestsResponse] =
                await Promise.all([
                    api.get("/dashboard/organ-bank"),
                    api.get("/requests/received"),
                ]);

            setStats(dashboardResponse.data.stats);
            setRequests(requestsResponse.data.requests);
        } catch (error) {
            console.error("Organ Bank Dashboard Error:", error);

            setError(
                error.response?.data?.message ||
                "Unable to load dashboard."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const handleRequestStatus = async (
        requestId,
        status
    ) => {
        setRequestLoading(true);
        setError("");
        setActionMessage("");

        try {
            const response = await api.patch(
                `/requests/${requestId}/status`,
                {
                    status,
                }
            );

            setActionMessage(
                response.data.message
            );

            // Refresh dashboard data
            await fetchDashboard();

        } catch (error) {
            console.error(
                "Request Status Error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to update request."
            );
        } finally {
            setRequestLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                Loading dashboard...
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
                            Organ Bank Portal
                        </p>
                    </div>

                    <div className="flex items-center gap-4">

                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-medium">
                                Organ Bank
                            </p>

                            <p className="text-xs text-slate-400">
                                {user?.role}
                            </p>
                        </div>

                        <button
                            onClick={logout}
                            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
                        >
                            Logout
                        </button>

                    </div>

                </div>
            </header>


            <main className="mx-auto max-w-7xl px-6 py-8">

                {/* Heading */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold">
                        Organ Bank Dashboard
                    </h2>

                    <p className="mt-2 text-slate-400">
                        Manage organs, requests and transfers.
                    </p>

                    <div className="mt-5 flex gap-3">

                        <a
                            href="/organ-bank/transfers"
                            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-500"
                        >
                            Manage Transfers
                        </a>

                    </div>
                </div>


                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                        {error}
                    </div>
                )}


                {/* Success */}
                {actionMessage && (
                    <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-400">
                        {actionMessage}
                    </div>
                )}


                {/* Stats */}
                {stats && (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

                        <StatCard
                            title="Total Organs"
                            value={stats.totalOrgans}
                        />

                        <StatCard
                            title="Available Organs"
                            value={stats.availableOrgans}
                        />

                        <StatCard
                            title="Pending Requests"
                            value={stats.pendingRequests}
                        />

                        <StatCard
                            title="Active Transfers"
                            value={stats.activeTransfers}
                        />

                    </div>
                )}


                {/* Organ overview */}
                {stats && (
                    <div className="mt-8 grid gap-5 md:grid-cols-2">

                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

                            <h3 className="text-lg font-semibold">
                                Organ Inventory
                            </h3>

                            <div className="mt-5 space-y-4">

                                <InfoRow
                                    label="Available"
                                    value={stats.availableOrgans}
                                />

                                <InfoRow
                                    label="Reserved"
                                    value={stats.reservedOrgans}
                                />

                                <InfoRow
                                    label="Transferred"
                                    value={stats.transferredOrgans}
                                />

                                <InfoRow
                                    label="Expired"
                                    value={stats.expiredOrgans}
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
                )}


                {/* Requests */}
                <section className="mt-10">

                    <div className="mb-5 flex items-center justify-between">

                        <div>
                            <h3 className="text-2xl font-bold">
                                Pending Requests
                            </h3>

                            <p className="mt-1 text-sm text-slate-400">
                                Review requests submitted by hospitals.
                            </p>
                        </div>

                        <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
                            {requests.length}
                        </span>

                    </div>


                    {requests.length === 0 ? (
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">

                            <p className="text-lg font-medium">
                                No pending requests
                            </p>

                            <p className="mt-2 text-sm text-slate-400">
                                New hospital requests will appear here.
                            </p>

                        </div>
                    ) : (
                        <div className="space-y-5">

                            {requests.map((request) => (
                                <RequestCard
                                    key={request._id}
                                    request={request}
                                    onStatusChange={handleRequestStatus}
                                    disabled={requestLoading}
                                />
                            ))}

                        </div>
                    )}

                </section>

            </main>

        </div>
    );
};


const RequestCard = ({
    request,
    onStatusChange,
    disabled,
}) => {
    const organ = request.organ;

    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            {/* Top */}
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                <div>

                    <div className="flex items-center gap-3">

                        <h4 className="text-xl font-semibold capitalize">
                            {organ?.organType}
                        </h4>

                        <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400">
                            Pending
                        </span>

                    </div>

                    <p className="mt-2 text-sm text-slate-400">
                        Request ID: {request._id}
                    </p>

                </div>


                {/* Priority */}
                <div className="rounded-xl bg-blue-500/10 px-4 py-3 text-center">

                    <p className="text-2xl font-bold text-blue-400">
                        {request.priorityScore}
                    </p>

                    <p className="text-xs text-slate-400">
                        Priority Score
                    </p>

                </div>

            </div>


            {/* Information */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <InfoRow
                    label="Patient Ref."
                    value={request.patientReference}
                />

                <InfoRow
                    label="Blood Group"
                    value={request.patientBloodGroup}
                />

                <InfoRow
                    label="Urgency"
                    value={request.urgency}
                />

                <InfoRow
                    label="Hospital"
                    value={
                        request.requestingOrganization?.name ||
                        "Unknown"
                    }
                />

            </div>


            {/* Message */}
            {request.message && (
                <div className="mt-5 rounded-lg bg-slate-800/50 p-4">

                    <p className="text-xs text-slate-500">
                        Hospital Message
                    </p>

                    <p className="mt-1 text-sm text-slate-300">
                        {request.message}
                    </p>

                </div>
            )}


            {/* Priority breakdown */}
            {request.priorityDetails && (
                <div className="mt-5">

                    <p className="mb-3 text-sm font-medium text-slate-300">
                        Priority Breakdown
                    </p>

                    <div className="flex flex-wrap gap-2">

                        <ScoreBadge
                            label="Organ"
                            value={request.priorityDetails.organType}
                        />

                        <ScoreBadge
                            label="Blood"
                            value={request.priorityDetails.bloodGroup}
                        />

                        <ScoreBadge
                            label="Urgency"
                            value={request.priorityDetails.urgency}
                        />

                        <ScoreBadge
                            label="Location"
                            value={request.priorityDetails.location}
                        />

                        <ScoreBadge
                            label="Expiry"
                            value={request.priorityDetails.expiry}
                        />

                    </div>

                </div>
            )}


            {/* Actions */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">

                <button
                    onClick={() =>
                        onStatusChange(
                            request._id,
                            "rejected"
                        )
                    }
                    disabled={disabled}
                    className="rounded-lg border border-red-500/40 px-5 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Reject
                </button>

                <button
                    onClick={() =>
                        onStatusChange(
                            request._id,
                            "approved"
                        )
                    }
                    disabled={disabled}
                    className="rounded-lg bg-green-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Approve Request
                </button>

            </div>

        </div>
    );
};


const ScoreBadge = ({ label, value }) => {
    return (
        <span className="rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-300">
            {label}: {value}
        </span>
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
        <div className="flex flex-col border-b border-slate-800 pb-2">

            <span className="text-xs text-slate-500">
                {label}
            </span>

            <span className="mt-1 text-sm font-medium capitalize">
                {value}
            </span>

        </div>
    );
};


export default OrganBankDashboard;