import { useEffect, useMemo, useState } from "react";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { ApiError } from "../lib/api";

type PaymentType = "debit" | "credit" | "cash" | "cheque" | "gift card" | "other";

type CustomerLookupResult = {
  exists: boolean;
  id?: string | null;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  address?: string | null;
};

type DirectRentPayload = {
  email: string;
  firstName?: string;
  lastName?: string;
  driversLicense?: string;
  address?: string;
  password?: string;
  checkinDate: string;
  checkoutDate: string;
  paymentType: PaymentType;
  paymentAmount: number;
};

type ConvertBookingPayload = {
  paymentType: PaymentType;
  paymentAmount: number;
};

type RentModalProps = {
  is_booked: boolean;
  room_num: number;
  name?: string;
  email?: string;
  checkinDate?: string;
  initialCheckoutDate?: string;
  subtotal: number;
  total: number;
  setIsActive: (active: boolean) => void;
  onLookupCustomer?: (email: string) => Promise<CustomerLookupResult>;
  onSubmitDirectRent?: (payload: DirectRentPayload) => Promise<void>;
  onSubmitBookedRent?: (payload: ConvertBookingPayload) => Promise<void>;
};

const paymentTypeOptions: PaymentType[] = ["credit", "debit", "cash", "cheque", "gift card", "other"];

function formatIsoDate(date: Date) {
  return date.toISOString().split("T")[0];
}

function parseIsoDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

const RentModal = ({
  is_booked,
  room_num,
  name,
  email,
  checkinDate,
  initialCheckoutDate,
  subtotal,
  total,
  setIsActive,
  onLookupCustomer,
  onSubmitDirectRent,
  onSubmitBookedRent,
}: RentModalProps) => {
  const today = useMemo(() => {
    return formatIsoDate(new Date());
  }, []);

  const tomorrow = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return formatIsoDate(date);
  }, []);

  const inputClass = "w-full rounded-2xl border border-black/30 px-5 py-4 text-sm outline-none";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [inputEmail, setInputEmail] = useState(email ?? "");
  const [driversLicense, setDriversLicense] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [checkoutDate, setCheckoutDate] = useState(initialCheckoutDate ?? tomorrow);
  const [paymentType, setPaymentType] = useState<PaymentType>("credit");
  const [isCustomerLookupLoading, setIsCustomerLookupLoading] = useState(false);
  const [customerLookupResult, setCustomerLookupResult] = useState<CustomerLookupResult | null>(
    is_booked && email ? { exists: true, email } : null,
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (is_booked && email) {
      setInputEmail(email);
      setCustomerLookupResult({ exists: true, email });
    }
  }, [email, is_booked]);

  useEffect(() => {
    setCheckoutDate(initialCheckoutDate ?? tomorrow);
  }, [initialCheckoutDate, tomorrow]);

  const needsCustomerCreationFields = !is_booked && customerLookupResult?.exists === false;
  const nightlyRate = subtotal;
  const effectiveCheckinDate = checkinDate ?? today;
  const directRentNights = useMemo(() => {
    return Math.max(
      1,
      Math.round(
        (parseIsoDate(checkoutDate).getTime() - parseIsoDate(effectiveCheckinDate).getTime()) / (1000 * 60 * 60 * 24),
      ),
    );
  }, [checkoutDate, effectiveCheckinDate]);
  const calculatedTotal = Number((nightlyRate * directRentNights).toFixed(2));

  const handleLookupCustomer = async () => {
    if (is_booked || !onLookupCustomer) {
      return;
    }

    const normalizedEmail = inputEmail.trim();
    if (!normalizedEmail) {
      setCustomerLookupResult(null);
      return;
    }

    setIsCustomerLookupLoading(true);
    setErrorMessage("");

    try {
      const result = await onLookupCustomer(normalizedEmail);
      setCustomerLookupResult(result);

      if (result.exists) {
        setFirstName(result.first_name ?? "");
        setLastName(result.last_name ?? "");
        setAddress(result.address ?? "");
        setDriversLicense(result.id ?? "");
        setPassword("");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to look up customer right now.");
      setCustomerLookupResult(null);
    } finally {
      setIsCustomerLookupLoading(false);
    }
  };

  const handleRent = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      if (is_booked) {
        await onSubmitBookedRent?.({
          paymentType,
          paymentAmount: calculatedTotal,
        });
      } else {
        let latestLookupResult = customerLookupResult;

        if (!latestLookupResult && onLookupCustomer) {
          latestLookupResult = await onLookupCustomer(inputEmail.trim());
          setCustomerLookupResult(latestLookupResult);
        }

        const shouldCreateCustomer = latestLookupResult?.exists === false;

        await onSubmitDirectRent?.({
          email: inputEmail.trim(),
          firstName: shouldCreateCustomer ? firstName.trim() : undefined,
          lastName: shouldCreateCustomer ? lastName.trim() : undefined,
          driversLicense: shouldCreateCustomer ? driversLicense.trim() : undefined,
          address: shouldCreateCustomer ? address.trim() : undefined,
          password: shouldCreateCustomer ? password : undefined,
          checkinDate: effectiveCheckinDate,
          checkoutDate,
          paymentType,
          paymentAmount: calculatedTotal,
        });
      }

      setIsActive(false);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to complete the renting right now.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white flex w-full max-w-[38rem] flex-col gap-6 rounded-[2rem] p-8 shadow-[0_8px_25px_rgba(0,0,0,0.28)] sm:p-10">
      <h2 className="text-3xl text-slate-950">
        Renting <strong>Room {room_num}</strong> to {is_booked ? name ?? email ?? "Customer" : "a Customer"}
      </h2>

      <form onSubmit={handleRent} className="flex flex-col gap-4">
        {!is_booked ? (
          <>
            <div className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Customer email"
                value={inputEmail}
                onChange={(e) => {
                  setInputEmail(e.target.value);
                  setCustomerLookupResult(null);
                }}
                onBlur={handleLookupCustomer}
                required
                className={inputClass}
              />
              <p className="text-xs text-slate-500">
                {isCustomerLookupLoading
                  ? "Checking for an existing customer..."
                  : customerLookupResult?.exists
                    ? "Existing customer found. We will use that account for this renting."
                    : customerLookupResult?.exists === false
                      ? "Customer not found. Enter the remaining required details to create a new account."
                      : "Enter a customer email to look up an existing account."}
              </p>
            </div>

            {needsCustomerCreationFields ? (
              <>
                <div className="flex">
                  <input
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required={needsCustomerCreationFields}
                    className="w-[50%] rounded-l-2xl border border-black/30 px-5 py-4 text-sm outline-none"
                  />
                  <input
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required={needsCustomerCreationFields}
                    className="w-[50%] rounded-r-2xl border border-l-0 border-black/30 px-5 py-4 text-sm outline-none"
                  />
                </div>
                <input
                  placeholder="Driver's License"
                  value={driversLicense}
                  onChange={(e) => setDriversLicense(e.target.value)}
                  required={needsCustomerCreationFields}
                  className={inputClass}
                />
                <input
                  placeholder="Home address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required={needsCustomerCreationFields}
                  className={inputClass}
                />
                <input
                  type="password"
                  placeholder="Temporary account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={needsCustomerCreationFields}
                  minLength={8}
                  className={inputClass}
                />
              </>
            ) : null}

            <label className="flex items-center gap-3 rounded-2xl border border-black/30 px-5 py-4 text-sm">
              <CalendarMonthOutlinedIcon className="text-black/55" />
              <span className="min-w-28 text-slate-500">Check-in date</span>
              <input
                type="date"
                value={effectiveCheckinDate}
                readOnly
                className="w-full cursor-default bg-transparent outline-none"
              />
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-black/30 px-5 py-4 text-sm">
              <CalendarMonthOutlinedIcon className="text-black/55" />
              <span className="min-w-28 text-slate-500">Check-out date</span>
              <input
                type="date"
                value={checkoutDate}
                onChange={(e) => setCheckoutDate(e.target.value)}
                required
                min={tomorrow}
                className="w-full outline-none"
              />
            </label>
          </>
        ) : (
          <>
            <div className="rounded-2xl border border-black/10 bg-slate-50 px-5 py-4 text-sm text-slate-600">
              <p>
                Guest: <span className="font-medium text-slate-800">{name ?? "Customer"}</span>
              </p>
              <p>
                Email / ID: <span className="font-medium text-slate-800">{email}</span>
              </p>
              <p>
                Check-in date: <span className="font-medium text-slate-800">{effectiveCheckinDate}</span>
              </p>
              <p>
                Check-out date: <span className="font-medium text-slate-800">{checkoutDate}</span>
              </p>
            </div>
          </>
        )}

        <div className="relative">
          <select
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value as PaymentType)}
            className={`${inputClass} appearance-none pr-10`}
          >
            {paymentTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 space-y-1 text-slate-700">
          {is_booked ? (
            <p>
              Nightly rate: ${nightlyRate.toFixed(2)} x {directRentNights} night{directRentNights > 1 ? "s" : ""}
            </p>
          ) : (
            <p>
              Nightly rate: ${nightlyRate.toFixed(2)} x {directRentNights} night{directRentNights > 1 ? "s" : ""}
            </p>
          )}
          <p className="text-4xl font-bold text-slate-950">Total: ${calculatedTotal.toFixed(2)}</p>
        </div>

        {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

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
            disabled={isSubmitting || isCustomerLookupLoading}
            className="cursor-pointer rounded-2xl bg-gradient-to-r from-primary to-blue-900 px-10 py-4 text-lg font-semibold text-white shadow-[0_6px_14px_rgba(0,0,0,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "PROCESSING..." : "RENT"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RentModal;
