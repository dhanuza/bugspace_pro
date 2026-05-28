type EmployeeStatCardProps = {
  title: string;
  value: string | number;
  valueColor?: string;
};

export default function EmployeeStatCard({
  title,
  value,
  valueColor = "text-[#0f172a]",
}: EmployeeStatCardProps) {
  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm">

      <p className="text-xs uppercase tracking-wide text-gray-500">
        {title}
      </p>

      <h2 className={`text-4xl font-bold mt-3 ${valueColor}`}>
        {value}
      </h2>

    </div>
  );
}