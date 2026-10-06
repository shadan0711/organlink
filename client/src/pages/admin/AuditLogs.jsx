import { useEffect, useState } from "react";
import { Link } from "react-router-dom";


const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [entityType, setEntityType] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const query = entityType
        ? `?entityType=${entityType}&limit=15`
        : "?limit=15";

      const response = await fetch(
        `http://localhost:5001/api/audit${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch audit logs"
        );
      }

      setLogs(data.logs || []);
    } catch (error) {
      console.error("Fetch Audit Logs Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [entityType]);

  const formatAction = (action) => {
    return action
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatEntityType = (type) => {
    return type
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getActionDot = (action) => {
    if (
      action.includes("APPROVED") ||
      action.includes("DELIVERED") ||
      action.includes("COMPLETED")
    ) {
      return "bg-emerald-400";
    }

    if (
      action.includes("REJECTED") ||
      action.includes("CANCELLED")
    ) {
      return "bg-red-400";
    }

    if (
      action.includes("UPDATED") ||
      action.includes("IN_TRANSIT")
    ) {
      return "bg-blue-400";
    }

    return "bg-slate-400";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isToday = (date) => {
    const today = new Date();
    const logDate = new Date(date);

    return (
      today.toDateString() === logDate.toDateString()
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] p-6 md:p-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm text-slate-400">
            Loading audit logs...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] p-6 md:p-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin"
            className="text-sm text-slate-500 transition hover:text-slate-200"
          >
            ← Back to Dashboard
          </Link>

          <div className="mt-5">
            <h1 className="text-2xl font-semibold text-white">
              Audit Logs
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Recent administrative and system activity.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-7 flex flex-wrap gap-2">
          {[
            ["", "All"],
            ["organization", "Organizations"],
            ["user", "Users"],
            ["organ", "Organs"],
            ["request", "Requests"],
            ["transfer", "Transfers"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setEntityType(value)}
              className={`rounded-lg px-3.5 py-2 text-xs font-medium transition ${
                entityType === value
                  ? "bg-white text-slate-900"
                  : "border border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Logs */}
        {logs.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-10 text-center">
            <p className="text-sm text-slate-500">
              No audit activity found.
            </p>
          </div>
        ) : (
          <div>

            {logs.map((log, index) => {
              const today = isToday(log.createdAt);

              return (
                <div key={log._id}>

                  {/* Date separator */}
                  {(index === 0 ||
                    isToday(log.createdAt) !==
                      isToday(logs[index - 1].createdAt)) && (
                    <div className="mb-3 mt-6 first:mt-0">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-600">
                        {today
                          ? "Today"
                          : formatDate(log.createdAt)}
                      </p>
                    </div>
                  )}

                  {/* Activity */}
                  <div className="group flex gap-4 border-b border-slate-900 py-4">

                    {/* Timeline */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`mt-1 h-2.5 w-2.5 rounded-full ${getActionDot(
                          log.action
                        )}`}
                      />

                      {index !== logs.length - 1 && (
                        <div className="mt-2 h-full w-px bg-slate-900" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">

                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-2">

                          <h2 className="text-sm font-medium text-slate-200">
                            {formatAction(log.action)}
                          </h2>

                          <span className="rounded-md bg-slate-900 px-2 py-0.5 text-[10px] text-slate-500">
                            {formatEntityType(log.entityType)}
                          </span>

                        </div>

                        <span className="text-xs text-slate-600">
                          {formatTime(log.createdAt)}
                        </span>
                      </div>

                      <div className="mt-1 text-xs text-slate-500">

                        {log.organization?.name && (
                          <span>
                            {log.organization.name}
                          </span>
                        )}

                        {log.performedBy?.name && (
                          <span>
                            {log.organization?.name
                              ? " · "
                              : ""}
                            By {log.performedBy.name}
                          </span>
                        )}

                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs text-slate-600">
            Showing the latest {logs.length} activities
          </p>

          {logs.length === 15 && (
            <p className="text-xs text-slate-600">
              Older activity is retained in the system.
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default AuditLogs;