import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";


const Organizations = () => {
    const { logout } = useAuth();

    const [organizations, setOrganizations] = useState([]);
    const [activeTab, setActiveTab] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchOrganizations = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/organizations");

            setOrganizations(response.data.organizations || []);
        } catch (error) {
            console.error("Organizations Error:", error);

            setError(
                error.response?.data?.message ||
                "Failed to load organizations"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const filteredOrganizations = useMemo(() => {
        if (activeTab === "hospitals") {
            return organizations.filter(
                (organization) => organization.type === "hospital"
            );
        }

        if (activeTab === "organBanks") {
            return organizations.filter(
                (organization) => organization.type === "organBank"
            );
        }

        return organizations;
    }, [organizations, activeTab]);

    const getTypeLabel = (type) => {
        return type === "hospital"
            ? "Hospital"
            : "Organ Bank";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                <p className="text-slate-400">
                    Loading organizations...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">

            {/* Header */}
            <header className="border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">

                    <div>
                        <h1 className="text-2xl font-bold">
                            Organizations
                        </h1>

                        <p className="text-sm text-slate-400 mt-1">
                            Manage hospitals and organ banks
                        </p>
                    </div>

                    <div className="flex items-center gap-3">

                        <button
                            onClick={fetchOrganizations}
                            className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
                        >
                            Refresh
                        </button>

                        <button
                            onClick={logout}
                            className="px-4 py-2 rounded-lg bg-white text-black font-medium hover:bg-slate-200 transition"
                        >
                            Logout
                        </button>

                    </div>

                </div>
            </header>

            <main className="max-w-7xl mx-auto px-8 py-8">

                {/* Tabs */}
                <div className="flex items-center gap-2 mb-6">

                    <Tab
                        label="All Organizations"
                        active={activeTab === "all"}
                        onClick={() => setActiveTab("all")}
                    />

                    <Tab
                        label="Hospitals"
                        active={activeTab === "hospitals"}
                        onClick={() => setActiveTab("hospitals")}
                    />

                    <Tab
                        label="Organ Banks"
                        active={activeTab === "organBanks"}
                        onClick={() => setActiveTab("organBanks")}
                    />

                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
                        {error}
                    </div>
                )}

                {/* Results */}
                {filteredOrganizations.length === 0 ? (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center">

                        <p className="text-slate-400">
                            No organizations found.
                        </p>

                    </div>
                ) : (
                    <div className="space-y-4">

                        {filteredOrganizations.map((organization) => (

                            <OrganizationCard
                                key={organization._id}
                                organization={organization}
                                getTypeLabel={getTypeLabel}
                            />

                        ))}

                    </div>
                )}

            </main>

        </div>
    );
};


/* Organization Card */

const OrganizationCard = ({
    organization,
    getTypeLabel,
}) => {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                {/* Main information */}
                <div className="flex-1">

                    <div className="flex items-center gap-3 flex-wrap">

                        <h2 className="text-lg font-semibold">
                            {organization.name}
                        </h2>

                        <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-400">
                            {getTypeLabel(organization.type)}
                        </span>

                    </div>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2">

                        <Info
                            label="Registration"
                            value={organization.registrationNumber}
                        />

                        <Info
                            label="Contact Person"
                            value={organization.contactPerson}
                        />

                        <Info
                            label="Location"
                            value={`${organization.city}, ${organization.state}`}
                        />

                        <Info
                            label="Email"
                            value={organization.email}
                        />

                    </div>

                </div>

                {/* Status + View */}
                <div className="flex flex-col gap-3 lg:min-w-[150px]">

                    <div className="flex flex-row lg:flex-col gap-3">

                        <Status
                            label="Verified"
                            active={organization.isVerified}
                        />

                        <Status
                            label="Active"
                            active={organization.isActive}
                        />

                    </div>

                    <Link
                        to={`/admin/organizations/${organization._id}`}
                        className="text-center px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-slate-200 transition"
                    >
                        View Details
                    </Link>
                </div>

            </div>

        </div>
    );
};


/* Info */

const Info = ({ label, value }) => {
    return (
        <div>
            <span className="text-xs text-slate-500">
                {label}
            </span>

            <p className="text-sm text-slate-300 mt-0.5">
                {value || "—"}
            </p>
        </div>
    );
};


/* Status */

const Status = ({ label, active }) => {
    return (
        <div className="flex items-center gap-2">

            <span
                className={`w-2 h-2 rounded-full ${active
                    ? "bg-green-400"
                    : "bg-slate-600"
                    }`}
            />

            <span
                className={`text-xs ${active
                    ? "text-green-400"
                    : "text-slate-500"
                    }`}
            >
                {label}: {active ? "Yes" : "No"}
            </span>

        </div>
    );
};


/* Tab */

const Tab = ({
    label,
    active,
    onClick,
}) => {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-lg text-sm transition ${active
                ? "bg-white text-black"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                }`}
        >
            {label}
        </button>
    );
};


export default Organizations;