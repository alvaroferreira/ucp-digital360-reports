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
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      console.log('🔐 [SignIn] Result:', result);

      if (result?.error) {
        console.error('❌ [SignIn] Error:', result.error);
        setError('Email ou password incorretos');
      } else if (result?.ok) {
        console.log('✅ [SignIn] Success! Redirecting to dashboard...');
        // Force a hard reload to ensure session is picked up
        window.location.replace('/dashboard');
      } else {
        console.error('❌ [SignIn] Unexpected result:', result);
        setError('Erro inesperado ao fazer login');
      }
    } catch (err) {
      console.error('❌ [SignIn] Exception:', err);
      setError('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/ucp-logo.png"
              alt="Universidade Católica Portuguesa"
              width={120}
              height={45}
              className="h-auto"
            />
          </div>
          <CardTitle className="text-2xl">
            Programa Avançado Digital 360°
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Sistema de Relatórios de Avaliação
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full"
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

          <p className="text-xs text-center text-gray-500 mt-4">
            Acesso restrito a utilizadores autorizados
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
