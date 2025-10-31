'use client'

import { useEffect, useState } from 'react'
import { UserTable } from '@/components/admin/UserTable'
import { AddUserDialog } from '@/components/admin/AddUserDialog'
import { EditUserDialog } from '@/components/admin/EditUserDialog'
import { useToast } from '@/components/ui/toast'
import { Plus } from 'lucide-react'

type User = {
  id: string
  email: string
  name: string | null
  image: string | null
  role: 'ADMIN' | 'TEACHER' | 'VIEWER'
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [error, setError] = useState('')
  const { showToast, ToastContainer } = useToast()

  const loadUsers = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erro ao carregar utilizadores')
        return
      }

      setUsers(data.users)
    } catch (error) {
      console.error('Erro:', error)
      setError('Erro ao carregar utilizadores')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsEditDialogOpen(true)
  }

  return (
    <div>
      <ToastContainer />

      {/* Action Button */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Adicionar Utilizador
        </button>
      </div>

      {/* Content */}
      <div>
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">A carregar utilizadores...</div>
            </div>
          ) : (
            <UserTable
              users={users}
              onUserUpdate={loadUsers}
              onEditUser={handleEditUser}
            />
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Total de Utilizadores</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {users.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Utilizadores Ativos</div>
            <div className="text-2xl font-bold text-green-600 mt-1">
              {users.filter((u) => u.active).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Administradores</div>
            <div className="text-2xl font-bold text-red-600 mt-1">
              {users.filter((u) => u.role === 'ADMIN').length}
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <AddUserDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onUserAdded={loadUsers}
      />

      <EditUserDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false)
          setSelectedUser(null)
        }}
        onUserUpdated={loadUsers}
        user={selectedUser}
        onShowToast={showToast}
      />
    </div>
  )
}
