'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 [SignIn] Submitting credentials...');

      // Try with redirect: true for better cookie handling
      await signIn('credentials', {
        email,
        password,
        redirect: true,
        callbackUrl: '/dashboard',
      });
    } catch (err) {
      console.error('❌ [SignIn] Exception:', err);
      setError('Erro ao fazer login');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center bg-white">
          <div className="flex justify-center mb-4">
            <Image
              src="/ucp-logo.png"
              alt="Universidade Católica Portuguesa"
              width={120}
              height={45}
              className="h-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Programa Avançado Digital 360°
          </CardTitle>
          <p className="text-sm text-gray-700 mt-2 font-medium">
            Sistema de Relatórios de Avaliação
          </p>
        </CardHeader>
        <CardContent className="space-y-4 bg-white">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-900 font-semibold">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-900 font-semibold">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 font-semibold text-center bg-red-50 p-2 rounded">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  A entrar...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          <p className="text-xs text-center text-gray-600 mt-4 font-medium">
            Acesso restrito a utilizadores autorizados
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
