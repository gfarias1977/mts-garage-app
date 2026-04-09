import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { PageContainer } from '@/components/layout/PageContainer';
import { WelcomeHero } from '@/components/dashboard/WelcomeHero';
import { getUserByClerkId } from '@/data/users';
import { getWorkOrderDashboardStats } from '@/data/workOrderDashboard';

export default async function DashboardPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect('/sign-in');

  const user = await getUserByClerkId(clerkId);
  if (!user) redirect('/sign-in');

  const stats = await getWorkOrderDashboardStats(user.id);

  return (
    <PageContainer>
      <WelcomeHero stats={stats} />
    </PageContainer>
  );
}
