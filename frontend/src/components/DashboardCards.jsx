const DashboardCard = ({ title, value, icon: Icon }) => {
  return (
    <div className="bg-white rounded-2xl shadow p-5 flex items-center justify-between hover:shadow-lg transition">
      <div>
        <h3 className="text-sm text-gray-500">{title}</h3>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
      {Icon && <Icon className="w-8 h-8 text-indigo-500" />}
    </div>
  );
};

export default DashboardCard;
