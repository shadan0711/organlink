import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const ManageTransfers = () => {
    const [transfers, setTransfers] = useState([]);
    const [filter, setFilter] = useState("active");

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchTransfers = async () => {
        try {
            const response = await api.get("/transfers/my");

            setTransfers(response.data.transfers);
        } catch (error) {
            console.error(
                "Transfer Fetch Error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to load transfers."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransfers();
    }, []);

    const updateTransferStatus = async (
        transferId,
        status
    ) => {
        setActionLoading(transferId);
        setError("");
        setSuccess("");

        try {
            const response = await api.patch(
                `/transfers/${transferId}/status`,
                {
                    status,
                }
            );

            setSuccess(
                response.data.message
            );

            await fetchTransfers();
        } catch (error) {
            console.error(
                "Transfer Status Error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to update transfer."
            );
        } finally {
            setActionLoading(null);
        }
    };

    const filteredTransfers = transfers.filter(
        (transfer) => {
            if (filter === "active") {
                return (
                    transfer.status === "initiated" ||
                    transfer.status === "in_transit"
                );
            }

            if (filter === "history") {
                return (
                    transfer.status === "delivered" ||
                    transfer.status === "cancelled"
                );
            }

            return true;
        }
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
                Loading transfers...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">

            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-900">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

                    <div>
                        <h1 className="text-xl font-bold">
                            OrganLink
                        </h1>

                        <p className="text-xs text-slate-400">
                            Transfer Management
                        </p>
                    </div>

                    <Link
                        to="/organ-bank"
                        className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                    >
                        Dashboard
                    </Link>

                </div>
            </header>


            <main className="mx-auto max-w-6xl px-6 py-8">

                {/* Heading */}
                <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

                    <div>
                        <h2 className="text-3xl font-bold">
                            Transfer Management
                        </h2>

                        <p className="mt-2 text-slate-400">
                            Manage approved organ transfers.
                        </p>
                    </div>


                    <div>
                        <label className="mb-2 block text-xs text-slate-500">
                            Transfer View
                        </label>

                        <select
                            value={filter}
                            onChange={(e) =>
                                setFilter(e.target.value)
                            }
                            className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500"
                        >
                            <option value="active">
                                Active Transfers
                            </option>

                            <option value="history">
                                Transfer History
                            </option>

                            <option value="all">
                                All Transfers
                            </option>
                        </select>
                    </div>

                </div>


                {/* Messages */}
                {error && (
                    <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-400">
                        {success}
                    </div>
                )}


                <p className="mb-4 text-sm text-slate-500">
                    Showing {filteredTransfers.length} transfer
                    {filteredTransfers.length !== 1 ? "s" : ""}
                </p>


                {/* Empty state */}
                {filteredTransfers.length === 0 && (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">

                        <p className="text-lg font-medium">
                            No transfers found
                        </p>

                        <p className="mt-2 text-sm text-slate-400">
                            Transfers in this category will appear here.
                        </p>

                    </div>
                )}


                {/* Transfers */}
                <div className="space-y-6">

                    {filteredTransfers.map(
                        (transfer) => (
                            <TransferCard
                                key={transfer._id}
                                transfer={transfer}
                                loading={
                                    actionLoading ===
                                    transfer._id
                                }
                                onUpdate={
                                    updateTransferStatus
                                }
                            />
                        )
                    )}

                </div>

            </main>

        </div>
    );
};


const TransferCard = ({
    transfer,
    loading,
    onUpdate,
}) => {

    const canStart =
        transfer.status === "initiated";

    const canDeliver =
        transfer.status === "in_transit";

    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                <div>
                    <h3 className="text-xl font-semibold capitalize">
                        {transfer.organ?.organType}
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                        Blood Group:{" "}
                        {transfer.organ?.bloodGroup}
                    </p>
                </div>

                <span
                    className={`rounded-full px-3 py-1 text-sm capitalize ${transfer.status === "initiated"
                            ? "bg-blue-500/10 text-blue-400"
                            : transfer.status === "in_transit"
                                ? "bg-yellow-500/10 text-yellow-400"
                                : transfer.status === "delivered"
                                    ? "bg-green-500/10 text-green-400"
                                    : "bg-red-500/10 text-red-400"
                        }`}
                >
                    {transfer.status.replace("_", " ")}
                </span>

            </div>


            {/* Organizations */}
            <div className="mt-6 grid gap-5 sm:grid-cols-2">

                <div className="rounded-lg bg-slate-800/50 p-4">

                    <p className="text-xs text-slate-500">
                        From
                    </p>

                    <p className="mt-1 font-medium">
                        {transfer.fromOrganization?.name}
                    </p>

                    <p className="text-sm text-slate-400">
                        {transfer.fromOrganization?.city}
                    </p>

                </div>


                <div className="rounded-lg bg-slate-800/50 p-4">

                    <p className="text-xs text-slate-500">
                        To
                    </p>

                    <p className="mt-1 font-medium">
                        {transfer.toOrganization?.name}
                    </p>

                    <p className="text-sm text-slate-400">
                        {transfer.toOrganization?.city}
                    </p>

                </div>

            </div>


            {/* Timeline */}
            <TransferTimeline
                status={transfer.status}
            />


            {/* Request information */}
            {transfer.request && (
                <div className="mt-7 border-t border-slate-800 pt-5">

                    <div className="grid gap-4 sm:grid-cols-3">

                        <InfoRow
                            label="Patient Reference"
                            value={
                                transfer.request
                                    .patientReference
                            }
                        />

                        <InfoRow
                            label="Urgency"
                            value={
                                transfer.request.urgency
                            }
                        />

                        <InfoRow
                            label="Transfer ID"
                            value={transfer._id}
                        />

                    </div>

                </div>
            )}


            {/* Actions */}
            {(canStart || canDeliver) && (
                <div className="mt-6 flex justify-end">

                    {canStart && (
                        <button
                            onClick={() =>
                                onUpdate(
                                    transfer._id,
                                    "in_transit"
                                )
                            }
                            disabled={loading}
                            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading
                                ? "Updating..."
                                : "Mark In Transit"}
                        </button>
                    )}


                    {canDeliver && (
                        <button
                            onClick={() =>
                                onUpdate(
                                    transfer._id,
                                    "delivered"
                                )
                            }
                            disabled={loading}
                            className="rounded-lg bg-green-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading
                                ? "Updating..."
                                : "Mark Delivered"}
                        </button>
                    )}

                </div>
            )}

        </div>
    );
};


const TransferTimeline = ({ status }) => {

    const completed =
        status === "delivered";

    const inTransit =
        status === "in_transit" ||
        status === "delivered";

    return (
        <div className="mt-8">

            <div className="relative">

                {/* Base line */}
                <div className="absolute left-[12.5%] right-[12.5%] top-5 h-1 bg-slate-800" />

                {/* Active line */}
                {status !== "initiated" && (
                    <div
                        className={`absolute left-[12.5%] top-5 h-1 bg-blue-600 ${completed
                                ? "right-[12.5%]"
                                : "w-[25%]"
                            }`}
                    />
                )}

                {/* Points */}
                <div className="relative grid grid-cols-4">

                    {[1, 2, 3, 4].map(
                        (number) => (
                            <div
                                key={number}
                                className="flex justify-center"
                            >

                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${(
                                            status === "initiated" &&
                                            number === 1
                                        ) ||
                                            (
                                                status === "in_transit" &&
                                                number <= 2
                                            ) ||
                                            completed
                                            ? "bg-blue-600 text-white"
                                            : "bg-slate-800 text-slate-500"
                                        }`}
                                >
                                    {number}
                                </div>

                            </div>
                        )
                    )}

                </div>


                {/* Labels */}
                <div className="relative mt-3 h-6">

                    <span className="absolute left-[25%] -translate-x-1/2 text-xs text-slate-400">
                        Initiated
                    </span>

                    <span className="absolute left-[50%] -translate-x-1/2 text-xs text-slate-400">
                        In Transit
                    </span>

                    <span className="absolute left-[75%] -translate-x-1/2 text-xs text-slate-400">
                        Delivered
                    </span>

                </div>

            </div>

        </div>
    );
};


const InfoRow = ({ label, value }) => {
    return (
        <div>

            <p className="text-xs text-slate-500">
                {label}
            </p>

            <p className="mt-1 break-all text-sm font-medium capitalize">
                {value}
            </p>

        </div>
    );
};


export default ManageTransfers;