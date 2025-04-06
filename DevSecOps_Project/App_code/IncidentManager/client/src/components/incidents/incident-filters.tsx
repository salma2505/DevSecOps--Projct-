import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CustomSelectItem from "@/components/ui/custom-select-item";
import { 
  priorityOptions, 
  priorityLabels, 
  statusOptions, 
  statusLabels, 
  categoryOptions, 
  categoryLabels 
} from "@shared/schema";
import { Search } from "lucide-react";

interface IncidentFiltersProps {
  onFilterChange: (filters: {
    status: string;
    priority: string;
    category: string;
    search: string;
  }) => void;
}

const IncidentFilters = ({ onFilterChange }: IncidentFiltersProps) => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [category, setCategory] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    updateFilters({ search: value, status, priority, category });
  };

  const handleStatusChange = (value: string) => {
    // Convert "_all" back to empty string for filtering
    const actualValue = value === "_all" ? "" : value;
    setStatus(actualValue);
    updateFilters({ search, status: actualValue, priority, category });
  };

  const handlePriorityChange = (value: string) => {
    // Convert "_all" back to empty string for filtering
    const actualValue = value === "_all" ? "" : value;
    setPriority(actualValue);
    updateFilters({ search, status, priority: actualValue, category });
  };

  const handleCategoryChange = (value: string) => {
    // Convert "_all" back to empty string for filtering
    const actualValue = value === "_all" ? "" : value;
    setCategory(actualValue);
    updateFilters({ search, status, priority, category: actualValue });
  };

  const updateFilters = (filters: { search: string; status: string; priority: string; category: string }) => {
    onFilterChange(filters);
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="relative flex items-center">
        <Input
          type="text"
          placeholder="Search incidents..."
          value={search}
          onChange={handleSearchChange}
          className="pr-10"
        />
        <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
      </div>
      
      <Select value={priority} onValueChange={handlePriorityChange}>
        <SelectTrigger>
          <SelectValue placeholder="All Priorities" />
        </SelectTrigger>
        <SelectContent>
          <CustomSelectItem value="">All Priorities</CustomSelectItem>
          {priorityOptions.map(priority => (
            <CustomSelectItem key={priority} value={priority}>
              {priorityLabels[priority]}
            </CustomSelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={status} onValueChange={handleStatusChange}>
        <SelectTrigger>
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <CustomSelectItem value="">All Statuses</CustomSelectItem>
          {statusOptions.map(status => (
            <CustomSelectItem key={status} value={status}>
              {statusLabels[status]}
            </CustomSelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={category} onValueChange={handleCategoryChange}>
        <SelectTrigger>
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <CustomSelectItem value="">All Categories</CustomSelectItem>
          {categoryOptions.map(category => (
            <CustomSelectItem key={category} value={category}>
              {categoryLabels[category]}
            </CustomSelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default IncidentFilters;
