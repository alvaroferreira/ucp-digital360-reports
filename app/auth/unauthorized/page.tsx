import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShieldX } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldX className="w-16 h-16 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-gray-900">Acesso Não Autorizado</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-700">
            Não tem permissão para aceder a esta página. Por favor contacte o administrador se precisar de acesso.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild variant="outline">
              <Link href="/dashboard">Voltar ao Dashboard</Link>
            </Button>
            <form action="/api/auth/signout" method="post">
              <Button type="submit">Terminar Sessão</Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
