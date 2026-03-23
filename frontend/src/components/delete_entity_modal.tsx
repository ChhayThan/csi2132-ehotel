import { DbEntity } from "../types/enums";

type DeleteEntityModalProps = {
  entity: DbEntity;
  entityName: string;
  setIsActive: (active: boolean) => void;
  onDelete?: () => void;
};

const DeleteEntityModal = ({ entity, entityName, setIsActive, onDelete }: DeleteEntityModalProps) => {
  const actionLabel = entity === "Employee" ? "TERMINATE" : "DELETE";
  const title = entity === "Employee" ? `Terminate ${entityName}` : `Delete ${entityName}`;
  const prompt =
    entity === "Employee"
      ? `Are you sure you want to terminate ${entityName}?`
      : `Are you sure you want to delete ${entityName}?`;

  const handleDelete = () => {
    onDelete?.();
    setIsActive(false);
  };

  return (
    <div className="bg-white flex w-full max-w-[42rem] flex-col gap-10 rounded-[2rem] p-8 shadow-[0_8px_25px_rgba(0,0,0,0.28)] sm:p-14">
      <h2 className="text-3xl text-slate-950">{title}</h2>

      <div className="space-y-2 text-center">
        <p className="text-2xl text-slate-950">{prompt}</p>
        <p className="text-2xl text-red-600">This process cannot be undone.</p>
      </div>

      <div className="flex flex-col justify-center gap-4 sm:flex-row">
        <button
          type="button"
          onClick={() => setIsActive(false)}
          className="cursor-pointer rounded-2xl bg-black/65 px-10 py-4 text-lg font-semibold text-white shadow-[0_6px_14px_rgba(0,0,0,0.18)]"
        >
          CANCEL
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="cursor-pointer rounded-2xl bg-[#d10000] px-10 py-4 text-lg font-semibold text-white shadow-[0_6px_14px_rgba(0,0,0,0.18)]"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
};

export default DeleteEntityModal;
