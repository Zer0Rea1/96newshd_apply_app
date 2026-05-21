export default function RoleCard({ role, selected, onSelect }) {
  return (
    <div
      onClick={() => onSelect(role)}
      className={`cursor-pointer border-2 rounded-xl p-4 text-center transition-all ${
        selected
          ? 'border-red-600 bg-red-50 shadow-lg'
          : 'border-gray-200 hover:border-red-300 hover:shadow'
      }`}
    >
      <h3 className="text-lg font-bold text-gray-800">{role.name}</h3>
      <p className="text-red-600 font-semibold mt-1">Rs {role.fee.toLocaleString()}</p>
    </div>
  )
}
