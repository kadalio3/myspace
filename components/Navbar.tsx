import { auth } from '@/auth';
import NavbarClient from './NavbarClient';

export default async function Navbar() {
  const session = await auth();

  return (
    <NavbarClient
      user={session?.user ? {
        name: session.user.name || null,
        role: session.user.role || 'GUEST',
      } : null}
    />
  );
}
