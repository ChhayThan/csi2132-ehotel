import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";

type EmployeeInfoProps = {
  employeeName: string;
  employeeId: string;
  hotelName: string;
  chainName: string;
  address: string;
};

const EmployeeInfo = ({
  employeeName,
  employeeId,
  hotelName,
  chainName,
  address,
}: EmployeeInfoProps) => {
  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-950">{employeeName}</h1>
        <p className="mt-2 text-base text-slate-500">
          Employee ID: <span className="font-medium text-slate-700">{employeeId}</span>
        </p>
      </div>

      <div className="text-left lg:text-center">
        <h2 className="text-4xl font-light tracking-tight text-slate-950">{hotelName}</h2>
        <p className="mt-1 text-2xl font-medium uppercase tracking-wide text-primary">
          {chainName}
        </p>
        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500 lg:justify-center">
          <LocationOnOutlinedIcon fontSize="small" />
          <span>{address}</span>
        </div>
      </div>

      <div className="hidden lg:block" />
    </section>
  );
};

export default EmployeeInfo;
