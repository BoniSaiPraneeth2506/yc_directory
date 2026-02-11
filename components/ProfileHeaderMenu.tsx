"use client";

import { Menu, LogOut, Settings, Info } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { logoutUser } from "@/lib/actions";

interface ProfileHeaderMenuProps {
  isOwnProfile: boolean;
  user: {
    name: string;
    _createdAt?: string;
    _updatedAt?: string;
    joinedAt?: string;
  };
}

export function ProfileHeaderMenu({ isOwnProfile, user }: ProfileHeaderMenuProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to logout?")) {
      return;
    }
    
    setIsLoggingOut(true);
    try {
      await logoutUser();
      toast.success("Logged out successfully!");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
      setIsLoggingOut(false);
    }
  };

  const handleSettings = () => {
    toast.info("Settings page coming soon!");
  };

  const handleProfileInfo = () => {
    const createdDate = user._createdAt ? new Date(user._createdAt) : null;
    const updatedDate = user._updatedAt ? new Date(user._updatedAt) : null;
    
    const message = [
      createdDate ? `Profile Created: ${createdDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}` : null,
      updatedDate ? `Last Updated: ${updatedDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}` : null,
    ].filter(Boolean).join('\n') || 'Profile information not available';

    toast.info(message, {
      duration: 4000,
    });
  };

  // Only show menu if it's the user's own profile
  if (!isOwnProfile) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 bg-white text-black border-2 border-black hover:bg-gray-100 hover:text-black transition-colors shadow-sm rounded-lg"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Profile options</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-lg rounded-lg p-1">
        <DropdownMenuItem onClick={handleProfileInfo} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded-md py-1.5 px-3 transition-colors min-h-[36px]">
          <Info className="h-4 w-4" />
          <span>Profile Info</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleSettings} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded-md py-1.5 px-3 transition-colors min-h-[36px]">
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="my-0.5" />
        
        <DropdownMenuItem 
          onClick={handleLogout} 
          disabled={isLoggingOut}
          className="flex items-center gap-2 cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 focus:text-red-700 focus:bg-red-50 rounded-md py-1.5 px-3 transition-colors min-h-[36px]"
        >
          <LogOut className="h-4 w-4" />
          <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}