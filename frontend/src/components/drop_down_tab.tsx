import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import type { ReactNode } from "react";

type DropDownTabProps = {
  title: string;
  isOpen: boolean;
  onToggle?: () => void;
  children?: ReactNode;
  isCompleted?: boolean;
  isDisabled?: boolean;
  className?: string;
};

const DropDownTab = ({
  title,
  isOpen,
  onToggle,
  children,
  isCompleted = false,
  isDisabled = false,
  className = "",
}: DropDownTabProps) => {
  const canToggle = Boolean(onToggle) && !isDisabled;

  return (
    <section
      className={`overflow-hidden rounded-[1.35rem] border border-black/10 bg-white shadow-[0_12px_28px_rgba(15,23,42,0.06)] ${className}`.trim()}
    >
      <button
        type="button"
        onClick={canToggle ? onToggle : undefined}
        disabled={!canToggle}
        className={`flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-7 ${
          canToggle ? "cursor-pointer" : "cursor-default"
        }`}
        aria-expanded={isOpen}
      >
        <h2
          className={`text-2xl font-bold tracking-tight ${
            isDisabled ? "text-slate-400" : "text-slate-950"
          }`}
        >
          {title}
        </h2>
        {isCompleted ? (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
            <CheckRoundedIcon />
          </span>
        ) : (
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-transform ${
              isOpen ? "rotate-180" : ""
            } ${isDisabled ? "opacity-50" : ""}`}
          >
            <ExpandMoreRoundedIcon />
          </span>
        )}
      </button>

      {isOpen ? <div className="px-5 pb-5 sm:px-7 sm:pb-7">{children}</div> : null}
    </section>
  );
};

export default DropDownTab;
