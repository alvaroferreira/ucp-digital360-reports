'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Role } from '@prisma/client'

type User = {
  id: string
  email: string
  name: string | null
  role: Role
  active: boolean
}

type EditUserDialogProps = {
  isOpen: boolean
  onClose: () => void
  onUserUpdated: () => void
  user: User | null
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void
}

export function EditUserDialog({
  isOpen,
  onClose,
  onUserUpdated,
  user,
  onShowToast,
}: EditUserDialogProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<Role>('VIEWER')
  const [active, setActive] = useState(true)
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Preencher formulário quando o utilizador muda
  useEffect(() => {
    if (user) {
      setEmail(user.email)
      setName(user.name || '')
      setRole(user.role)
      setActive(user.active)
      setPassword('')
      setError('')
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    setError('')

    // Validate password if provided
    if (password && password.length < 8) {
      setError('Password deve ter pelo menos 8 caracteres')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: name || undefined,
          role,
          active,
          ...(password && { password }), // Only include if password is provided
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Erro ao atualizar utilizador')
        onShowToast(data.error || 'Erro ao atualizar utilizador', 'error')
        return
      }

      // Mostrar toast de sucesso
      onShowToast('Utilizador atualizado com sucesso!', 'success')

      // Reset form e fechar
      setError('')
      onUserUpdated()
      onClose()
    } catch (error) {
      console.error('Erro:', error)
      const errorMsg = 'Erro ao atualizar utilizador'
      setError(errorMsg)
      onShowToast(errorMsg, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Editar Utilizador
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <label
              htmlFor="edit-email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email *
            </label>
            <input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              placeholder="utilizador@exemplo.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label
              htmlFor="edit-name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nome
            </label>
            <input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              placeholder="Nome do utilizador"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label
              htmlFor="edit-role"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Role *
            </label>
            <select
              id="edit-role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="VIEWER">Viewer - Apenas visualizar</option>
              <option value="TEACHER">Teacher - Visualizar e editar</option>
              <option value="ADMIN">Admin - Acesso completo</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="edit-active"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status *
            </label>
            <select
              id="edit-active"
              value={active ? 'true' : 'false'}
              onChange={(e) => setActive(e.target.value === 'true')}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="edit-password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password (opcional)
            </label>
            <input
              id="edit-password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              placeholder="Deixar vazio para não alterar (mínimo 8 caracteres)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'A atualizar...' : 'Atualizar Utilizador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
