import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminHeader = ({ onRefresh, refreshing = false }) => {
    const location = useLocation();
    const { logout } = useAuth();

    const navigation = [
        {
            label: "Overview",
            path: "/admin",
        },
        {
            label: "Organizations",
            path: "/admin/organizations",
        },
        {
            label: "Users",
            path: "/admin/users",
        },
        {
            label: "Audit Logs",
            path: "/admin/audit-logs",
        },
    ];

    const isActive = (path) => {
        if (path === "/admin") {
            return location.pathname === "/admin";
        }

        return location.pathname.startsWith(path);
    };

    return (
        <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">

            <div className="mx-auto max-w-7xl px-6 lg:px-8">

                <div className="flex min-h-[72px] items-center justify-between gap-8">

                    {/* Brand */}
                    <Link
                        to="/admin"
                        className="shrink-0"
                    >
                        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-600">
                            OrganLink
                        </p>

                        <p className="mt-0.5 text-lg font-semibold text-white">
                            Admin Console
                        </p>
                    </Link>


                    {/* Navigation */}
                    <nav className="hidden items-center gap-7 md:flex">

                        {navigation.map((item) => {
                            const active = isActive(item.path);

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`relative py-7 text-sm transition ${
                                        active
                                            ? "text-white"
                                            : "text-slate-500 hover:text-slate-200"
                                    }`}
                                >
                                    {item.label}

                                    {active && (
                                        <span className="absolute bottom-0 left-0 right-0 h-px bg-white" />
                                    )}
                                </Link>
                            );
                        })}

                    </nav>


                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-4">

                        <button
                            onClick={onRefresh}
                            disabled={refreshing}
                            className="text-sm text-slate-500 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {refreshing ? "Refreshing..." : "Refresh"}
                        </button>

                        <button
                            onClick={logout}
                            className="text-sm text-slate-400 transition hover:text-white"
                        >
                            Logout
                        </button>

                    </div>

                </div>


                {/* Mobile navigation */}
                <nav className="flex gap-6 overflow-x-auto border-t border-slate-900 md:hidden">

                    {navigation.map((item) => {
                        const active = isActive(item.path);

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`whitespace-nowrap py-3 text-sm transition ${
                                    active
                                        ? "text-white"
                                        : "text-slate-500 hover:text-slate-200"
                                }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}

                </nav>

            </div>

        </header>
    );
};

export default AdminHeader;