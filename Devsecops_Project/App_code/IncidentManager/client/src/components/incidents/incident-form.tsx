import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CustomSelectItem from "@/components/ui/custom-select-item";
import { 
  insertIncidentSchema, 
  priorityOptions, 
  priorityLabels, 
  statusOptions, 
  statusLabels, 
  categoryOptions, 
  categoryLabels 
} from "@shared/schema";

// Extend the schema with form validation
const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").optional(),
  dueDate: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  priority: z.string().min(1, "Priority is required"),
  category: z.string().min(1, "Category is required"),
  assignedTo: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface IncidentFormProps {
  onClose: () => void;
}

const IncidentForm = ({ onClose }: IncidentFormProps) => {
  const [attachments, setAttachments] = useState<File[]>([]);
  const { toast } = useToast();

  // Get teams for the assignment dropdown
  const { data: teams = [], isLoading: isTeamsLoading } = useQuery<{id: number, name: string}[]>({
    queryKey: ["/api/teams"],
  });

  // Form initialization with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      category: "other",
      status: "open",
      assignedTo: undefined,
      dueDate: undefined,
    },
  });

  // Create incident mutation
  const createIncidentMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Format date fields for API
      // Only include required fields and correctly typed fields
      const formattedData: Record<string, any> = {
        title: data.title,
        description: data.description || "",
        status: data.status,
        priority: data.priority,
        category: data.category
      };

      // Only add optional fields if they have valid values
      if (data.dueDate) {
        formattedData.dueDate = new Date(data.dueDate).toISOString();
      }
      
      if (data.assignedTo && !["_none", "_loading", "_empty", "_all"].includes(data.assignedTo)) {
        formattedData.assignedTo = parseInt(data.assignedTo);
      }

      console.log("Submitting incident data:", formattedData);
      const res = await apiRequest("POST", "/api/incidents", formattedData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Incident created",
        description: "The incident has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/dashboard"] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to create incident",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: FormValues) => {
    createIncidentMutation.mutate(data);
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...fileList]);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Brief description of the incident" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {priorityOptions.map((priority) => (
                      <CustomSelectItem key={priority} value={priority}>
                        {priorityLabels[priority]}
                      </CustomSelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categoryOptions.map((category) => (
                      <CustomSelectItem key={category} value={category}>
                        {categoryLabels[category]}
                      </CustomSelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detailed description of the incident"
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="assignedTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assign To</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isTeamsLoading ? (
                      <CustomSelectItem value="_loading">Loading teams...</CustomSelectItem>
                    ) : !teams || teams.length === 0 ? (
                      <CustomSelectItem value="_none">No teams available</CustomSelectItem>
                    ) : (
                      teams.map((team) => (
                        <CustomSelectItem key={team.id} value={team.id.toString()}>
                          {team.name}
                        </CustomSelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <CustomSelectItem key={status} value={status}>
                      {statusLabels[status]}
                    </CustomSelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Attachments</FormLabel>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path 
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
              <div className="flex text-sm text-slate-600 justify-center">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    multiple
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-slate-500">PNG, JPG, PDF up to 10MB</p>

              {/* Display selected files */}
              {attachments.length > 0 && (
                <div className="mt-2 text-left">
                  <p className="text-xs font-medium text-slate-700">Selected files:</p>
                  <ul className="mt-1 text-xs text-slate-500">
                    {attachments.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <FormDescription className="text-xs mt-2">
            Note: File upload functionality is not fully implemented in this MVP. Files will be tracked but not stored.
          </FormDescription>
        </div>

        <div className="flex justify-end space-x-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={createIncidentMutation.isPending}
          >
            {createIncidentMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Incident
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default IncidentForm;
