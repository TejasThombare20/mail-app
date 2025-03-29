import { Label } from "src/components/ui-component/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "src/components/ui-component/Select";
import { FONT_FAMILIES, STYLE_PROPERTIES } from "src/lib/constants";
import { getStyleValueForSelectedElement } from "src/lib/utils";


interface FontFamilyProps {
    value: string;
    onChange: (value: string) => void;
  }
  
const FontFamily = ({ value, onChange }: FontFamilyProps) => {
    return (
      <div>
        <Label className="text-sm text-muted-foreground">Font Family</Label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select font family" />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };
  
  export default FontFamily;
  