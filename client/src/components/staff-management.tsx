import { useState } from "react";
import { useStaff, useCreateStaff, useDeleteStaff } from "@/hooks/use-queue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function StaffManagement() {
  const { toast } = useToast();
  const { data: staff = [], isLoading } = useStaff();
  const createStaff = useCreateStaff();
  const deleteStaff = useDeleteStaff();
  const [newStaffName, setNewStaffName] = useState("");

  const handleAddStaff = async () => {
    if (!newStaffName.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a staff member name.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createStaff.mutateAsync({ name: newStaffName.trim() });
      setNewStaffName("");
      toast({
        title: "Staff Added",
        description: `${newStaffName} has been added to the staff list.`,
      });
    } catch (error) {
      toast({
        title: "Failed to Add Staff",
        description: "Could not add staff member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStaff = async (id: number, name: string) => {
    try {
      await deleteStaff.mutateAsync(id);
      toast({
        title: "Staff Removed",
        description: `${name} has been removed from the staff list.`,
      });
    } catch (error) {
      toast({
        title: "Failed to Remove Staff",
        description: "Could not remove staff member. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-black border-2">
      <CardHeader className="bg-yellow-400 border-b-2 border-black">
        <CardTitle className="text-black font-bold">Staff Management</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Label htmlFor="staffName" className="text-sm font-medium text-black">
                Add Staff Member
              </Label>
              <Input
                id="staffName"
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                placeholder="Enter staff member name"
                className="mt-1 border-2 border-black"
                onKeyPress={(e) => e.key === 'Enter' && handleAddStaff()}
              />
            </div>
            <Button
              onClick={handleAddStaff}
              disabled={createStaff.isPending}
              className="mt-6 bg-yellow-400 hover:bg-yellow-500 text-black border-2 border-black"
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-black">Current Staff Members</Label>
            {isLoading ? (
              <div className="text-gray-600">Loading staff...</div>
            ) : staff.length === 0 ? (
              <div className="text-gray-600 italic">No staff members added yet</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {staff.map((member) => (
                  <Badge
                    key={member.id}
                    variant="secondary"
                    className="bg-blue-100 text-black border-2 border-black flex items-center gap-2 px-3 py-1"
                  >
                    {member.name}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteStaff(member.id, member.name)}
                      className="h-4 w-4 p-0 hover:bg-red-200"
                      disabled={deleteStaff.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}