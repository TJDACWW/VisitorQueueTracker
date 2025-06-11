import { useSettings, useUpdateSetting } from "@/hooks/use-queue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Coffee, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AdminControls() {
  const { toast } = useToast();
  const { data: settings = [] } = useSettings();
  const updateSetting = useUpdateSetting();
  
  const settingsArray = Array.isArray(settings) ? settings : [];
  const concurrentGroups = parseInt(settingsArray.find(s => s.key === "concurrentGroups")?.value || "2");
  const activityDuration = parseInt(settingsArray.find(s => s.key === "activityDuration")?.value || "10");
  const isBreakTime = settingsArray.find(s => s.key === "isBreakTime")?.value === "true";
  const breakStartTime = settingsArray.find(s => s.key === "breakStartTime")?.value || "";
  const breakEndTime = settingsArray.find(s => s.key === "breakEndTime")?.value || "";

  const handleConcurrentGroupsChange = async (value: string) => {
    try {
      await updateSetting.mutateAsync({ key: "concurrentGroups", value });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update concurrent groups setting.",
        variant: "destructive",
      });
    }
  };

  const handleBreakStartTimeChange = async (value: string) => {
    try {
      await updateSetting.mutateAsync({ key: "breakStartTime", value });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update break start time.",
        variant: "destructive",
      });
    }
  };

  const handleBreakEndTimeChange = async (value: string) => {
    try {
      await updateSetting.mutateAsync({ key: "breakEndTime", value });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update break end time.",
        variant: "destructive",
      });
    }
  };

  const handleBreakTime = async () => {
    try {
      await updateSetting.mutateAsync({ key: "isBreakTime", value: (!isBreakTime).toString() });
      toast({
        title: isBreakTime ? "Break Time Ended" : "Break Time Started",
        description: isBreakTime ? "Activities can resume." : "All activities paused for break.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to toggle break time.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="border-b border-gray-200 p-4 bg-gray-50 rounded-t-xl">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <Label className="text-sm font-medium text-gray-700">Concurrent Groups:</Label>
          <Select value={concurrentGroups.toString()} onValueChange={handleConcurrentGroupsChange}>
            <SelectTrigger className="w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Label className="text-sm font-medium text-gray-700">Break Start:</Label>
          <Input
            type="time"
            value={breakStartTime}
            onChange={(e) => handleBreakStartTimeChange(e.target.value)}
            className="w-24"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Label className="text-sm font-medium text-gray-700">Break End:</Label>
          <Input
            type="time"
            value={breakEndTime}
            onChange={(e) => handleBreakEndTimeChange(e.target.value)}
            className="w-24"
          />
        </div>
        
        <Button
          onClick={handleBreakTime}
          variant={isBreakTime ? "destructive" : "secondary"}
          size="sm"
          className={isBreakTime ? "bg-red-600 hover:bg-red-700" : "bg-orange-500 hover:bg-orange-600 text-white"}
        >
          <Coffee className="mr-1 h-4 w-4" />
          {isBreakTime ? "End Break" : "Break Time"}
        </Button>
      </div>
    </div>
  );
}
