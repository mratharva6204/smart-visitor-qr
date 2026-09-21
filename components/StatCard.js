export default function StatCard({
  title,
  value,
}) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-gray-500">
        {title}
      </h3>

      <p className="text-4xl font-bold text-[#0B1F3A] mt-3">
        {value}
      </p>
    </div>
  );
}