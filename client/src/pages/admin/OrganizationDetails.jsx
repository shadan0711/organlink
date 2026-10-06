import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const OrganizationDetails = () => {
    const { organizationId } = useParams();
    const { logout } = useAuth();

    const [organization, setOrganization] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchOrganization = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/organizations/${organizationId}`
            );

            setOrganization(response.data.organization);
        } catch (error) {
            console.error("Organization Details Error:", error);

            setError(
                error.response?.data?.message ||
                "Failed to load organization"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganization();
    }, [organizationId]);

    const updateStatus = async (changes) => {
        try {
            setError("");

            const response = await api.patch(
                `/organizations/${organizationId}/status`,
                changes
            );

            setOrganization(response.data.organization);
        } catch (error) {
            console.error("Update Organization Status Error:", error);

            setError(
                error.response?.data?.message ||
                "Failed to update organization"
            );
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                <p className="text-slate-400">
                    Loading organization...
                </p>
            </div>
        );
    }

    if (error || !organization) {
        return (
            <div className="min-h-screen bg-slate-950 text-white p-8">
                <div className="max-w-4xl mx-auto">

                    <Link
                        to="/admin/organizations"
                        className="text-sm text-slate-400 hover:text-white"
                    >
                        ← Back to Organizations
                    </Link>

                    <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-5 text-red-400">
                        {error || "Organization not found"}
                    </div>

                </div>
            </div>
        );
    }

    const typeLabel =
        organization.type === "hospital"
            ? "Hospital"
            : "Organ Bank";

    return (
        <div className="min-h-screen bg-slate-950 text-white">

            {/* Header */}
            <header className="border-b border-slate-800">
                <div className="max-w-5xl mx-auto px-8 py-5 flex items-center justify-between">

                    <div>
                        <Link
                            to="/admin/organizations"
                            className="text-sm text-slate-500 hover:text-white transition"
                        >
                            ← Organizations
                        </Link>

                        <h1 className="text-2xl font-bold mt-2">
                            Organization Details
                        </h1>
                    </div>

                    <button
                        onClick={logout}
                        className="px-4 py-2 rounded-lg bg-white text-black font-medium hover:bg-slate-200 transition"
                    >
                        Logout
                    </button>

                </div>
            </header>

            <main className="max-w-5xl mx-auto px-8 py-8">

                {/* Organization Header */}
                <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                        <div>

                            <div className="flex items-center gap-3 flex-wrap">

                                <h2 className="text-2xl font-bold">
                                    {organization.name}
                                </h2>

                                <span className="text-xs px-3 py-1 rounded-md bg-slate-800 text-slate-400">
                                    {typeLabel}
                                </span>

                            </div>

                            <p className="text-sm text-slate-500 mt-2">
                                Registration: {organization.registrationNumber}
                            </p>

                        </div>

                        <div className="flex gap-4">

                            <Status
                                label="Verified"
                                active={organization.isVerified}
                            />

                            <Status
                                label="Active"
                                active={organization.isActive}
                            />

                        </div>

                        <div className="flex flex-wrap gap-3 mt-5">

                            <button
                                onClick={() =>
                                    updateStatus({
                                        isVerified: !organization.isVerified,
                                    })
                                }
                                className="px-4 py-2 rounded-lg border border-slate-700 text-sm text-slate-300 hover:bg-slate-800 transition"
                            >
                                {organization.isVerified
                                    ? "Unverify Organization"
                                    : "Verify Organization"}
                            </button>

                            <button
                                onClick={() => {
                                    if (
                                        organization.isActive &&
                                        !window.confirm(
                                            "Are you sure you want to deactivate this organization?"
                                        )
                                    ) {
                                        return;
                                    }

                                    updateStatus({
                                        isActive: !organization.isActive,
                                    });
                                }}
                                className={`px-4 py-2 rounded-lg text-sm transition ${organization.isActive
                                    ? "border border-red-500/20 text-red-400 hover:bg-red-500/10"
                                    : "border border-green-500/20 text-green-400 hover:bg-green-500/10"
                                    }`}
                            >
                                {organization.isActive
                                    ? "Deactivate Organization"
                                    : "Activate Organization"}
                            </button>

                        </div>

                    </div>

                </section>

                {/* Organization Information */}
                <section className="mt-6 bg-slate-900 border border-slate-800 rounded-xl p-6">

                    <h3 className="font-semibold">
                        Organization Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 mt-6">

                        <Info
                            label="Registration Number"
                            value={organization.registrationNumber}
                        />

                        <Info
                            label="Contact Person"
                            value={organization.contactPerson}
                        />

                        <Info
                            label="Email"
                            value={organization.email}
                        />

                        <Info
                            label="Phone"
                            value={organization.phone}
                        />

                    </div>

                </section>

                {/* Location */}
                <section className="mt-6 bg-slate-900 border border-slate-800 rounded-xl p-6">

                    <h3 className="font-semibold">
                        Location
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 mt-6">

                        <Info
                            label="Address"
                            value={organization.address}
                        />

                        <Info
                            label="City"
                            value={organization.city}
                        />

                        <Info
                            label="State"
                            value={organization.state}
                        />

                        <Info
                            label="Pincode"
                            value={organization.pincode}
                        />

                    </div>

                </section>

                {/* Account Information */}
                <section className="mt-6 bg-slate-900 border border-slate-800 rounded-xl p-6">

                    <h3 className="font-semibold">
                        Account Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 mt-6">

                        <Info
                            label="Created"
                            value={formatDate(organization.createdAt)}
                        />

                        <Info
                            label="Last Updated"
                            value={formatDate(organization.updatedAt)}
                        />

                    </div>

                </section>

            </main>
        </div>
    );
};


const Info = ({ label, value }) => {
    return (
        <div>
            <p className="text-xs text-slate-500">
                {label}
            </p>

            <p className="text-sm text-slate-300 mt-1">
                {value || "—"}
            </p>
        </div>
    );
};


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


const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};


export default OrganizationDetails;