'use client';
import { useEffect, useState } from 'react';
import { useNavigation } from '@/store/navigation';
import { useAuth } from '@/store/auth';
import { Bell, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const navigate = useNavigation((s) => s.navigate);
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  const fetchNotifs = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnread(data.unreadCount || 0);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    const doFetch = async () => {
      try {
        const res = await fetch('/api/notifications');
        const data = await res.json();
        if (!mounted) return;
        setNotifications(data.notifications || []);
        setUnread(data.unreadCount || 0);
      } catch {
        // ignore
      }
    };
    doFetch();
    const interval = setInterval(doFetch, 30_000);
    return () => { mounted = false; clearInterval(interval); };
  }, [user]);

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markAll: true }) });
    fetchNotifs();
  };

  const markRead = async (id: string) => {
    await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchNotifs();
  };

  if (!user) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-zinc-300 hover:text-white hover:bg-white/5">
          {unread > 0 ? <BellRing className="w-5 h-5 text-[#F5C518]" /> : <Bell className="w-5 h-5" />}
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-[#141414] border-[#27272A]">
        <div className="flex items-center justify-between p-3 border-b border-[#27272A]">
          <span className="text-sm font-semibold text-white">Notifications</span>
          {unread > 0 && (
            <button onClick={markAllRead} className="text-xs text-[#F5C518] hover:underline">
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-zinc-500">No notifications yet.</div>
          ) : (
            notifications.slice(0, 10).map((n) => (
              <DropdownMenuItem
                key={n.id}
                onClick={() => markRead(n.id)}
                className="flex flex-col items-start p-3 hover:bg-white/5 cursor-pointer border-b border-[#27272A]/50"
              >
                <div className="flex items-start gap-2 w-full">
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-[#F5C518] mt-1.5 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${n.isRead ? 'text-zinc-300' : 'text-white'}`}>{n.title}</p>
                    <p className="text-xs text-zinc-500 line-clamp-2 mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-zinc-600 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
        <DropdownMenuSeparator className="bg-[#27272A]" />
        <DropdownMenuItem onClick={() => navigate('notifications')} className="justify-center text-[#F5C518] hover:bg-[#F5C518]/10 cursor-pointer">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
