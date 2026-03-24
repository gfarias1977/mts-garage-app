import { SignIn } from '@clerk/nextjs';
import Image from 'next/image';

export default function SignInPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-[var(--sidebar-bg)] p-12">
        <div className="flex flex-col items-center gap-6 text-[var(--sidebar-text-active)]">
          <Image src="/login-img.png" alt="MTS Garage" width={200} height={200} priority />
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight">MTS Garage</h1>
            <p className="mt-2 text-sm opacity-70 text-[var(--sidebar-text)]">
              Fleet management platform
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — Clerk SignIn */}
      <div className="flex items-center justify-center p-8">
        <SignIn />
      </div>
    </div>
  );
}
