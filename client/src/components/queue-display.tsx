import { useGroups, useQueueStats, useSettings, calculateWaitTime } from "@/hooks/use-queue";
import { AdminControls } from "./admin-controls";
import { GroupCard } from "./group-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function QueueDisplay() {
  const { data: groups = [], isLoading: groupsLoading } = useGroups();
  const { data: stats, isLoading: statsLoading } = useQueueStats();
  const { data: settings = [] } = useSettings();
  
  const concurrentGroups = parseInt(settings.find(s => s.key === "concurrentGroups")?.value || "2");
  const activityDuration = parseInt(settings.find(s => s.key === "activityDuration")?.value || "10");
  
  const waitingGroups = groups.filter(g => g.status === "waiting").sort((a, b) => a.queuePosition - b.queuePosition);
  const inProgressGroups = groups.filter(g => g.status === "in-progress");
  const completedGroups = groups.filter(g => g.status === "completed");

  if (groupsLoading || statsLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <AdminControls />
      
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-xl font-semibold text-gray-900">Current Queue</CardTitle>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-gray-600">
              Total Visitors: <span className="font-semibold text-blue-600">{stats?.totalVisitors || 0}</span>
            </span>
            <span className="text-gray-600">
              Groups in Queue: <span className="font-semibold text-blue-600">{stats?.groupsInQueue || 0}</span>
            </span>
          </div>
        </div>
        
        {/* Status Legend */}
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-400 rounded-full" />
            <span className="text-gray-600">Waiting</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-600 rounded-full" />
            <span className="text-gray-600">In Progress</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-600 rounded-full" />
            <span className="text-gray-600">Completed</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-6">
        {/* In Progress Groups */}
        {inProgressGroups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
        
        {/* Waiting Groups */}
        {waitingGroups.map((group) => {
          const waitTime = calculateWaitTime(groups, concurrentGroups, activityDuration, group.id);
          return (
            <GroupCard key={group.id} group={group} waitTime={waitTime} />
          );
        })}
        
        {groups.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg font-medium">No groups in queue</p>
            <p className="text-sm">Register a group to get started</p>
          </div>
        )}
      </CardContent>
      
      {/* Queue Summary */}
      <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-xl">
        <div className="flex justify-between items-center text-sm">
          <div className="flex space-x-6">
            <span className="text-gray-600">
              Groups Completed Today: <span className="font-semibold text-green-600">{completedGroups.length}</span>
            </span>
            {completedGroups.length > 0 && (
              <span className="text-gray-600">
                Average Duration: <span className="font-semibold">
                  {Math.round(completedGroups.reduce((acc, group) => {
                    if (group.startTime && group.endTime) {
                      const duration = (new Date(group.endTime).getTime() - new Date(group.startTime).getTime()) / (1000 * 60);
                      return acc + duration;
                    }
                    return acc;
                  }, 0) / completedGroups.length)} min
                </span>
              </span>
            )}
          </div>
          <div className="text-right">
            <span className="text-gray-600">
              Total Visitors Today: <span className="font-bold text-blue-600 text-lg">{stats?.totalVisitors || 0}</span>
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
