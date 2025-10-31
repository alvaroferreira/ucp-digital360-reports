'use client'

import { useState } from 'react'
import { Role } from '@prisma/client'
import { Trash2, Shield, User as UserIcon, Pencil } from 'lucide-react'

type User = {
  id: string
  email: string
  name: string | null
  image: string | null
  role: Role
  active: boolean
  createdAt: Date
  updatedAt: Date
}

type UserTableProps = {
  users: User[]
  onUserUpdate: () => void
  onEditUser: (user: User) => void
}

export function UserTable({ users, onUserUpdate, onEditUser }: UserTableProps) {
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null)

  const handleRoleChange = async (userId: string, newRole: Role) => {
    setLoadingUserId(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Erro ao atualizar role')
        return
      }

      onUserUpdate()
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao atualizar role')
    } finally {
      setLoadingUserId(null)
    }
  }

  const handleToggleActive = async (userId: string, currentActive: boolean) => {
    setLoadingUserId(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive }),
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Erro ao atualizar status')
        return
      }

      onUserUpdate()
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao atualizar status')
    } finally {
      setLoadingUserId(null)
    }
  }

  const handleDelete = async (userId: string, userEmail: string) => {
    if (!confirm(`Tem a certeza que quer remover ${userEmail}?`)) {
      return
    }

    setLoadingUserId(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Erro ao remover utilizador')
        return
      }

      onUserUpdate()
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao remover utilizador')
    } finally {
      setLoadingUserId(null)
    }
  }

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="h-4 w-4 text-red-600" />
      case 'TEACHER':
        return <UserIcon className="h-4 w-4 text-blue-600" />
      case 'VIEWER':
        return <UserIcon className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Utilizador
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data Criação
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className={loadingUserId === user.id ? 'opacity-50' : ''}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.name || 'Sem nome'}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                  disabled={loadingUserId === user.id}
                  className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="VIEWER">Viewer</option>
                </select>
                <span className="ml-2">{getRoleIcon(user.role)}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => handleToggleActive(user.id, user.active)}
                  disabled={loadingUserId === user.id}
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    user.active
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  {user.active ? 'Ativo' : 'Inativo'}
                </button>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(user.createdAt).toLocaleDateString('pt-PT')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEditUser(user)}
                    disabled={loadingUserId === user.id}
                    className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                    title="Editar utilizador"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id, user.email)}
                    disabled={loadingUserId === user.id}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    title="Remover utilizador"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nenhum utilizador encontrado
        </div>
      )}
    </div>
  )
}
