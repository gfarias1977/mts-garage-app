import { auth, clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();

  if (!userId) redirect('/sign-in');

  const client = await clerkClient();
  const memberships = await client.users.getOrganizationMembershipList({ userId });
  const role = memberships.data.find(
    (m) => m.role === 'org:admin' || m.role === 'org:member',
  )?.role ?? null;

  if (!role) redirect('/unauthorized');

  return <AppShell role={role}>{children}</AppShell>;
}
