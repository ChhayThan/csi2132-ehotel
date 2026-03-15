import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

type RoomProblemAlertProps = {
  message: string;
  className?: string;
};

const RoomProblemAlert = ({ message, className = "" }: RoomProblemAlertProps) => {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-100 px-4 py-3 text-sm text-amber-950 shadow-sm ${className}`.trim()}
      role="alert"
    >
      <WarningAmberRoundedIcon className="mt-0.5 text-amber-500" fontSize="small" />
      <p>{message}</p>
    </div>
  );
};

export default RoomProblemAlert;
