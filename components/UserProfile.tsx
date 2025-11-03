'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User, Shield, Users as UsersIcon, Settings, Key } from 'lucide-react';
import { Role } from '@prisma/client';
import { ChangePasswordDialog } from '@/components/user/ChangePasswordDialog';

interface UserProfileProps {
  showFullInfo?: boolean;
}

export function UserProfile({ showFullInfo = false }: UserProfileProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showChangePassword, setShowChangePassword] = useState(false);

  if (!session?.user) {
    return null;
  }

  const user = session.user;

  // Gerar iniciais do nome do utilizador
  const getInitials = (name: string | null | undefined): string => {
    if (!name) return 'U';

    const names = name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }

    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Configuração de role com cores e ícones
  const getRoleConfig = (role: Role) => {
    const roleConfigs = {
      ADMIN: {
        label: 'Administrador',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        icon: Shield,
      },
      TEACHER: {
        label: 'Professor',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        icon: UsersIcon,
      },
      VIEWER: {
        label: 'Visualizador',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        icon: User,
      },
    };

    return roleConfigs[role] || roleConfigs.VIEWER;
  };

  const roleConfig = getRoleConfig(user.role);
  const RoleIcon = roleConfig.icon;

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <div className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors cursor-pointer">
          <Avatar className="h-10 w-10 border-2 border-gray-200">
            <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
            <AvatarFallback className="bg-blue-600 text-white font-semibold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>

          {showFullInfo && (
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900 leading-none">
                {user.name || 'Utilizador'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {roleConfig.label}
              </p>
            </div>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-gray-200">
                <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
                <AvatarFallback className="bg-blue-600 text-white font-semibold text-base">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate mb-1">
                  {user.name || 'Utilizador'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>

            <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md ${roleConfig.bgColor}`}>
              <RoleIcon className={`h-4 w-4 ${roleConfig.color}`} />
              <span className={`text-xs font-medium ${roleConfig.color}`}>
                {roleConfig.label}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => setShowChangePassword(true)}
          className="cursor-pointer"
        >
          <Key className="h-4 w-4 mr-2" />
          <span>Alterar Password</span>
        </DropdownMenuItem>

        {user.role === 'ADMIN' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/admin')} className="cursor-pointer">
              <Settings className="h-4 w-4 mr-2" />
              <span>Painel de Administração</span>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="h-4 w-4 mr-2" />
          <span>Terminar Sessão</span>
        </DropdownMenuItem>
      </DropdownMenuContent>

      <ChangePasswordDialog
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </DropdownMenu>
  );
}
