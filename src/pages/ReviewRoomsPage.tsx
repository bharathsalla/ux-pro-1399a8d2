import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SiteNav from "@/components/SiteNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Plus,
  Lock,
  Globe,
  Clock,
  MessageCircle,
  Trash2,
  Copy,
  ExternalLink,
  Loader2,
  Users,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import CreateRoomModal from "@/components/rooms/CreateRoomModal";

interface Room {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  preview_url: string | null;
  is_private: boolean;
  expiry_days: number;
  expires_at: string;
  is_expired: boolean;
  created_at: string;
  creator_id: string;
}

export default function ReviewRoomsPage() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    const { data, error } = await supabase
      .from("review_rooms")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setRooms(data as unknown as Room[]);
    setLoading(false);
  };

  const handleDelete = async (roomId: string) => {
    const { error } = await supabase.from("review_rooms").delete().eq("id", roomId);
    if (error) {
      toast.error("Failed to delete room");
    } else {
      toast.success("Room deleted");
      fetchRooms();
    }
  };

  const copyLink = (roomId: string) => {
    const url = `${window.location.origin}${window.location.pathname}#/room/${roomId}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    if (diff <= 0) return "Expired";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <div className="max-w-[1200px] mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">
                Review Rooms
              </h1>
              <p className="text-muted-foreground text-sm max-w-xl">
                Create structured visual feedback rooms for async UX & design review. Share with your team or publicly — no signup required for reviewers.
              </p>
            </div>
            <Button onClick={() => setShowCreate(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Room
            </Button>
          </div>
        </motion.div>

        {/* Rooms Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : rooms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
              <Users className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No review rooms yet</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
              Create your first review room to start collecting structured design feedback.
            </p>
            <Button onClick={() => setShowCreate(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Room
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rooms.map((room, i) => {
              const isExpired = room.is_expired || new Date(room.expires_at) <= new Date();
              const isOwner = user?.id === room.creator_id;

              return (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card
                    className={`overflow-hidden border transition-all duration-200 hover:shadow-md cursor-pointer group ${
                      isExpired ? "opacity-60" : ""
                    }`}
                    onClick={() => navigate(`/room/${room.id}`)}
                  >
                    {/* Thumbnail */}
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      {room.image_url ? (
                        <img
                          src={room.image_url}
                          alt={room.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MessageCircle className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                      )}
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            room.is_private
                              ? "bg-destructive/90 text-destructive-foreground"
                              : "bg-primary/90 text-primary-foreground"
                          }`}
                        >
                          {room.is_private ? (
                            <>
                              <Lock className="h-2.5 w-2.5" /> Private
                            </>
                          ) : (
                            <>
                              <Globe className="h-2.5 w-2.5" /> Public
                            </>
                          )}
                        </span>
                        {isExpired && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-muted-foreground/80 text-background">
                            Expired
                          </span>
                        )}
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm text-foreground mb-1 truncate">
                        {room.title}
                      </h3>
                      {room.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                          {room.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {isExpired ? "Expired" : getTimeRemaining(room.expires_at)}
                        </span>
                        <span>{formatDistanceToNow(new Date(room.created_at), { addSuffix: true })}</span>
                      </div>

                      {/* Actions */}
                      {isOwner && (
                        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyLink(room.id);
                            }}
                          >
                            <Copy className="h-3 w-3" />
                            Copy Link
                          </Button>
                          <div className="flex-1" />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(room.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && (
          <CreateRoomModal
            onClose={() => setShowCreate(false)}
            onCreated={() => {
              setShowCreate(false);
              fetchRooms();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
