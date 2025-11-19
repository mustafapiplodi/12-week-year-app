'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/client'
import { useSidebarStore } from '@/lib/stores/sidebar-store'
import { toast } from 'sonner'
import {
  LayoutDashboard,
  Calendar,
  TrendingUp,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Weekly', href: '/weekly', icon: Calendar },
  { name: 'Progress', href: '/progress', icon: TrendingUp },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { isCollapsed, toggleSidebar } = useSidebarStore()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Error logging out')
    } else {
      toast.success('Logged out successfully')
      router.push('/login')
      router.refresh()
    }
  }

  return (
    <div
      className={cn(
        'flex h-full flex-col border-r bg-card transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center border-b px-4 justify-between">
        {!isCollapsed && <h1 className="text-xl font-bold">12 Week Year</h1>}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn('shrink-0', isCollapsed && 'mx-auto')}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                isCollapsed && 'justify-center'
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="p-4">
        <Separator className="mb-4" />
        <Button
          variant="ghost"
          className={cn('w-full', isCollapsed ? 'justify-center px-0' : 'justify-start')}
          onClick={handleLogout}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className={cn('h-5 w-5', !isCollapsed && 'mr-3')} />
          {!isCollapsed && 'Logout'}
        </Button>
      </div>
    </div>
  )
}
