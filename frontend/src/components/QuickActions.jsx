import React from "react";
import { PlusIcon } from "@heroicons/react/outline";

const QuickActions = () => {
return (
<div className="bg-white rounded-lg shadow p-4">
<h3 className="text-lg font-bold mb-3">Quick Actions</h3>
<p className="text-sm text-gray-500 mb-4">Common tasks</p>

  <button className="w-full bg-blue-600 text-white py-2 rounded-md mb-3 flex justify-center items-center space-x-2 hover:bg-blue-700">
    <PlusIcon className="h-5 w-5" />
    <span>Create New Event</span>
  </button>
  <button className="w-full bg-gray-300 py-2 rounded-md mb-3">
    Review pending approvals
  </button>
  <button className="w-full bg-gray-300 py-2 rounded-md">
    Active events
  </button>
</div>


);
};

export default QuickActions;