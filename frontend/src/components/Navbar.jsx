import { Link } from "react-router";
import useAuthUser from "../hooks/useAuthUser.js";
import { BellIcon, LogOutIcon, MenuIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout.js";

const Navbar = ({ toggleSidebar }) => {
  const { authUser } = useAuthUser();

  const { logoutMutation } = useLogout();
  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-[77px] flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between w-full">
          {/* Hamburger button */}
          <button
            className="btn btn-ghost lg:hidden"
            onClick={toggleSidebar}
            aria-label="Toggle Sidebar"
          >
            <MenuIcon className="h-6 w-6 text-base-content opacity-70" />
          </button>

          <div className="flex items-center ml-auto gap-4">
            {/* Group bell and theme selector */}
            <div className="flex items-center gap-1">
              <Link to={"/notifications"}>
                <button className="btn btn-ghost btn-circle p-1">
                  <BellIcon className="h-6 w-6 text-base-content opacity-70" />
                </button>
              </Link>

              <ThemeSelector />
            </div>

            {/* Avatar and Logout */}
            <div className="avatar">
              <div className="w-9 rounded-full">
                <img
                  src={authUser?.profilePic}
                  alt="User Avatar"
                  rel="noreferrer"
                />
              </div>
            </div>

            <button
              className="btn btn-ghost btn-circle"
              onClick={logoutMutation}
            >
              <LogOutIcon className="h-6 w-6 text-base-content opacity-70" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
