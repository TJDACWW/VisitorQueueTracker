import { useEffect, useState } from "react";
import { useGroups } from "@/hooks/use-queue";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TurnNotification {
  id: string;
  groupId: number;
  groupName: string;
  staffMember: string;
  timestamp: number;
}

export function TurnNotifications() {
  const { data: groups = [] } = useGroups();
  const [notifications, setNotifications] = useState<TurnNotification[]>([]);
  const [processedGroups, setProcessedGroups] = useState<Set<number>>(new Set());

  useEffect(() => {
    const now = Date.now();
    
    groups.forEach(group => {
      if (
        group.status === "in-progress" &&
        group.startTime &&
        group.activityDuration &&
        group.assignedStaff &&
        !processedGroups.has(group.id)
      ) {
        const startTime = new Date(group.startTime).getTime();
        const duration = group.activityDuration * 60 * 1000; // Convert to milliseconds
        const endTime = startTime + duration;
        
        if (now >= endTime) {
          const notification: TurnNotification = {
            id: `${group.id}-${now}`,
            groupId: group.id,
            groupName: `Group #${group.id} (${group.members[0] || 'Unknown'})`,
            staffMember: group.assignedStaff,
            timestamp: now,
          };
          
          setNotifications(prev => [...prev, notification]);
          setProcessedGroups(prev => new Set(prev).add(group.id));
        }
      }
    });
  }, [groups, processedGroups]);

  // Clean up processed groups when groups are completed
  useEffect(() => {
    const currentInProgressIds = new Set(
      groups.filter(g => g.status === "in-progress").map(g => g.id)
    );
    
    setProcessedGroups(prev => {
      const newSet = new Set<number>();
      prev.forEach(id => {
        if (currentInProgressIds.has(id)) {
          newSet.add(id);
        }
      });
      return newSet;
    });
  }, [groups]);

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const dismissAll = () => {
    setNotifications([]);
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.length > 1 && (
        <Button
          onClick={dismissAll}
          className="w-full bg-red-500 hover:bg-red-600 text-white border-2 border-black text-xs"
          size="sm"
        >
          Dismiss All ({notifications.length})
        </Button>
      )}
      
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="turn-notification bg-yellow-400 text-black border-2 border-black rounded-lg p-3 shadow-lg max-w-sm"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-bold">{notification.groupName}</div>
                <div>Time completed!</div>
                <div className="text-xs opacity-75">
                  Staff: {notification.staffMember}
                </div>
              </div>
            </div>
            <Button
              onClick={() => dismissNotification(notification.id)}
              className="h-6 w-6 p-0 bg-transparent hover:bg-black/10 text-black"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}