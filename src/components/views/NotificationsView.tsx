'use client';
import { useEffect, useState } from 'react';
import { useNavigation } from '@/store/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ArrowLeft, Bell, CheckCheck, BellOff } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const typeIcons: Record<string, string> = {
  ORDER_CONFIRMED: '✅',
  ORDER_COMPLETED: '🎉',
  TOURNAMENT_REGISTERED: '🏆',
  TOURNAMENT_STARTING: '⏰',
  WINNER_ANNOUNCEMENT: '🥇',
  ROOM_PUBLISHED: '🔑',
  GENERAL: '📢',
};

export function NotificationsView() {
  const navigate = useNavigation((s) => s.navigate);
  const back = useNavigation((s) => s.back);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markAll: true }) });
    toast.success('All notifications marked as read');
    fetchNotifs();
  };

  const markRead = async (id: string) => {
    await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchNotifs();
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={back} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Bell className="w-6 h-6 text-[#F5C518]" /> Notifications
            </h1>
            {unreadCount > 0 && <p className="text-zinc-400 text-sm mt-1">{unreadCount} unread</p>}
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllRead} variant="outline" size="sm" className="bg-transparent border-[#F5C518]/50 text-[#F5C518] hover:bg-[#F5C518]/10">
              <CheckCheck className="w-4 h-4" /> Mark all read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-20 bg-[#141414]" />)}</div>
        ) : notifications.length === 0 ? (
          <Card className="bg-[#141414] border-[#27272A] p-12 text-center">
            <BellOff className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">You&apos;re all caught up! No notifications yet.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <Card
                key={n.id}
                className={`p-4 cursor-pointer transition-colors ${n.isRead ? 'bg-[#141414] border-[#27272A]' : 'bg-[#F5C518]/5 border-[#F5C518]/30'}`}
                onClick={() => !n.isRead && markRead(n.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center text-xl shrink-0">
                    {typeIcons[n.type] || '📢'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-white font-semibold text-sm">{n.title}</h3>
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#F5C518] shrink-0" />}
                    </div>
                    <p className="text-zinc-400 text-sm mt-1">{n.message}</p>
                    <p className="text-zinc-600 text-xs mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
