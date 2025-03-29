import { Label } from "src/components/ui-component/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "src/components/ui-component/Select";
import { FONT_WEIGHTS } from "src/lib/constants";

interface FontWeightProps {
    value: string;
    onChange: (value: string) => void;
  }
  
  const FontWeight = ({ value, onChange }: FontWeightProps) => {
    return (
      <div>
        <Label className="text-sm text-muted-foreground">Font Weight</Label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select weight" />
          </SelectTrigger>
          <SelectContent>
            {FONT_WEIGHTS.map((weight) => (
              <SelectItem key={weight.value} value={weight.value}>
                {weight.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };
  
  export default FontWeight;