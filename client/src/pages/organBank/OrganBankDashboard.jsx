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

    const [showOrganForm, setShowOrganForm] = useState(false);
    const [organLoading, setOrganLoading] = useState(false);

    const [organForm, setOrganForm] = useState({
        organType: "",
        bloodGroup: "",
        expiresAt: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        description: "",
    });

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

    const handleAddOrgan = async (e) => {
        e.preventDefault();

        setOrganLoading(true);
        setError("");
        setActionMessage("");

        try {
            const payload = {
                organType: organForm.organType,
                bloodGroup: organForm.bloodGroup,
                expiresAt: new Date(organForm.expiresAt).toISOString(),
                location: {
                    address: organForm.address,
                    city: organForm.city,
                    state: organForm.state,
                    pincode: organForm.pincode,
                },
                description: organForm.description,
            };

            const response = await api.post("/organs", payload);

            setActionMessage(response.data.message);

            setOrganForm({
                organType: "",
                bloodGroup: "",
                expiresAt: "",
                address: "",
                city: "",
                state: "",
                pincode: "",
                description: "",
            });

            setShowOrganForm(false);

            await fetchDashboard();

        } catch (error) {
            console.error("Add Organ Error:", error);

            setError(
                error.response?.data?.message ||
                "Unable to add organ."
            );
        } finally {
            setOrganLoading(false);
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

                    <div className="mt-5 flex flex-wrap gap-3">

                        <button
                            onClick={() => setShowOrganForm(!showOrganForm)}
                            className="rounded-lg bg-green-600 px-5 py-3 font-medium text-white transition hover:bg-green-500"
                        >
                            {showOrganForm ? "Close Form" : "+ Add Organ"}
                        </button>

                        <a
                            href="/organ-bank/transfers"
                            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-500"
                        >
                            Manage Transfers
                        </a>

                    </div>

                    {showOrganForm && (
                        <form
                            onSubmit={handleAddOrgan}
                            className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6"
                        >
                            <h3 className="mb-5 text-xl font-semibold">
                                Add New Organ
                            </h3>

                            <div className="grid gap-5 sm:grid-cols-2">

                                {/* Organ Type */}
                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">
                                        Organ Type
                                    </label>

                                    <select
                                        required
                                        value={organForm.organType}
                                        onChange={(e) =>
                                            setOrganForm({ ...organForm, organType: e.target.value })
                                        }
                                        className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
                                    >
                                        <option value="">Select organ</option>
                                        {["kidney", "liver", "heart", "lung", "pancreas", "cornea"].map((organ) => (
                                            <option key={organ} value={organ}>
                                                {organ.charAt(0).toUpperCase() + organ.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Blood Group */}
                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">
                                        Blood Group
                                    </label>

                                    <select
                                        required
                                        value={organForm.bloodGroup}
                                        onChange={(e) =>
                                            setOrganForm({ ...organForm, bloodGroup: e.target.value })
                                        }
                                        className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
                                    >
                                        <option value="">Select blood group</option>
                                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => (
                                            <option key={group} value={group}>
                                                {group}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Expiry */}
                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">
                                        Expiry Date & Time
                                    </label>

                                    <input
                                        type="datetime-local"
                                        required
                                        min={new Date().toISOString().slice(0, 16)}
                                        value={organForm.expiresAt}
                                        onChange={(e) =>
                                            setOrganForm({ ...organForm, expiresAt: e.target.value })
                                        }
                                        className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
                                    />
                                </div>

                                {/* Address */}
                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">
                                        Address
                                    </label>

                                    <input
                                        type="text"
                                        required
                                        value={organForm.address}
                                        onChange={(e) =>
                                            setOrganForm({ ...organForm, address: e.target.value })
                                        }
                                        placeholder="Hospital address"
                                        className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
                                    />
                                </div>

                                {/* City */}
                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">
                                        City
                                    </label>

                                    <input
                                        type="text"
                                        required
                                        value={organForm.city}
                                        onChange={(e) =>
                                            setOrganForm({ ...organForm, city: e.target.value })
                                        }
                                        placeholder="City"
                                        className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
                                    />
                                </div>

                                {/* State */}
                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">
                                        State
                                    </label>

                                    <input
                                        type="text"
                                        required
                                        value={organForm.state}
                                        onChange={(e) =>
                                            setOrganForm({ ...organForm, state: e.target.value })
                                        }
                                        placeholder="State"
                                        className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
                                    />
                                </div>

                                {/* Pincode */}
                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">
                                        Pincode
                                    </label>

                                    <input
                                        type="text"
                                        required
                                        value={organForm.pincode}
                                        onChange={(e) =>
                                            setOrganForm({ ...organForm, pincode: e.target.value })
                                        }
                                        placeholder="Pincode"
                                        className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
                                    />
                                </div>

                            </div>

                            {/* Description */}
                            <div className="mt-5">
                                <label className="mb-2 block text-sm text-slate-300">
                                    Description (Optional)
                                </label>

                                <textarea
                                    rows="3"
                                    value={organForm.description}
                                    onChange={(e) =>
                                        setOrganForm({ ...organForm, description: e.target.value })
                                    }
                                    placeholder="Additional information..."
                                    className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
                                />
                            </div>

                            {/* Submit */}
                            <div className="mt-6 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={organLoading}
                                    className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition hover:bg-green-500 disabled:opacity-50"
                                >
                                    {organLoading ? "Adding Organ..." : "Add Organ"}
                                </button>
                            </div>

                        </form>
                    )}

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