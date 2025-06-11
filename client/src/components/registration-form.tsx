import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateGroup, useGroups, useSettings, calculateWaitTime } from "@/hooks/use-queue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const registrationSchema = z.object({
  members: z.string().min(1, "At least one group member is required"),
  activityDuration: z.number().min(5, "Activity duration must be at least 5 minutes").max(30, "Activity duration cannot exceed 30 minutes"),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export function RegistrationForm() {
  const { toast } = useToast();
  const createGroup = useCreateGroup();
  const { data: groups = [] } = useGroups();
  const { data: settings = [] } = useSettings();
  
  const settingsArray = Array.isArray(settings) ? settings : [];
  const concurrentGroups = parseInt(settingsArray.find(s => s.key === "concurrentGroups")?.value || "2");
  const defaultActivityDuration = parseInt(settingsArray.find(s => s.key === "activityDuration")?.value || "10");
  
  const { waitMinutes, estimatedTime } = calculateWaitTime(groups, concurrentGroups, defaultActivityDuration);
  
  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      members: "",
      activityDuration: defaultActivityDuration,
    },
  });

  const membersValue = form.watch("members");
  const membersList = membersValue
    .split('\n')
    .map(name => name.trim())
    .filter(name => name.length > 0);
  const groupSize = membersList.length;

  const onSubmit = async (data: RegistrationForm) => {
    try {
      const members = data.members
        .split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0);
      
      if (members.length === 0) {
        toast({
          title: "Invalid Input",
          description: "Please enter at least one group member.",
          variant: "destructive",
        });
        return;
      }
      
      await createGroup.mutateAsync({
        members,
        status: "waiting",
        assignedStaff: null,
        notes: null,
        present: false,
        startTime: null,
        endTime: null,
        activityDuration: data.activityDuration,
      });
      
      form.reset();
      toast({
        title: "Group Registered",
        description: `Group of ${members.length} has been added to the queue.`,
      });
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Failed to register group. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900">
            Group Registration
          </CardTitle>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Open
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="members" className="text-sm font-medium text-gray-700">
              Group Members *
            </Label>
            <Textarea
              id="members"
              {...form.register("members")}
              rows={4}
              placeholder="Enter all group member names (one per line)"
              className="mt-2 resize-none"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Enter one name per line</span>
              <span className="font-medium">
                {groupSize > 0 ? `${groupSize} member${groupSize !== 1 ? 's' : ''}` : '0 members'}
              </span>
            </div>
            {form.formState.errors.members && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.members.message}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="activityDuration" className="text-sm font-medium text-gray-700">
              Activity Duration (minutes)
            </Label>
            <div className="relative mt-2">
              <Input
                id="activityDuration"
                type="number"
                min="5"
                max="30"
                {...form.register("activityDuration", { valueAsNumber: true })}
                className="pr-10"
              />
              <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
            {form.formState.errors.activityDuration && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.activityDuration.message}
              </p>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={createGroup.isPending}
          >
            {createGroup.isPending ? (
              "Registering..."
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Register Group
              </>
            )}
          </Button>
        </form>
        
        {/* Wait Time Display */}
        <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Current Wait Time</p>
            <p className="text-2xl font-bold text-orange-600">
              {waitMinutes > 0 ? `${waitMinutes} minutes` : "No wait"}
            </p>
            <p className="text-sm text-gray-600">
              {waitMinutes > 0 ? `Wait until ${estimatedTime}` : "Ready now"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
