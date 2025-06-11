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
  contactName: z.string().min(1, "Contact name is required"),
  members: z.string().min(1, "At least one group member is required"),
  size: z.number().min(1, "Group size must be at least 1").max(20, "Group size cannot exceed 20"),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export function RegistrationForm() {
  const { toast } = useToast();
  const createGroup = useCreateGroup();
  const { data: groups = [] } = useGroups();
  const { data: settings = [] } = useSettings();
  
  const concurrentGroups = parseInt(settings.find(s => s.key === "concurrentGroups")?.value || "2");
  const activityDuration = parseInt(settings.find(s => s.key === "activityDuration")?.value || "10");
  
  const { waitMinutes, estimatedTime } = calculateWaitTime(groups, concurrentGroups, activityDuration);
  
  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      contactName: "",
      members: "",
      size: 1,
    },
  });

  const onSubmit = async (data: RegistrationForm) => {
    try {
      const members = data.members
        .split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0);
      
      await createGroup.mutateAsync({
        contactName: data.contactName,
        members,
        size: data.size,
        status: "waiting",
        assignedStaff: null,
        notes: "",
        present: true,
        startTime: null,
        endTime: null,
      });
      
      form.reset();
      toast({
        title: "Group Registered",
        description: `${data.contactName}'s group has been added to the queue.`,
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
            <Label htmlFor="contactName" className="text-sm font-medium text-gray-700">
              Main Contact Name *
            </Label>
            <Input
              id="contactName"
              {...form.register("contactName")}
              placeholder="Enter contact name"
              className="mt-2"
            />
            {form.formState.errors.contactName && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.contactName.message}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="members" className="text-sm font-medium text-gray-700">
              Group Members
            </Label>
            <Textarea
              id="members"
              {...form.register("members")}
              rows={3}
              placeholder="Enter names of all group members (one per line)"
              className="mt-2 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">Include the main contact in this list</p>
            {form.formState.errors.members && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.members.message}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="size" className="text-sm font-medium text-gray-700">
              Total Group Size
            </Label>
            <div className="relative mt-2">
              <Input
                id="size"
                type="number"
                min="1"
                max="20"
                {...form.register("size", { valueAsNumber: true })}
                className="pr-10"
              />
              <Users className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
            {form.formState.errors.size && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.size.message}
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
