import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Incident } from "@shared/schema";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import IncidentForm from "@/components/incidents/incident-form";
import IncidentFilters from "@/components/incidents/incident-filters";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Loader2, FileText, Download } from "lucide-react";
import { exportToCSV, exportToPDF } from "@/lib/utils/export";

const Incidents = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    status: "",
    priority: "",
    category: "",
    search: "",
  });

  // Build query params from active filters
  const getQueryParams = () => {
    const params = new URLSearchParams();
    if (activeFilters.status) params.append("status", activeFilters.status);
    if (activeFilters.priority) params.append("priority", activeFilters.priority);
    if (activeFilters.category) params.append("category", activeFilters.category);
    if (activeFilters.search) params.append("search", activeFilters.search);
    return params.toString() ? `?${params.toString()}` : "";
  };

  const { 
    data: incidents,
    isLoading,
    error
  } = useQuery<Incident[]>({
    queryKey: [`/api/incidents${getQueryParams()}`],
  });

  const { data: teams } = useQuery({
    queryKey: ["/api/teams"],
  });

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'critical': return 'priority-critical';
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-low';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'open': return 'status-open';
      case 'in-progress': return 'status-in-progress';
      case 'resolved': return 'status-resolved';
      case 'closed': return 'status-closed';
      default: return 'status-open';
    }
  };

  const getTeamName = (teamId: number | null) => {
    if (!teamId || !teams) return "Unassigned";
    const team = teams.find((t) => t.id === teamId);
    return team ? team.name : "Unassigned";
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const columns: ColumnDef<Incident>[] = [
    {
      accessorKey: "incidentId",
      header: "ID",
      cell: ({ row }) => (
        <span className="font-medium text-slate-900">
          {row.getValue("incidentId")}
        </span>
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <span className="truncate max-w-[200px] block">
          {row.getValue("title")}
        </span>
      ),
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const priority = row.getValue("priority") as string;
        return (
          <Badge variant={getPriorityVariant(priority)}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const displayStatus = status === "in-progress" ? "In Progress" : status.charAt(0).toUpperCase() + status.slice(1);
        return (
          <Badge variant={getStatusVariant(status)}>
            {displayStatus}
          </Badge>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.getValue("category") as string;
        return category.charAt(0).toUpperCase() + category.slice(1);
      },
    },
    {
      accessorKey: "assignedTo",
      header: "Assigned To",
      cell: ({ row }) => getTeamName(row.getValue("assignedTo")),
    },
    {
      accessorKey: "createdAt",
      header: "Created Date",
      cell: ({ row }) => formatDate(row.getValue("createdAt")),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm">
          View
        </Button>
      ),
    },
  ];

  const handleExportCSV = () => {
    if (incidents) {
      exportToCSV(incidents);
    }
  };

  const handleExportPDF = () => {
    if (incidents) {
      exportToPDF(incidents);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto py-6">
          <div className="px-6">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h1 className="text-2xl font-semibold text-slate-800">Incidents</h1>
                <p className="mt-1 text-sm text-slate-500">A list of all incidents in your account including their ID, title, status, and priority.</p>
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  Create Incident
                </Button>
              </div>
            </div>
            
            {/* Filters and Export */}
            <div className="mt-6 mb-4">
              <IncidentFilters 
                onFilterChange={(filters) => setActiveFilters(filters)}
              />
              
              {/* Export Options */}
              <div className="mt-4 flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={handleExportCSV}
                  disabled={!incidents || incidents.length === 0}
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={handleExportPDF}
                  disabled={!incidents || incidents.length === 0}
                >
                  <FileText className="h-4 w-4" />
                  Export PDF
                </Button>
              </div>
            </div>
            
            {/* Incidents Table */}
            <div className="mt-4">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="p-4 rounded-md bg-red-50 text-red-700">
                  Failed to load incidents. Please try again.
                </div>
              ) : incidents && incidents.length > 0 ? (
                <DataTable 
                  columns={columns}
                  data={incidents}
                  searchKey="title"
                  searchPlaceholder="Search incidents..."
                />
              ) : (
                <div className="text-center py-12 bg-white rounded-md shadow">
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">No incidents found</h3>
                  <p className="mt-1 text-sm text-gray-500">Create a new incident to get started.</p>
                  <div className="mt-6">
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                      Create Incident
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Create Incident Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Create New Incident</DialogTitle>
                  <DialogDescription>
                    Fill in the details to create a new incident ticket.
                  </DialogDescription>
                </DialogHeader>
                <IncidentForm onClose={() => setIsCreateModalOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Incidents;
