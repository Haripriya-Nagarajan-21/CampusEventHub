import React from "react";

const RecentActivity = () => {
return (
<div className="bg-white rounded-lg shadow p-4">
<h3 className="text-lg font-bold mb-3">Recent Activity</h3>
<p className="text-sm text-gray-500 mb-4">Latest admin actions</p>
<ul className="space-y-3">
<li>
<strong>Event ‘Tech Symposium 2025’</strong> created —{" "}
<span className="text-gray-500 text-sm">2 hours ago</span>
</li>
<li>
15 registrations approved for ‘Hackathon Pro’ —{" "}
<span className="text-gray-500 text-sm">3 hours ago</span>
</li>
<li>
Event ‘Cultural Fest’ edited —{" "}
<span className="text-gray-500 text-sm">2 hours ago</span>
</li>
</ul>
</div>
);
};

export default RecentActivity;