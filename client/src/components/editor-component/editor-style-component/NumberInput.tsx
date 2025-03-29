import { Minus, Plus } from "lucide-react";
import { Button } from "../../ui-component/Button";
import { Label } from "../../ui-component/Label";
import { Input } from "../../ui-component/Input";
import { useState } from "react";

// Numeric input with +/- buttons
interface NumberInputProps {
  id: string;
  value: number | string
  onChange: (value: any) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  label?: string;
  className?: string;
  defaultValue: number | string ;
}

const NumberInput = ({
  id,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = "px",
  label,
  className = "",
  defaultValue
}: NumberInputProps) => {
  console.log("value", value)
  const numValue = typeof value === "number" ? value : parseInt(value,10) || 0;

  const [rawValue, setRawValue] = useState(String(value ?? 0));



  const handleIncrement = () => {
    if (numValue < max) {
      setRawValue((prev) => String(parseInt(prev || '0', 10) + step));
      onChange({
        target: {
          id,
          value: numValue + step,
        },
      });
    }
  };

  const handleDecrement = () => {
    console.log("numValue", numValue)
    if (numValue > min) {
      setRawValue((prev) => String(parseInt(prev || '0', 10) - step));
      onChange({
        target: {
          id,
          value: numValue - step,
        },
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
  
    // Allow empty input while typing
    if (val === '') {
      setRawValue('');
      onChange({ target: { id, value: 0 } });
      return;
    }
  
    // Only allow digits
    if (!/^\d+$/.test(val)) return;
  
    
    const numeric = parseInt(val, 10);
    const clamped = Math.min(Math.max(numeric, min), max);
    setRawValue(String(clamped));
  
    onChange({
      target: {
        id,
        value: clamped,
      },
    });
  };
  

  const handleBlur = () => {
    // Remove leading zeros on blur
    const cleaned = String(parseInt(rawValue || '0', 10));
    setRawValue(cleaned);
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <Label htmlFor={id} className="text-sm text-muted-foreground">
          {label}
        </Label>
      )}
      <div className="flex items-center">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-r-none"
          onClick={handleDecrement}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <Input
          id={id}
          defaultValue={defaultValue }
          type="text" // change to text
          inputMode="numeric" // mobile-friendly numeric keyboard
          pattern="\d*" // only digits
          value={rawValue}
          onBlur={handleBlur}
          onChange={handleInputChange}
          min={min}
          max={max}
          step={step}
          className="h-8 w-16 rounded-none text-center 
             focus:outline-none focus:ring-0 focus:border-none 
             appearance-none 
              focus:border-transparent
              focus-visible:ring-0 focus-visible:ring-transparent
             [&::-webkit-inner-spin-button]:appearance-none 
             [&::-webkit-outer-spin-button]:appearance-none 
             [&::-webkit-inner-spin-button]:m-0 
             [&::-webkit-outer-spin-button]:m-0
             "
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-l-none"
          onClick={handleIncrement}
        >
          <Plus className="h-3 w-3" />
        </Button>
        {unit && (
          <span className="ml-2 text-sm text-muted-foreground">{unit}</span>
        )}
      </div>
    </div>
  );
};

export default NumberInput;
