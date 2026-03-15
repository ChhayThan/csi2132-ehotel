import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

type BookingSearchBarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  dateValue?: string;
  onDateChange?: (value: string) => void;
};

const BookingSearchBar = ({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  dateValue,
  onDateChange,
}: BookingSearchBarProps) => {
  const hasDateField = Boolean(onDateChange);

  return (
    <div className={`grid gap-4 ${hasDateField ? "md:grid-cols-[minmax(0,1fr)_14rem]" : "grid-cols-1"}`}>
      <label className="flex items-center gap-3 rounded-xl border border-black/12 bg-white px-4 py-3 shadow-sm">
        <SearchRoundedIcon className="text-slate-400" fontSize="small" />
        <input
          type="text"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />
      </label>

      {hasDateField ? (
        <label className="flex items-center gap-3 rounded-xl border border-black/12 bg-white px-4 py-3 shadow-sm">
          <CalendarMonthOutlinedIcon className="text-slate-400" fontSize="small" />
          <input
            type="date"
            value={dateValue ?? ""}
            onChange={(event) => onDateChange(event.target.value)}
            className="w-full bg-transparent text-sm text-slate-700 outline-none"
          />
        </label>
      ) : null}
    </div>
  );
};

export default BookingSearchBar;
