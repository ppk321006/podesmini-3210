
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PeriodSelectorProps {
  selectedYear: number;
  selectedSubround: number;
  years: number[];
  onYearChange: (value: string) => void;
  onSubroundChange: (value: string) => void;
}

export const PeriodSelector = ({
  selectedYear,
  selectedSubround,
  years,
  onYearChange,
  onSubroundChange
}: PeriodSelectorProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
      <Select value={selectedYear.toString()} onValueChange={onYearChange}>
        <SelectTrigger className="w-full md:w-[150px]">
          <SelectValue placeholder="Tahun" />
        </SelectTrigger>
        <SelectContent>
          {years.map(year => (
            <SelectItem key={year} value={year.toString()}>
              Tahun {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={selectedSubround.toString()} onValueChange={onSubroundChange}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Pilih Subround" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0">Semua</SelectItem>
          <SelectItem value="1">Subround 1</SelectItem>
          <SelectItem value="2">Subround 2</SelectItem>
          <SelectItem value="3">Subround 3</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
