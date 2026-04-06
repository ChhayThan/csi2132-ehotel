import { useState } from "react";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import CallRoundedIcon from "@mui/icons-material/CallRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import { DbEntity } from "../types/enums";

type EditEntityModalProps = {
  entity: DbEntity;
  entityName: string;
  setIsActive: (active: boolean) => void;
  initialValues?: {
    name?: string;
    address?: string;
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    password?: string;
    role?: string;
    roomNumber?: string;
    capacity?: string;
    view?: string;
    amenities?: string;
    problems?: string;
    price?: string;
    extendable?: boolean;
  };
  onSave?: (values: Record<string, string | boolean>) => void;
};

const inputClass = "w-full rounded-2xl border border-black/30 px-5 py-4 text-sm outline-none";
const iconWrapClass = "flex items-center rounded-2xl border border-black/30 text-sm";

const EditEntityModal = ({
  entity,
  entityName,
  setIsActive,
  initialValues,
  onSave,
}: EditEntityModalProps) => {
  const [formValues, setFormValues] = useState({
    name: initialValues?.name ?? "",
    address: initialValues?.address ?? "",
    email: initialValues?.email ?? "",
    phone: initialValues?.phone ?? "",
    firstName: initialValues?.firstName ?? "",
    lastName: initialValues?.lastName ?? "",
    password: initialValues?.password ?? "",
    role: initialValues?.role ?? "",
    roomNumber: initialValues?.roomNumber ?? "",
    capacity: initialValues?.capacity ?? "",
    view: initialValues?.view ?? "",
    amenities: initialValues?.amenities ?? "",
    problems: initialValues?.problems ?? "",
    price: initialValues?.price ?? "",
    extendable: initialValues?.extendable ?? false,
  });

  const updateValue = (field: string, value: string | boolean) => {
    setFormValues((current) => ({ ...current, [field]: value }));
  };

  const headerText = () => {
    switch (entity) {
      case "HotelChain":
      case "Hotel":
        return `Edit Information of ${entityName}`;
      case "Room":
        return `Edit information of ${entityName}`;
      default:
        return `Edit ${entityName}'s Information`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave?.(formValues);
    setIsActive(false);
  };

  const hotelLikeFields = (
    <>
      <input
        value={formValues.name}
        onChange={(e) => updateValue("name", e.target.value)}
        placeholder={entity === "HotelChain" ? "Chain Name" : "Hotel Name"}
        className={inputClass}
      />
      <div className={iconWrapClass}>
        <LocationOnOutlinedIcon className="ml-4 text-[1.35rem] text-black/55" />
        <input
          value={formValues.address}
          onChange={(e) => updateValue("address", e.target.value)}
          placeholder={entity === "HotelChain" ? "Central Office Address" : "Hotel Address"}
          className="w-full px-3 py-4 outline-none"
        />
      </div>
      <div className={iconWrapClass}>
        <EmailRoundedIcon className="ml-4 text-[1.35rem] text-black/55" />
        <input
          value={formValues.email}
          onChange={(e) => updateValue("email", e.target.value)}
          placeholder={entity === "HotelChain" ? "Central Office Email" : "Hotel Email"}
          className="w-full px-3 py-4 outline-none"
        />
      </div>
      <div className={iconWrapClass}>
        <CallRoundedIcon className="ml-4 text-[1.35rem] text-black/55" />
        <input
          value={formValues.phone}
          onChange={(e) => updateValue("phone", e.target.value)}
          placeholder={entity === "HotelChain" ? "Central Office Phone Number" : "Hotel Phone Number"}
          className="w-full px-3 py-4 outline-none"
        />
      </div>
    </>
  );

  const employeeFields = (
    <>
      <div className="flex">
        <input
          value={formValues.firstName}
          onChange={(e) => updateValue("firstName", e.target.value)}
          placeholder="First name"
          className="w-1/2 rounded-l-2xl border border-black/30 px-5 py-4 text-sm outline-none"
        />
        <input
          value={formValues.lastName}
          onChange={(e) => updateValue("lastName", e.target.value)}
          placeholder="Last name"
          className="w-1/2 rounded-r-2xl border border-l-0 border-black/30 px-5 py-4 text-sm outline-none"
        />
      </div>
      <div className={iconWrapClass}>
        <LocationOnOutlinedIcon className="ml-4 text-[1.35rem] text-black/55" />
        <input
          value={formValues.address}
          onChange={(e) => updateValue("address", e.target.value)}
          placeholder="Home Address"
          className="w-full px-3 py-4 outline-none"
        />
      </div>
      <input
        type="password"
        value={formValues.password}
        onChange={(e) => updateValue("password", e.target.value)}
        placeholder="Password"
        className={inputClass}
      />
      <div className="relative">
        <select
          value={formValues.role}
          onChange={(e) => updateValue("role", e.target.value)}
          className={`${inputClass} appearance-none bg-white pr-12 ${!formValues.role ? "text-black/45" : ""}`}
        >
          <option value="" disabled>
            Role
          </option>
          <option value="Employee">Employee</option>
          <option value="Admin">Admin</option>
        </select>
        <KeyboardArrowDownRoundedIcon className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black/55" />
      </div>
    </>
  );

  const roomFields = (
    <>
      <input
        value={formValues.roomNumber}
        onChange={(e) => updateValue("roomNumber", e.target.value)}
        placeholder="Room Number"
        className={inputClass}
      />
      <div className="relative">
        <select
          value={formValues.capacity}
          onChange={(e) => updateValue("capacity", e.target.value)}
          className={`${inputClass} appearance-none bg-white pr-12 ${!formValues.capacity ? "text-black/45" : ""}`}
        >
          <option value="" disabled>
            Capacity
          </option>
          <option value="1">Single</option>
          <option value="2">Double</option>
          <option value="4">Suite</option>
        </select>
        <KeyboardArrowDownRoundedIcon className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black/55" />
      </div>
      <div className="relative">
        <select
          value={formValues.view}
          onChange={(e) => updateValue("view", e.target.value)}
          className={`${inputClass} appearance-none bg-white pr-12 ${!formValues.view ? "text-black/45" : ""}`}
        >
          <option value="" disabled>
            View
          </option>
          <option value="None">None</option>
          <option value="City">City</option>
          <option value="Ocean">Ocean</option>
          <option value="Mountain">Mountain</option>
        </select>
        <KeyboardArrowDownRoundedIcon className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black/55" />
      </div>
      <textarea
        value={formValues.amenities}
        onChange={(e) => updateValue("amenities", e.target.value)}
        placeholder={"Amenities (comma separated)\ni.e. Air Conditioning, TV, WiFi, etc."}
        className={`${inputClass} min-h-28 resize-none`}
      />
      <textarea
        value={formValues.problems}
        onChange={(e) => updateValue("problems", e.target.value)}
        placeholder="Room Problems (optional)"
        className={`${inputClass} min-h-24 resize-none`}
      />
      <div className="flex items-center justify-between rounded-2xl border border-black/30 px-5 py-4 text-sm">
        <div className="flex items-center">
          <span className="font-semibold">$</span>
          <input
            value={formValues.price}
            onChange={(e) => updateValue("price", e.target.value)}
            placeholder="(amount)"
            className="w-full px-2 outline-none"
          />
        </div>
        <span className="font-semibold">per night</span>
      </div>
      <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={Boolean(formValues.extendable)}
          onChange={(e) => updateValue("extendable", e.target.checked)}
          className="h-6 w-6 rounded border border-black/40"
        />
        <span>Extendable</span>
      </label>
    </>
  );

  return (
    <div className="bg-white flex w-full max-w-[52rem] flex-col gap-6 rounded-[2rem] p-8 shadow-[0_8px_25px_rgba(0,0,0,0.28)] sm:p-10">
      <h2 className="text-3xl text-slate-950">{headerText()}</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {entity === "HotelChain" || entity === "Hotel" ? hotelLikeFields : null}
        {entity === "Employee" ? employeeFields : null}
        {entity === "Room" ? roomFields : null}

        <div className="mt-4 flex flex-col justify-center gap-4 sm:flex-row">
          <button
            type="button"
            onClick={() => setIsActive(false)}
            className="cursor-pointer rounded-2xl bg-black/65 px-10 py-4 text-lg font-semibold text-white shadow-[0_6px_14px_rgba(0,0,0,0.18)]"
          >
            CANCEL
          </button>
          <button
            type="submit"
            className="cursor-pointer rounded-2xl bg-gradient-to-r from-primary to-blue-900 px-10 py-4 text-lg font-semibold text-white shadow-[0_6px_14px_rgba(0,0,0,0.18)]"
          >
            SAVE CHANGES
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEntityModal;
