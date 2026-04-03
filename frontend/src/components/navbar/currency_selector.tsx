/* currency selector subcomponent for navbar */
import canadaFlag from "../../assets/flags/canada_flag.svg";
import usaFlag from "../../assets/flags/usa_flag.svg";
import mexicoFlag from "../../assets/flags/mexico_flag.svg";

type CurrencySelectorProps = {
    currency: string;
    setCurrency: (currency: string) => void;
}

const CurrencySelector = ({ currency, setCurrency }: CurrencySelectorProps) => {
    return <div className="flex items-center">
        <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="appearance-none px-1 py-1 text-md cursor-pointer"
        >
            <option value="CAD">CAD</option>
            {/* <option value="USD">USD</option>
            <option value="MXN">MXN</option> */}
        </select>
        {currency === "CAD" && (<img src={canadaFlag} className="h-4" alt="Flag of Canada"/>)}
        {currency === "USD" && (<img src={usaFlag} className="h-4" alt="USA Flag"/>)}
        {currency === "MXN" && (<img src={mexicoFlag} className="h-4 ml-1" alt="Flag of Mexico"/>)}
    </div>
}

export default CurrencySelector;