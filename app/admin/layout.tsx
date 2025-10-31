import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AdminLayout } from '@/components/admin/AdminLayout';

export default async function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication and authorization
  const session = await auth();

  // If not authenticated, redirect to sign in
  if (!session?.user) {
    redirect('/auth/signin');
  }

  // If not an admin, redirect to dashboard
  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return <AdminLayout>{children}</AdminLayout>;
}
