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
  Loader2,
  Users,
  Image as ImageIcon,
  ExternalLink,
  ArrowRight,
  Share2,
  Mail,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import CreateRoomModal from "@/components/rooms/CreateRoomModal";
import ShareRoomModal from "@/components/rooms/ShareRoomModal";

interface Room {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  preview_url: string | null;
  is_private: boolean;
  passcode: string | null;
  expiry_days: number;
  expires_at: string;
  is_expired: boolean;
  created_at: string;
  creator_id: string;
}

interface RoomShare {
  id: string;
  room_id: string;
  shared_by: string;
  shared_to_email: string;
  status: string;
  created_at: string;
  sharer_name?: string;
  passcode?: string | null;
}

export default function ReviewRoomsPage() {
  const { user, profile } = useAuthContext();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [sharedRoomIds, setSharedRoomIds] = useState<Map<string, RoomShare>>(new Map());
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [shareRoom, setShareRoom] = useState<Room | null>(null);

  useEffect(() => {
    fetchRooms();
    if (user) fetchSharedWithMe();
  }, [user]);

  const fetchRooms = async () => {
    const { data, error } = await supabase
      .from("review_rooms")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setRooms(data as unknown as Room[]);
    setLoading(false);
  };

  const fetchSharedWithMe = async () => {
    if (!user || !profile?.email) return;
    const { data } = await supabase
      .from("room_shares")
      .select("*")
      .or(`shared_to_user.eq.${user.id},shared_to_email.eq.${profile.email}`)
      .eq("status", "pending");

    if (data && data.length > 0) {
      const sharerIds = [...new Set((data as any[]).map((s: any) => s.shared_by))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name")
        .in("id", sharerIds);

      const nameMap = new Map((profiles || []).map((p: any) => [p.id, p.name]));
      const shareMap = new Map<string, RoomShare>();
      (data as any[]).forEach((s: any) => {
        shareMap.set(s.room_id, { ...s, sharer_name: nameMap.get(s.shared_by) || "Someone", passcode: s.passcode || null });
      });
      setSharedRoomIds(shareMap);
    }
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

  const getFigmaEmbedUrl = (url: string) => {
    if (url.includes("figma.com")) {
      return `https://www.figma.com/embed?embed_host=fixux&url=${encodeURIComponent(url)}`;
    }
    return null;
  };

  const getRoomPreview = (room: Room) => {
    if (room.image_url) {
      return (
        <img
          src={room.image_url}
          alt={room.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
      );
    }
    if (room.preview_url) {
      const figmaEmbed = getFigmaEmbedUrl(room.preview_url);
      if (figmaEmbed) {
        return (
          <div className="w-full h-full relative">
            <iframe
              src={figmaEmbed}
              className="w-full h-full border-0 pointer-events-none"
              title={room.title}
              loading="lazy"
            />
            <div className="absolute inset-0" /> {/* overlay to prevent interaction */}
          </div>
        );
      }
      return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/5 to-primary/10">
          <ExternalLink className="h-6 w-6 text-primary/40" />
          <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[80%]">
            {room.preview_url}
          </span>
        </div>
      );
    }
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted">
        <ImageIcon className="h-8 w-8 text-muted-foreground/20" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      {/* Hero Section */}
      <section className="border-b border-border">
        <div className="max-w-[1200px] mx-auto px-6 py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[9px] font-bold px-2.5 py-1 bg-primary text-primary-foreground uppercase tracking-[0.15em] rounded-full">
                ✨ New Feature
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight leading-[1.1] mb-4">
              Review Rooms
            </h1>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-8 max-w-xl">
              Create structured visual feedback rooms for async UX & design review. 
              Share with your team or publicly — no signup required for reviewers.
            </p>
            <Button
              onClick={() => setShowCreate(true)}
              size="lg"
              className="gap-2 text-sm font-bold"
            >
              <Plus className="h-4 w-4" />
              Create Review Room
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Rooms Grid */}
      <section className="max-w-[1200px] mx-auto px-6 py-12">
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
            <h3 className="text-xl font-bold text-foreground mb-2">No review rooms yet</h3>
            <p className="text-muted-foreground text-sm mb-8 max-w-sm mx-auto">
              Create your first review room to start collecting structured design feedback from your team.
            </p>
            <Button onClick={() => setShowCreate(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Room
            </Button>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-[0.15em]">
                Your Rooms ({rooms.length})
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreate(true)}
                className="gap-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                New Room
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {rooms.map((room, i) => {
                const isExpired = room.is_expired || new Date(room.expires_at) <= new Date();
                const isOwner = user?.id === room.creator_id;
                const sharedInfo = sharedRoomIds.get(room.id);

                return (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card
                      className={`overflow-hidden border transition-all duration-300 hover:shadow-lg cursor-pointer group h-full flex flex-col ${
                        isExpired ? "opacity-50 grayscale" : ""
                      }`}
                      onClick={() => navigate(`/room/${room.id}`)}
                    >
                      {/* Thumbnail */}
                      <div className="aspect-[16/10] bg-muted relative overflow-hidden">
                        {getRoomPreview(room)}

                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${
                              room.is_private
                                ? "bg-destructive/90 text-destructive-foreground"
                                : "bg-primary/90 text-primary-foreground"
                            }`}
                          >
                            {room.is_private ? (
                              <><Lock className="h-2.5 w-2.5" /> Private</>
                            ) : (
                              <><Globe className="h-2.5 w-2.5" /> Public</>
                            )}
                          </span>
                          {isExpired && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-muted-foreground/80 text-background backdrop-blur-sm">
                              Expired
                            </span>
                          )}
                        </div>

                        {/* Timer badge */}
                        {!isExpired && (
                          <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-background/80 text-foreground backdrop-blur-sm">
                            <Clock className="h-2.5 w-2.5" />
                            {getTimeRemaining(room.expires_at)}
                          </div>
                        )}
                      </div>

                      <CardContent className="p-5 flex-1 flex flex-col">
                        {/* Shared badge */}
                        {sharedInfo && (
                          <div className="space-y-1.5 mb-2">
                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/5 border border-primary/15">
                              <Mail className="h-3 w-3 text-primary shrink-0" />
                              <span className="text-[10px] font-semibold text-primary">
                                Shared by {sharedInfo.sharer_name}
                              </span>
                              <span className="ml-auto text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                Review Required
                              </span>
                            </div>
                            {sharedInfo.passcode && (
                              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-destructive/5 border border-destructive/15">
                                <Lock className="h-3 w-3 text-destructive shrink-0" />
                                <span className="text-[10px] font-medium text-muted-foreground">Passcode:</span>
                                <code className="text-[10px] font-mono font-bold text-destructive tracking-wider">
                                  {sharedInfo.passcode}
                                </code>
                              </div>
                            )}
                          </div>
                        )}
                        <h3 className="font-bold text-sm text-foreground mb-1.5 truncate">
                          {room.title}
                        </h3>
                        {room.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                            {room.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-auto pt-2">
                          <span className="text-[11px] text-muted-foreground">
                            {formatDistanceToNow(new Date(room.created_at), { addSuffix: true })}
                          </span>
                          {room.preview_url && room.preview_url.includes("figma.com") && (
                            <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                              Figma
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        {isOwner && (
                          <div className="flex items-center gap-1 mt-4 pt-4 border-t border-border">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShareRoom(room);
                              }}
                            >
                              <Share2 className="h-3 w-3" />
                              Share
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
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
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(room.id);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* Info Section */}
      <section className="border-t border-border">
        <div className="max-w-[1200px] mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Globe className="h-5 w-5 text-primary" />,
                title: "Public or Private",
                desc: "Public rooms let anyone review. Private rooms require a passcode. Your choice.",
              },
              {
                icon: <MessageCircle className="h-5 w-5 text-primary" />,
                title: "Visual Commenting",
                desc: "Click anywhere on the design to drop numbered pins. Threaded replies & resolve.",
              },
              {
                icon: <Clock className="h-5 w-5 text-primary" />,
                title: "Auto-Delete",
                desc: "Rooms auto-expire after 3, 7, or 14 days. No data stored permanently.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="p-6 border border-border bg-card rounded-xl"
              >
                <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-lg mb-4">
                  {item.icon}
                </div>
                <h3 className="font-bold text-sm text-foreground mb-1.5">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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

      <AnimatePresence>
        {shareRoom && (
          <ShareRoomModal
            room={{ id: shareRoom.id, title: shareRoom.title, is_private: shareRoom.is_private, passcode: shareRoom.passcode }}
            onClose={() => setShareRoom(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
