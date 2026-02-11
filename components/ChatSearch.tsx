"use client";

import { useState, useEffect } from "react";
import { searchUsers, getOrCreateConversation } from "@/lib/chat-actions";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "./ui/input";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

type User = {
  _id: string;
  name: string;
  image: string;
  username: string;
  bio?: string;
};

export function ChatSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();

  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      handleSearch();
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const users = await searchUsers(debouncedQuery);
      setResults(users);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = async (userId: string) => {
    setSelectedUser(userId);
    try {
      const conversation = await getOrCreateConversation(userId);
      router.push(`/messages/${conversation._id}`);
    } catch (error) {
      console.error("Error creating conversation:", error);
    } finally {
      setSelectedUser(null);
    }
  };

  return (
    <div className="relative">
      <div className="search-form !mt-0 !min-h-[56px] sm:!min-h-[64px] !border-[4px] !py-2">
        <input
          type="text"
          placeholder="Search Users"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        <div className="flex items-center gap-2">
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(""); setResults([]); }}
              className="size-7 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center transition-colors"
            >
              <X className="size-3.5 text-white" />
            </button>
          )}
          <span className="search-btn text-white">
            <Search className="size-5" />
          </span>
        </div>
      </div>

      {query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white border-[4px] border-black rounded-[22px] shadow-200 max-h-[400px] overflow-y-auto z-50">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-12 h-12 bg-white-100 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white-100 rounded w-1/3" />
                    <div className="h-3 bg-white-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-black-300 font-medium">No users found for "<span className="text-primary font-bold">{query}</span>"</p>
              <p className="text-sm text-black-300 mt-1">Try a different name or username</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {results.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleUserClick(user._id)}
                  disabled={selectedUser === user._id}
                  className="w-full flex items-center gap-3 p-4 hover:bg-primary-100 transition-all text-left disabled:opacity-50 first:rounded-t-[18px] last:rounded-b-[18px]"
                >
                  <Image
                    src={user.image || "/placeholder-user.png"}
                    alt={user.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover border-2 border-white shadow-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-black truncate">
                      {user.name}
                    </h3>
                    <p className="text-sm text-black-300 truncate font-medium">
                      @{user.username}
                    </p>
                  </div>
                  {selectedUser === user._id && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
