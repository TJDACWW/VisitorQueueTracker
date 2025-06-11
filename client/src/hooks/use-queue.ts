import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Group, InsertGroup } from "@shared/schema";

export function useGroups() {
  return useQuery<Group[]>({
    queryKey: ["/api/groups"],
  });
}

export function useQueueStats() {
  return useQuery({
    queryKey: ["/api/queue/stats"],
  });
}

export function useSettings() {
  return useQuery({
    queryKey: ["/api/settings"],
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertGroup) => {
      const response = await apiRequest("POST", "/api/groups", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/queue/stats"] });
    },
  });
}

export function useUpdateGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Group> }) => {
      const response = await apiRequest("PATCH", `/api/groups/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/queue/stats"] });
    },
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const response = await apiRequest("PUT", `/api/settings/${key}`, { value });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
  });
}

export function calculateWaitTime(
  groups: Group[],
  concurrentGroups: number,
  activityDuration: number,
  targetGroupId?: number
): { waitMinutes: number; estimatedTime: string } {
  const waitingGroups = groups
    .filter(g => g.status === "waiting")
    .sort((a, b) => a.queuePosition - b.queuePosition);

  const inProgressGroups = groups.filter(g => g.status === "in-progress");
  
  if (targetGroupId) {
    const targetIndex = waitingGroups.findIndex(g => g.id === targetGroupId);
    if (targetIndex === -1) return { waitMinutes: 0, estimatedTime: "Now" };
    
    const groupsAhead = targetIndex;
    const slotsBeingUsed = inProgressGroups.length;
    const availableSlots = Math.max(0, concurrentGroups - slotsBeingUsed);
    
    if (groupsAhead < availableSlots) {
      return { waitMinutes: 0, estimatedTime: "Now" };
    }
    
    const groupsToWaitFor = groupsAhead - availableSlots;
    const batchesNeeded = Math.ceil(groupsToWaitFor / concurrentGroups);
    const waitMinutes = batchesNeeded * activityDuration;
    
    const estimatedTime = new Date(Date.now() + waitMinutes * 60000)
      .toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    
    return { waitMinutes, estimatedTime };
  }
  
  // Calculate for next group to register
  const totalWaiting = waitingGroups.length;
  const slotsBeingUsed = inProgressGroups.length;
  const availableSlots = Math.max(0, concurrentGroups - slotsBeingUsed);
  
  if (totalWaiting < availableSlots) {
    return { waitMinutes: 0, estimatedTime: "Now" };
  }
  
  const groupsToWaitFor = totalWaiting - availableSlots + 1;
  const batchesNeeded = Math.ceil(groupsToWaitFor / concurrentGroups);
  const waitMinutes = batchesNeeded * activityDuration;
  
  const estimatedTime = new Date(Date.now() + waitMinutes * 60000)
    .toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  
  return { waitMinutes, estimatedTime };
}
