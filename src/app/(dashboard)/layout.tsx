import { auth, clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();

  if (!userId) redirect('/sign-in');

  const client = await clerkClient();
  const memberships = await client.users.getOrganizationMembershipList({ userId });
  const isOrgAdmin = memberships.data.some((m) => m.role === 'org:admin');

  if (!isOrgAdmin) redirect('/unauthorized');

  return <AppShell>{children}</AppShell>;
}
