type EmployeeCardProps = {
  name: string;
  role: string;
  employee_id: string;
  onEdit?: () => void;
  onDelete?: () => void;
};

const EmployeeCard = ({ name, role, employee_id, onEdit, onDelete }: EmployeeCardProps) => {
  return (
    <article className="relative rounded-2xl border border-black/8 bg-white px-6 py-5 shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
      <button
        type="button"
        onClick={onDelete}
        className="absolute right-5 top-3 cursor-pointer text-base text-red-600 transition hover:text-red-700"
        aria-label={`Delete ${name}`}
      >
        x
      </button>

      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-[1.85rem] font-bold leading-none text-slate-950">{name}</h3>
          <p className="mt-1 text-sm text-slate-700">Role: {role}</p>
          <p className="text-sm text-slate-500">Employee ID: {employee_id}</p>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="cursor-pointer self-start rounded-xl bg-[#565656] px-5 py-2 text-xs font-bold tracking-wide text-white shadow-[0_4px_10px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 md:self-auto"
        >
          EDIT EMPLOYEE
        </button>
      </div>
    </article>
  );
};

export default EmployeeCard;
