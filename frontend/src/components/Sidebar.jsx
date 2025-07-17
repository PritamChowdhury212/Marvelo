import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser.js";
import { BellIcon, HomeIcon, ShellIcon, UsersIcon } from "lucide-react";

const Sidebar = ({ showSidebar, setShowSidebar }) => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <aside
      className={`
        bg-base-200 border-r border-base-300 flex flex-col
        lg:sticky lg:top-0 lg:h-screen lg:w-64

        ${
          showSidebar ? "fixed inset-0 z-50 w-64 h-full" : "hidden lg:flex"
        } // Hidden on small screens when closed, flex on large
      `}
      style={{ minHeight: "100vh" }}
    >
      <div className="p-5 border-b border-base-300">
        <Link
          to="/"
          className="flex items-center gap-2.5"
          onClick={() => setShowSidebar(false)}
        >
          <ShellIcon className="size-9 text-primary" />
          <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
            Marvelo
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <Link
          to="/"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/" ? "btn-active" : ""
          }`}
          onClick={() => setShowSidebar(false)}
        >
          <HomeIcon className="size-5 text-base-content opacity-70" />
          <span>Home</span>
        </Link>

        <Link
          to="/groups"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/groups" ? "btn-active" : ""
          }`}
          onClick={() => setShowSidebar(false)}
        >
          <UsersIcon className="size-5 text-base-content opacity-70" />
          <span>Groups</span>
        </Link>

        <Link
          to="/notifications"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/notifications" ? "btn-active" : ""
          }`}
          onClick={() => setShowSidebar(false)}
        >
          <BellIcon className="size-5 text-base-content opacity-70" />
          <span>Notifications</span>
        </Link>
      </nav>

      {/* USER PROFILE SECTION */}
      <div className="p-4 border-t border-base-300 mt-auto">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="w-10 rounded-full">
              <img src={authUser?.profilePic} alt="User Avatar" />
            </div>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{authUser?.fullName}</p>
            <p className="text-xs text-success flex items-center gap-1">
              <span className="size-2 rounded-full bg-success inline-block" />
              Online
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
