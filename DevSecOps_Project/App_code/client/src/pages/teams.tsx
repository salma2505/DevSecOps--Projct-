import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Search, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

// Define form validation schema
const teamFormSchema = z.object({
  name: z.string().min(3, "Team name must be at least 3 characters"),
});

type TeamFormValues = z.infer<typeof teamFormSchema>;
type Team = { id: number; name: string };

const Teams = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // Fetch teams
  const {
    data: teams = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  // Filter teams by search query
  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      const res = await apiRequest("POST", "/api/teams", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Team created",
        description: "The team has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create team",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create form
  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: "",
    },
  });

  // Handle form submission
  const onSubmit = (data: TeamFormValues) => {
    createTeamMutation.mutate(data);
  };

  return (
    <div className="container py-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Teams</h1>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:min-w-[300px]">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search teams..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Team
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a new team</DialogTitle>
                  <DialogDescription>
                    Add a new team to the system. Teams can be assigned to incidents.
                  </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Team Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter team name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={createTeamMutation.isPending}
                      >
                        {createTeamMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Create Team
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-destructive">Failed to load teams</p>
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-64">
          <p className="text-muted-foreground">No teams found</p>
          {searchQuery && (
            <Button
              variant="link"
              onClick={() => setSearchQuery("")}
              className="mt-2"
            >
              Clear search
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <Card key={team.id}>
              <CardHeader>
                <CardTitle>{team.name}</CardTitle>
                <CardDescription>Team ID: {team.id}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Responsible for handling incidents assigned to this team
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Teams;