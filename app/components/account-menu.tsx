"use client"
import {
  User,
  Settings,
  ToggleLeft,
  Mail,
  Keyboard,
  Calendar,
  Bell,
  Plug,
  Code,
  Gem,
  Settings2,
  ArrowUpFromDot,
  Check,
  HelpCircle,
} from "lucide-react"
import Image from "next/image"

interface AccountMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function AccountMenu({ isOpen, onClose }: AccountMenuProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Account Menu */}
      <div className="fixed bottom-20 left-4 z-50 w-80 rounded-lg border border-white/10 bg-slate-900 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="p-2">
          {/* Menu Items */}
          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white hover:bg-white/10 rounded transition-colors">
            <User className="h-4 w-4 shrink-0" />
            <span>Account</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white hover:bg-white/10 rounded transition-colors">
            <Settings2 className="h-4 w-4 shrink-0" />
            <span>Preferences</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white hover:bg-white/10 rounded transition-colors">
            <ToggleLeft className="h-4 w-4 shrink-0" />
            <span>Personalization</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white hover:bg-white/10 rounded transition-colors">
            <Mail className="h-4 w-4 shrink-0" />
            <span>Assistant</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white hover:bg-white/10 rounded transition-colors">
            <Keyboard className="h-4 w-4 shrink-0" />
            <span>Shortcuts</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white hover:bg-white/10 rounded transition-colors">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>Tasks</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white hover:bg-white/10 rounded transition-colors">
            <Bell className="h-4 w-4 shrink-0" />
            <span>Notifications</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white hover:bg-white/10 rounded transition-colors">
            <Plug className="h-4 w-4 shrink-0" />
            <span>Connectors</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white hover:bg-white/10 rounded transition-colors">
            <Code className="h-4 w-4 shrink-0" />
            <span>API</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white hover:bg-white/10 rounded transition-colors">
            <Gem className="h-4 w-4 shrink-0" />
            <span>Pro Perks</span>
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white hover:bg-white/10 rounded transition-colors">
            <Settings className="h-4 w-4 shrink-0" />
            <span>All settings</span>
          </button>

          <div className="my-2 border-t border-white/10" />

          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white hover:bg-white/10 rounded transition-colors">
            <ArrowUpFromDot className="h-4 w-4 shrink-0" />
            <span>Upgrade plan</span>
          </button>

          <div className="my-2 border-t border-white/10" />

          {/* Profile Switcher */}
          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white hover:bg-white/10 rounded transition-colors group">
            <div className="relative">
              <Image
                src="/images/user-avatar.jpg"
                alt="Profile"
                width={24}
                height={24}
                className="rounded-full object-cover"
              />
              <span className="absolute -bottom-1 -right-1 text-[8px] font-bold bg-teal-600 text-white px-1 rounded">
                pro
              </span>
            </div>
            <span className="flex-1 text-left">jessinsam</span>
            <Check className="h-4 w-4 text-teal-500 shrink-0" />
          </button>

          <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-white hover:bg-white/10 rounded transition-colors group">
            <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <span className="text-xs">🕶️</span>
            </div>
            <span className="flex-1 text-left">Incognito</span>
            <HelpCircle className="h-4 w-4 text-white/40 shrink-0" />
          </button>
        </div>
      </div>
    </>
  )
}
