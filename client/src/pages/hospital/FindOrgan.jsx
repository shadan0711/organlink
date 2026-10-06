import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const FindOrgan = () => {
    const [formData, setFormData] = useState({
        organType: "kidney",
        bloodGroup: "O+",
        urgency: "high",
        lat: "",
        lng: "",
    });

    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSearch = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");
        setSearched(true);

        try {
            const response = await api.post("/matching", {
                organType: formData.organType,
                bloodGroup: formData.bloodGroup,
                urgency: formData.urgency,
                location: {
                    lat: Number(formData.lat),
                    lng: Number(formData.lng),
                },
            });

            setMatches(response.data.matches);
        } catch (error) {
            console.error("Matching Error:", error);

            setMatches([]);

            setError(
                error.response?.data?.message ||
                "Unable to find matching organs."
            );
        } finally {
            setLoading(false);
        }
    };

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
                            Find Available Organs
                        </p>
                    </div>

                    <a
                        href="/hospital"
                        className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                    >
                        Dashboard
                    </a>

                </div>
            </header>


            <main className="mx-auto max-w-7xl px-6 py-8">

                <div className="mb-8">
                    <h2 className="text-3xl font-bold">
                        Find an Organ
                    </h2>

                    <p className="mt-2 text-slate-400">
                        Search available organs using the OrganLink matching engine.
                    </p>
                </div>


                {/* Search Form */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

                    <form
                        onSubmit={handleSearch}
                        className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
                    >

                        {/* Organ */}
                        <div>
                            <label className="mb-2 block text-sm text-slate-300">
                                Organ Type
                            </label>

                            <select
                                name="organType"
                                value={formData.organType}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white"
                            >
                                <option value="kidney">Kidney</option>
                                <option value="liver">Liver</option>
                                <option value="heart">Heart</option>
                                <option value="lung">Lung</option>
                                <option value="pancreas">Pancreas</option>
                                <option value="cornea">Cornea</option>
                            </select>
                        </div>


                        {/* Blood */}
                        <div>
                            <label className="mb-2 block text-sm text-slate-300">
                                Patient Blood Group
                            </label>

                            <select
                                name="bloodGroup"
                                value={formData.bloodGroup}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white"
                            >
                                <option>A+</option>
                                <option>A-</option>
                                <option>B+</option>
                                <option>B-</option>
                                <option>AB+</option>
                                <option>AB-</option>
                                <option>O+</option>
                                <option>O-</option>
                            </select>
                        </div>


                        {/* Urgency */}
                        <div>
                            <label className="mb-2 block text-sm text-slate-300">
                                Urgency
                            </label>

                            <select
                                name="urgency"
                                value={formData.urgency}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>


                        {/* Latitude */}
                        <div>
                            <label className="mb-2 block text-sm text-slate-300">
                                Hospital Latitude
                            </label>

                            <input
                                type="number"
                                step="any"
                                name="lat"
                                value={formData.lat}
                                onChange={handleChange}
                                placeholder="e.g. 28.6139"
                                required
                                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
                            />
                        </div>


                        {/* Longitude */}
                        <div>
                            <label className="mb-2 block text-sm text-slate-300">
                                Hospital Longitude
                            </label>

                            <input
                                type="number"
                                step="any"
                                name="lng"
                                value={formData.lng}
                                onChange={handleChange}
                                placeholder="e.g. 77.2090"
                                required
                                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
                            />
                        </div>


                        {/* Button */}
                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-lg bg-blue-600 px-5 py-3 font-medium transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading
                                    ? "Finding..."
                                    : "Find Matching Organs"}
                            </button>
                        </div>

                    </form>

                </div>


                {/* Error */}
                {error && (
                    <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
                        {error}
                    </div>
                )}


                {/* Results */}
                {searched && !loading && !error && (
                    <div className="mt-8">

                        <div className="mb-5 flex items-center justify-between">

                            <h3 className="text-xl font-semibold">
                                Matching Organs
                            </h3>

                            <span className="text-sm text-slate-400">
                                {matches.length} match
                                {matches.length !== 1 ? "es" : ""}
                            </span>

                        </div>


                        {matches.length === 0 ? (
                            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">

                                <p className="text-lg font-medium">
                                    No matching organs found
                                </p>

                                <p className="mt-2 text-sm text-slate-400">
                                    Try different search criteria.
                                </p>

                            </div>
                        ) : (
                            <div className="grid gap-5 md:grid-cols-2">

                                {matches.map((match) => (
                                    <MatchCard
                                        key={match.organ._id}
                                        match={match}
                                    />
                                ))}

                            </div>
                        )}

                    </div>
                )}

            </main>

        </div>
    );
};


const MatchCard = ({ match }) => {
    const organ = match.organ;

    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="flex items-start justify-between">

                <div>
                    <h4 className="text-xl font-semibold capitalize">
                        {organ.organType}
                    </h4>

                    <p className="mt-1 text-sm text-slate-400">
                        Blood Group: {organ.bloodGroup}
                    </p>
                </div>

                <div className="rounded-lg bg-blue-500/10 px-3 py-2 text-center">

                    <p className="text-2xl font-bold text-blue-400">
                        {match.score}
                    </p>

                    <p className="text-xs text-slate-400">
                        Match Score
                    </p>

                </div>

            </div>


            <div className="mt-6 space-y-3">

                <InfoRow
                    label="Provider"
                    value={organ.provider?.name || "Organ Bank"}
                />

                <InfoRow
                    label="Location"
                    value={organ.location?.city || "Unknown"}
                />

                <InfoRow
                    label="Distance"
                    value={`${match.distanceKm} km`}
                />

                <InfoRow
                    label="Expires"
                    value={new Date(
                        organ.expiresAt
                    ).toLocaleString()}
                />
            </div>

            <Link
                to={`/hospital/request-organ/${organ._id}`}
                className="mt-6 block w-full rounded-lg bg-blue-600 px-5 py-3 text-center font-medium text-white transition hover:bg-blue-500"
            >
                Request This Organ
            </Link>

        </div>
    );
};


const InfoRow = ({ label, value }) => {
    return (
        <div className="flex justify-between border-b border-slate-800 pb-2">

            <span className="text-sm text-slate-400">
                {label}
            </span>

            <span className="text-sm font-medium">
                {value}
            </span>

        </div>
    );
};


export default FindOrgan;