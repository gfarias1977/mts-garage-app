'use client';

import { SignOutButton } from '@clerk/nextjs';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center p-8">
      <h1 className="text-2xl font-bold">Acceso no autorizado</h1>
      <p className="text-muted-foreground text-sm max-w-sm">
        Tu cuenta no tiene permisos para acceder a esta aplicación. Contacta al administrador.
      </p>
      <SignOutButton redirectUrl="/sign-in">
        <button className="text-sm underline underline-offset-4">
          Cerrar sesión
        </button>
      </SignOutButton>
    </div>
  );
}
