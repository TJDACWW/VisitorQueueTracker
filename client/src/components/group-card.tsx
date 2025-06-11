import { useState } from "react";
import { useUpdateGroup } from "@/hooks/use-queue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Clock, Play, Check } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { staffMembers } from "@shared/schema";
import type { Group } from "@shared/schema";

interface GroupCardProps {
  group: Group;
  waitTime?: { waitMinutes: number; estimatedTime: string };
}

export function GroupCard({ group, waitTime }: GroupCardProps) {
  const { toast } = useToast();
  const updateGroup = useUpdateGroup();
  const [notes, setNotes] = useState(group.notes || "");

  const handleStatusChange = async (newStatus: "waiting" | "in-progress" | "completed") => {
    try {
      await updateGroup.mutateAsync({
        id: group.id,
        updates: { status: newStatus }
      });
      
      toast({
        title: "Status Updated",
        description: `Group ${newStatus === "in-progress" ? "started" : newStatus === "completed" ? "completed" : "moved to waiting"}.`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update group status.",
        variant: "destructive",
      });
    }
  };

  const handleStaffChange = async (staffMember: string) => {
    try {
      await updateGroup.mutateAsync({
        id: group.id,
        updates: { assignedStaff: staffMember }
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to assign staff member.",
        variant: "destructive",
      });
    }
  };

  const handlePresentChange = async (checked: boolean | "indeterminate") => {
    const present = checked === true;
    try {
      await updateGroup.mutateAsync({
        id: group.id,
        updates: { present }
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update attendance.",
        variant: "destructive",
      });
    }
  };

  const handleNotesChange = async () => {
    if (notes === group.notes) return;
    
    try {
      await updateGroup.mutateAsync({
        id: group.id,
        updates: { notes }
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update notes.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-progress": return "bg-blue-100 text-blue-800 border border-blue-200";
      case "completed": return "bg-green-100 text-green-800 border border-green-200";
      default: return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case "in-progress": return "w-3 h-3 bg-blue-600 rounded-full";
      case "completed": return "w-3 h-3 bg-green-600 rounded-full";
      default: return "w-3 h-3 bg-gray-400 rounded-full";
    }
  };

  const isInProgress = group.status === "in-progress";
  const isWaiting = group.status === "waiting";
  const isCompleted = group.status === "completed";

  return (
    <Card className={`mb-3 ${isInProgress ? "border-blue-600 bg-blue-50" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className={getStatusIndicator(group.status)} />
              <h3 className="font-semibold text-gray-900">{group.contactName}</h3>
              <Badge className={getStatusColor(group.status)}>
                {group.status.toUpperCase().replace("-", " ")}
              </Badge>
              {isInProgress && group.startTime && (
                <span className="text-sm text-gray-600">
                  Started: {formatTime(group.startTime)}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
              <span className="flex items-center">
                <Users className="mr-1 h-4 w-4" />
                {group.size} people
              </span>
              
              {isWaiting && waitTime && (
                <span className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  Wait: {waitTime.waitMinutes} min | Until: {waitTime.estimatedTime}
                </span>
              )}
              
              {isInProgress && group.endTime && (
                <span className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  Ends: {formatTime(group.endTime)}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <Select
                value={group.assignedStaff || "unassigned"}
                onValueChange={(value) => handleStaffChange(value === "unassigned" ? "" : value)}
              >
                <SelectTrigger className="w-40 text-sm">
                  <SelectValue placeholder="Assign Staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Assign Staff</SelectItem>
                  {staffMembers.map((staff) => (
                    <SelectItem key={staff} value={staff}>
                      {staff}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <label className="flex items-center text-sm">
                <Checkbox
                  checked={group.present || false}
                  onCheckedChange={handlePresentChange}
                  className="mr-2"
                />
                Present
              </label>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            {isWaiting && (
              <Button
                onClick={() => handleStatusChange("in-progress")}
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
                disabled={updateGroup.isPending}
              >
                <Play className="mr-1 h-4 w-4" />
                Start
              </Button>
            )}
            
            {isInProgress && (
              <Button
                onClick={() => handleStatusChange("completed")}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
                disabled={updateGroup.isPending}
              >
                <Check className="mr-1 h-4 w-4" />
                Complete
              </Button>
            )}
          </div>
        </div>
        
        <div className="mt-3">
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleNotesChange}
            placeholder="Add notes..."
            className="text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
}
