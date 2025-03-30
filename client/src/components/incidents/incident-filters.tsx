import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    setStatus(value);
    updateFilters({ search, status: value, priority, category });
  };

  const handlePriorityChange = (value: string) => {
    setPriority(value);
    updateFilters({ search, status, priority: value, category });
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    updateFilters({ search, status, priority, category: value });
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
          <SelectItem value="">All Priorities</SelectItem>
          {priorityOptions.map(priority => (
            <SelectItem key={priority} value={priority}>
              {priorityLabels[priority]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={status} onValueChange={handleStatusChange}>
        <SelectTrigger>
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Statuses</SelectItem>
          {statusOptions.map(status => (
            <SelectItem key={status} value={status}>
              {statusLabels[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={category} onValueChange={handleCategoryChange}>
        <SelectTrigger>
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Categories</SelectItem>
          {categoryOptions.map(category => (
            <SelectItem key={category} value={category}>
              {categoryLabels[category]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default IncidentFilters;
