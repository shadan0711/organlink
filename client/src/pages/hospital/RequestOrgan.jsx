import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

const RequestOrgan = () => {
  const { organId } = useParams();
  const navigate = useNavigate();

  const [organ, setOrgan] = useState(null);

  const [formData, setFormData] = useState({
    patientReference: "",
    patientBloodGroup: "O+",
    urgency: "critical",
    message: "",
    lat: "28.6139",
    lng: "77.2090",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchOrgan = async () => {
      try {
        const response = await api.get(`/organs/${organId}`);

        setOrgan(response.data.organ);
      } catch (error) {
        console.error("Organ Error:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load organ."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrgan();
  }, [organId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/requests", {
        organId,

        patientReference:
          formData.patientReference,

        patientBloodGroup:
          formData.patientBloodGroup,

        urgency:
          formData.urgency,

        message:
          formData.message,

        location: {
          lat: Number(formData.lat),
          lng: Number(formData.lng),
        },
      });

      console.log(
        "Request created:",
        response.data
      );

      setSuccess(
        "Organ request submitted successfully."
      );

      setTimeout(() => {
        navigate("/hospital");
      }, 1500);

    } catch (error) {
      console.error(
        "Request Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to submit request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading organ...
      </div>
    );
  }

  if (!organ) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">
            {error || "Organ not found."}
          </p>

          <Link
            to="/hospital/find-organ"
            className="text-blue-400 hover:text-blue-300"
          >
            Back to Find Organ
          </Link>
        </div>
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
              Submit Organ Request
            </p>
          </div>

          <Link
            to="/hospital/find-organ"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            Back
          </Link>

        </div>
      </header>


      <main className="mx-auto max-w-4xl px-6 py-8">

        <div className="mb-8">
          <h2 className="text-3xl font-bold">
            Request Organ
          </h2>

          <p className="mt-2 text-slate-400">
            Submit a request to the organ bank.
          </p>
        </div>


        {/* Organ information */}
        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <h3 className="text-lg font-semibold">
            Selected Organ
          </h3>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">

            <InfoRow
              label="Organ"
              value={organ.organType}
            />

            <InfoRow
              label="Blood Group"
              value={organ.bloodGroup}
            />

            <InfoRow
              label="Provider"
              value={
                organ.provider?.name ||
                "Organ Bank"
              }
            />

            <InfoRow
              label="Location"
              value={
                organ.location?.city ||
                "Unknown"
              }
            />

          </div>

        </div>


        {/* Request form */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <h3 className="text-lg font-semibold">
            Patient Request Details
          </h3>

          {error && (
            <div className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-5 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-400">
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
          >

            {/* Patient reference */}
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Patient Reference
              </label>

              <input
                type="text"
                name="patientReference"
                value={
                  formData.patientReference
                }
                onChange={handleChange}
                placeholder="e.g. PAT-001"
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
              />

              <p className="mt-1 text-xs text-slate-500">
                Use a reference ID. Do not enter unnecessary personal information.
              </p>
            </div>


            {/* Blood group */}
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Patient Blood Group
              </label>

              <select
                name="patientBloodGroup"
                value={
                  formData.patientBloodGroup
                }
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
                <option value="low">
                  Low
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="high">
                  High
                </option>

                <option value="critical">
                  Critical
                </option>
              </select>
            </div>


            {/* Message */}
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Additional Message
              </label>

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                placeholder="Additional request information..."
                className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>


            {/* Location */}
            <div className="grid gap-5 md:grid-cols-2">

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
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>

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
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>

            </div>


            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Submitting Request..."
                : "Submit Organ Request"}
            </button>

          </form>

        </div>

      </main>

    </div>
  );
};


const InfoRow = ({ label, value }) => {
  return (
    <div className="flex justify-between border-b border-slate-800 pb-2">

      <span className="text-sm text-slate-400">
        {label}
      </span>

      <span className="text-sm font-medium capitalize">
        {value}
      </span>

    </div>
  );
};


export default RequestOrgan;