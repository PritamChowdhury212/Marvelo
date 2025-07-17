import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ children, showSidebar: showSidebarProp }) => {
  const [showSidebar, setShowSidebar] = useState(showSidebarProp ?? false);

  useEffect(() => {
    if (typeof showSidebarProp === "boolean") {
      setShowSidebar(showSidebarProp);
    }
  }, [showSidebarProp]);

  const toggleSidebar = () => {
    setShowSidebar((prev) => !prev);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar toggleSidebar={toggleSidebar} />

          {/* Scrollable Main Section */}
          <main className="flex-1 overflow-y-auto bg-base-100 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>

      {/* Overlay for small screens */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </div>
  );
};

export default Layout;
