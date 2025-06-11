import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Group, InsertGroup, Staff, InsertStaff } from "@shared/schema";

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

export function useStaff() {
  return useQuery<Staff[]>({
    queryKey: ["/api/staff"],
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertStaff) => {
      const response = await apiRequest("POST", "/api/staff", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
    },
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/staff/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
    },
  });
}

export function calculateWaitTime(
  groups: Group[],
  concurrentGroups: number,
  defaultActivityDuration: number,
  targetGroupId?: number
): { waitMinutes: number; estimatedTime: string } {
  const waitingGroups = groups
    .filter(g => g.status === "waiting")
    .sort((a, b) => a.queuePosition - b.queuePosition);

  const inProgressGroups = groups.filter(g => g.status === "in-progress");
  const slotsBeingUsed = inProgressGroups.length;
  const availableSlots = Math.max(0, concurrentGroups - slotsBeingUsed);
  
  if (targetGroupId) {
    const targetIndex = waitingGroups.findIndex(g => g.id === targetGroupId);
    if (targetIndex === -1) return { waitMinutes: 0, estimatedTime: "Now" };
    
    // Only count wait time if the group position exceeds available slots
    if (targetIndex < availableSlots) {
      return { waitMinutes: 0, estimatedTime: "Now" };
    }
    
    // Calculate wait time based on groups ahead that need to wait
    const groupsAheadToWait = targetIndex - availableSlots;
    const target = waitingGroups[targetIndex];
    const activityDuration = target.activityDuration || defaultActivityDuration;
    
    // Calculate batches of concurrent groups that need to complete first
    const batchesNeeded = Math.ceil((groupsAheadToWait + 1) / concurrentGroups);
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
  
  if (totalWaiting < concurrentGroups) {
    return { waitMinutes: 0, estimatedTime: "Now" };
  }
  
  // Only groups beyond the concurrent limit need to wait
  const groupsToWaitFor = totalWaiting - availableSlots + 1;
  if (groupsToWaitFor <= 0) {
    return { waitMinutes: 0, estimatedTime: "Now" };
  }
  
  const batchesNeeded = Math.ceil(groupsToWaitFor / concurrentGroups);
  const waitMinutes = batchesNeeded * defaultActivityDuration;
  
  const estimatedTime = new Date(Date.now() + waitMinutes * 60000)
    .toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  
  return { waitMinutes, estimatedTime };
}
