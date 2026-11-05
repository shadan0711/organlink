
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import OrganBankLayout from "../../components/OrganBankLayout";

const OrganInventory = () => {

    const [organs, setOrgans] = useState([]);
    const [editingOrgan, setEditingOrgan] = useState(null);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState("");

    const [showAddForm, setShowAddForm] = useState(false);
    const [adding, setAdding] = useState(false);

    const [newOrgan, setNewOrgan] = useState({
        organType: "kidney",
        bloodGroup: "A+",
        expiresAt: "",
        location: {
            address: "",
            city: "",
            state: "",
            pincode: "",
        },
        description: "",
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [organType, setOrganType] = useState("");
    const [bloodGroup, setBloodGroup] = useState("");
    const [status, setStatus] = useState("");

    useEffect(() => {
        const fetchOrgans = async () => {
            try {
                setLoading(true);
                const response = await api.get("/organs");
                setOrgans(response.data.organs || []);
            } catch (error) {
                console.error("Inventory Error:", error);
                setError(
                    error.response?.data?.message ||
                    "Unable to load organ inventory."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchOrgans();
    }, []);

    const filteredOrgans = useMemo(() => {
        return organs.filter((organ) => {
            const matchesSearch =
                organ.organType?.toLowerCase().includes(search.toLowerCase()) ||
                organ.location?.city?.toLowerCase().includes(search.toLowerCase()) ||
                organ.location?.state?.toLowerCase().includes(search.toLowerCase());

            const matchesType =
                !organType || organ.organType === organType;

            const matchesBlood =
                !bloodGroup || organ.bloodGroup === bloodGroup;

            const matchesStatus =
                !status || organ.status === status;

            return matchesSearch && matchesType && matchesBlood && matchesStatus;
        });
    }, [organs, search, organType, bloodGroup, status]);

    const getStatusStyle = (value) => {
        const styles = {
            available: "bg-green-500/10 text-green-400",
            reserved: "bg-yellow-500/10 text-yellow-400",
            transferred: "bg-blue-500/10 text-blue-400",
            expired: "bg-red-500/10 text-red-400",
            cancelled: "bg-slate-700 text-slate-300",
        };

        return styles[value] || "bg-slate-700 text-slate-300";
    };

    const clearFilters = () => {
        setSearch("");
        setOrganType("");
        setBloodGroup("");
        setStatus("");
    };

    const handleEdit = (organ) => {
        setEditingOrgan({
            ...organ,
            expiresAt: organ.expiresAt
                ? new Date(organ.expiresAt).toISOString().slice(0, 16)
                : "",
        });

        setError("");
        setSuccess("");
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const { _id, organType, bloodGroup, location, expiresAt, description } = editingOrgan;

            const response = await api.patch(`/organs/${_id}`, {
                organType,
                bloodGroup,
                location,
                expiresAt,
                description,
            });

            setOrgans((prev) =>
                prev.map((organ) =>
                    organ._id === _id ? response.data.organ : organ
                )
            );

            setSuccess("Organ updated successfully.");
            setEditingOrgan(null);

        } catch (error) {
            setError(
                error.response?.data?.message || "Unable to update organ."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = async (organ) => {
        const confirmed = window.confirm(
            `Are you sure you want to cancel this ${organ.organType} record?`
        );

        if (!confirmed) return;

        try {
            setError("");
            setSuccess("");

            const response = await api.patch(
                `/organs/${organ._id}/cancel`
            );

            setOrgans((prev) =>
                prev.map((item) =>
                    item._id === organ._id ? response.data.organ : item
                )
            );

            setSuccess("Organ cancelled successfully.");

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to cancel organ."
            );
        }
    };

    const handleAddOrgan = async (e) => {
        e.preventDefault();

        try {
            setAdding(true);
            setError("");
            setSuccess("");

            const response = await api.post("/organs", newOrgan);

            setOrgans((prev) => [...prev, response.data.organ]);

            setNewOrgan({
                organType: "kidney",
                bloodGroup: "A+",
                expiresAt: "",
                location: {
                    address: "",
                    city: "",
                    state: "",
                    pincode: "",
                },
                description: "",
            });

            setShowAddForm(false);
            setSuccess("Organ added successfully.");
        } catch (error) {
            setError(error.response?.data?.message || "Unable to add organ.");
        } finally {
            setAdding(false);
        }
    };

    return (
        <OrganBankLayout>


            <main className="mx-auto max-w-7xl px-6 py-8">

                {/* Page Heading */}
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <Link
                            to="/organ-bank"
                            className="text-sm text-blue-400 hover:text-blue-300"
                        >
                            ← Back to Dashboard
                        </Link>

                        <h2 className="mt-3 text-3xl font-bold">
                            Organ Inventory
                        </h2>

                        <p className="mt-2 text-slate-400">
                            View and manage your organization's organ records.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setShowAddForm((prev) => !prev);
                            setError("");
                            setSuccess("");
                        }}
                        className="rounded-lg bg-green-600 px-5 py-3 font-medium text-white hover:bg-green-500"
                    >
                        {showAddForm ? "Close Form" : "+ Add Organ"}
                    </button>
                </div>

                {/* Summary */}
                <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[
                        { label: "Total", value: organs.length },
                        {
                            label: "Available",
                            value: organs.filter(o => o.status === "available").length,
                        },
                        {
                            label: "Reserved",
                            value: organs.filter(o => o.status === "reserved").length,
                        },
                        {
                            label: "Transferred",
                            value: organs.filter(o => o.status === "transferred").length,
                        },
                    ].map((item) => (
                        <div
                            key={item.label}
                            className="rounded-xl border border-slate-800 bg-slate-900 p-5"
                        >
                            <p className="text-sm text-slate-400">
                                {item.label}
                            </p>
                            <p className="mt-2 text-2xl font-bold">
                                {item.value}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search organ or location..."
                            className="rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-blue-500"
                        />

                        <select
                            value={organType}
                            onChange={(e) => setOrganType(e.target.value)}
                            className="rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
                        >
                            <option value="">All Organ Types</option>
                            {["kidney", "liver", "heart", "lung", "pancreas", "cornea"].map(type => (
                                <option key={type} value={type}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </option>
                            ))}
                        </select>

                        <select
                            value={bloodGroup}
                            onChange={(e) => setBloodGroup(e.target.value)}
                            className="rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
                        >
                            <option value="">All Blood Groups</option>
                            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(group => (
                                <option key={group} value={group}>
                                    {group}
                                </option>
                            ))}
                        </select>

                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
                        >
                            <option value="">All Statuses</option>
                            {["available", "reserved", "transferred", "expired", "cancelled"].map(value => (
                                <option key={value} value={value}>
                                    {value.charAt(0).toUpperCase() + value.slice(1)}
                                </option>
                            ))}
                        </select>

                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-slate-400">
                            Showing {filteredOrgans.length} of {organs.length} records
                        </p>

                        <button
                            onClick={clearFilters}
                            className="text-sm text-blue-400 hover:text-blue-300"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
                        {error}
                    </div>
                )}

                {showAddForm && (
                    <div className="mb-6 rounded-2xl border border-slate-700 bg-slate-900 p-6">
                        <h3 className="mb-5 text-xl font-semibold">Add New Organ</h3>

                        <form onSubmit={handleAddOrgan}>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">Organ Type</label>
                                    <select
                                        required
                                        value={newOrgan.organType}
                                        onChange={(e) => setNewOrgan({ ...newOrgan, organType: e.target.value })}
                                        className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
                                    >
                                        {["kidney", "liver", "heart", "lung", "pancreas", "cornea"].map((type) => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">Blood Group</label>
                                    <select
                                        required
                                        value={newOrgan.bloodGroup}
                                        onChange={(e) => setNewOrgan({ ...newOrgan, bloodGroup: e.target.value })}
                                        className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
                                    >
                                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => (
                                            <option key={group} value={group}>{group}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">Address</label>
                                    <input
                                        required
                                        value={newOrgan.location.address}
                                        onChange={(e) => setNewOrgan({
                                            ...newOrgan,
                                            location: { ...newOrgan.location, address: e.target.value },
                                        })}
                                        className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
                                        placeholder="Enter address"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">City</label>
                                    <input
                                        required
                                        value={newOrgan.location.city}
                                        onChange={(e) => setNewOrgan({
                                            ...newOrgan,
                                            location: { ...newOrgan.location, city: e.target.value },
                                        })}
                                        className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
                                        placeholder="Enter city"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">State</label>
                                    <input
                                        required
                                        value={newOrgan.location.state}
                                        onChange={(e) => setNewOrgan({
                                            ...newOrgan,
                                            location: { ...newOrgan.location, state: e.target.value },
                                        })}
                                        className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
                                        placeholder="Enter state"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">Pincode</label>
                                    <input
                                        required
                                        value={newOrgan.location.pincode}
                                        onChange={(e) => setNewOrgan({
                                            ...newOrgan,
                                            location: { ...newOrgan.location, pincode: e.target.value },
                                        })}
                                        className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
                                        placeholder="Enter pincode"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm text-slate-300">Expiry Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        min={new Date().toISOString().slice(0, 16)}
                                        value={newOrgan.expiresAt}
                                        onChange={(e) => setNewOrgan({ ...newOrgan, expiresAt: e.target.value })}
                                        className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm text-slate-300">Description</label>
                                    <textarea
                                        rows="3"
                                        value={newOrgan.description}
                                        onChange={(e) => setNewOrgan({ ...newOrgan, description: e.target.value })}
                                        className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
                                        placeholder="Optional description"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    className="rounded-lg border border-slate-600 px-5 py-2 text-slate-300 hover:bg-slate-800"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={adding}
                                    className="rounded-lg bg-green-600 px-5 py-2 font-medium text-white hover:bg-green-500 disabled:opacity-50"
                                >
                                    {adding ? "Adding..." : "Add Organ"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Edit Organ Form */}
                {editingOrgan && (
                    <div className="mb-6 rounded-2xl border border-slate-700 bg-slate-900 p-6">
                        <div className="mb-5 flex items-center justify-between">
                            <h3 className="text-xl font-semibold">Edit Organ Details</h3>

                            <button
                                onClick={() => setEditingOrgan(null)}
                                className="text-slate-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleUpdate}>
                            <div className="grid gap-4 md:grid-cols-2">

                                <div>
                                    <label className="mb-2 block text-sm text-slate-400">
                                        Organ Type
                                    </label>
                                    <select
                                        value={editingOrgan.organType}
                                        onChange={(e) =>
                                            setEditingOrgan({
                                                ...editingOrgan,
                                                organType: e.target.value,
                                            })
                                        }
                                        className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
                                    >
                                        {["kidney", "liver", "heart", "lung", "pancreas", "cornea"].map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm text-slate-400">
                                        Blood Group
                                    </label>
                                    <select
                                        value={editingOrgan.bloodGroup}
                                        onChange={(e) =>
                                            setEditingOrgan({
                                                ...editingOrgan,
                                                bloodGroup: e.target.value,
                                            })
                                        }
                                        className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
                                    >
                                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(group => (
                                            <option key={group} value={group}>{group}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm text-slate-400">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        value={editingOrgan.location?.city || ""}
                                        onChange={(e) =>
                                            setEditingOrgan({
                                                ...editingOrgan,
                                                location: {
                                                    ...editingOrgan.location,
                                                    city: e.target.value,
                                                },
                                            })
                                        }
                                        className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm text-slate-400">
                                        State
                                    </label>
                                    <input
                                        type="text"
                                        value={editingOrgan.location?.state || ""}
                                        onChange={(e) =>
                                            setEditingOrgan({
                                                ...editingOrgan,
                                                location: {
                                                    ...editingOrgan.location,
                                                    state: e.target.value,
                                                },
                                            })
                                        }
                                        className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm text-slate-400">
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        value={editingOrgan.location?.address || ""}
                                        onChange={(e) =>
                                            setEditingOrgan({
                                                ...editingOrgan,
                                                location: {
                                                    ...editingOrgan.location,
                                                    address: e.target.value,
                                                },
                                            })
                                        }
                                        className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm text-slate-400">
                                        Pincode
                                    </label>
                                    <input
                                        type="text"
                                        value={editingOrgan.location?.pincode || ""}
                                        onChange={(e) =>
                                            setEditingOrgan({
                                                ...editingOrgan,
                                                location: {
                                                    ...editingOrgan.location,
                                                    pincode: e.target.value,
                                                },
                                            })
                                        }
                                        className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm text-slate-400">
                                        Expiry Date
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={editingOrgan.expiresAt}
                                        onChange={(e) =>
                                            setEditingOrgan({
                                                ...editingOrgan,
                                                expiresAt: e.target.value,
                                            })
                                        }
                                        className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm text-slate-400">
                                        Description
                                    </label>
                                    <textarea
                                        rows="3"
                                        value={editingOrgan.description || ""}
                                        onChange={(e) =>
                                            setEditingOrgan({
                                                ...editingOrgan,
                                                description: e.target.value,
                                            })
                                        }
                                        className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white"
                                    />
                                </div>

                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingOrgan(null)}
                                    className="rounded-lg border border-slate-700 px-5 py-2 text-slate-300 hover:bg-slate-800"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-500 disabled:opacity-50"
                                >
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Inventory Table */}
                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">

                    {loading ? (
                        <div className="p-12 text-center text-slate-400">
                            Loading inventory...
                        </div>
                    ) : filteredOrgans.length === 0 ? (
                        <div className="p-12 text-center">
                            <h3 className="text-lg font-semibold">
                                No organs found
                            </h3>
                            <p className="mt-2 text-sm text-slate-400">
                                Try changing your search or filters.
                            </p>
                        </div>
                    ) : (
                        <table className="w-full min-w-[850px] text-left text-sm">

                            <thead className="border-b border-slate-800 bg-slate-800/60 text-slate-400">
                                <tr>
                                    <th className="px-5 py-4">Organ</th>
                                    <th className="px-5 py-4">Blood Group</th>
                                    <th className="px-5 py-4">Location</th>
                                    <th className="px-5 py-4">Expiry Date</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-800">
                                {filteredOrgans.map((organ) => (
                                    <tr
                                        key={organ._id}
                                        className="transition hover:bg-slate-800/40"
                                    >
                                        <td className="px-5 py-4 font-medium capitalize">
                                            {organ.organType}
                                        </td>

                                        <td className="px-5 py-4">
                                            {organ.bloodGroup}
                                        </td>

                                        <td className="px-5 py-4 text-slate-300">
                                            {organ.location?.city || "N/A"},{" "}
                                            {organ.location?.state || ""}
                                        </td>

                                        <td className="px-5 py-4 text-slate-300">
                                            {organ.expiresAt
                                                ? new Date(organ.expiresAt).toLocaleString()
                                                : "N/A"}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusStyle(organ.status)}`}
                                            >
                                                {organ.status}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            {organ.status === "available" ? (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(organ)}
                                                        className="rounded-lg border border-blue-500/30 px-3 py-1.5 text-sm text-blue-400 hover:bg-blue-500/10"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() => handleCancel(organ)}
                                                        className="rounded-lg border border-red-500/30 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-500">
                                                    Not editable
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    )}

                </div>

            </main>
        </OrganBankLayout>
    );
};

export default OrganInventory;
