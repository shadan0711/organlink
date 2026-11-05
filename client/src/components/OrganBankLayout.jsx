
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const OrganBankLayout = ({ children }) => {
    const { user, logout } = useAuth();

    const navLinkClass = ({ isActive }) =>
        `rounded-md px-4 py-2 text-sm font-medium transition ${
            isActive
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
        }`;

    return (
        <div className="min-h-screen bg-slate-950 text-white">

            <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

                    {/* Brand */}
                    <Link to="/organ-bank" className="shrink-0">
                        <h1 className="text-xl font-bold">OrganLink</h1>
                        <p className="text-xs text-slate-400">
                            Organ Bank Portal
                        </p>
                    </Link>

                    {/* Navigation */}
                    <nav className="flex items-center gap-1">
                        <NavLink
                            to="/organ-bank"
                            end
                            className={navLinkClass}
                        >
                            Dashboard
                        </NavLink>

                        <NavLink
                            to="/organ-bank/inventory"
                            className={navLinkClass}
                        >
                            Inventory
                        </NavLink>

                        <NavLink
                            to="/organ-bank/transfers"
                            className={navLinkClass}
                        >
                            Transfers
                        </NavLink>
                    </nav>

                    {/* User and Logout */}
                    <div className="flex shrink-0 items-center gap-3">
                        <span className="hidden text-sm text-slate-400 sm:block">
                            {user?.role || "Organ Bank"}
                        </span>

                        <button
                            onClick={logout}
                            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
                        >
                            Logout
                        </button>
                    </div>

                </div>
            </header>

            {children}

        </div>
    );
};

export default OrganBankLayout;
