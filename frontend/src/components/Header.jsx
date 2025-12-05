import React from "react";
import { MenuIcon } from "@heroicons/react/outline";

const Header = ({ sidebarOpen, setSidebarOpen }) => {
return (
<header className="flex items-center justify-between bg-white shadow p-4">
<button
className="md:hidden text-gray-600"
onClick={() => setSidebarOpen(!sidebarOpen)}
>
<MenuIcon className="h-1 w-6" />
</button>
<h1 className="text-lg font-semibold">Dashboard</h1>
<div className="flex items-center space-x-3">
<span className="text-gray-700 font-medium">Rita Roy</span>
<span className="text-sm text-gray-500">IIT Delhi</span>
<img src="https://i.pravatar.cc/30" alt="Profile" className="w-8 h-8 rounded-full" />
</div>
</header>
);
};

export default Header;