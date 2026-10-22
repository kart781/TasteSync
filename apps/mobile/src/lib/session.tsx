import { createContext, use, useCallback, useEffect, useState, type ReactNode } from 'react';

import { api, ApiError } from './api';
import { phoneAuth } from './auth';

export type User = { id: string; username: string; displayName: string; homeAreaId: string | null };
type Status = 'loading' | 'signedOut' | 'needsSignUp' | 'signedIn';

type Session = {
  status: Status;
  user: User | null;
  refresh(): Promise<void>;
  signUp(profile: { username: string; displayName: string; birthDate: string; homeAreaId?: string }): Promise<void>;
  signOut(): Promise<void>;
};

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [user, setUser] = useState<User | null>(null);

  // Asks the API who this phone sign-in belongs to.
  const refresh = useCallback(async () => {
    if (!(await phoneAuth.getToken())) {
      setUser(null);
      setStatus('signedOut');
      return;
    }
    try {
      const res = await api<{ user: User }>('/auth/session', { method: 'POST' });
      setUser(res.user);
      setStatus('signedIn');
    } catch (e) {
      if (e instanceof ApiError && e.body.needsSignUp) setStatus('needsSignUp');
      else if (e instanceof ApiError && e.status === 401) {
        await phoneAuth.signOut();
        setStatus('signedOut');
      } else throw e;
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => setStatus('signedOut'));
  }, [refresh]);

  const signUp = useCallback<Session['signUp']>(async (profile) => {
    const res = await api<{ user: User }>('/auth/session', { method: 'POST', body: profile });
    setUser(res.user);
    setStatus('signedIn');
  }, []);

  const signOut = useCallback(async () => {
    await phoneAuth.signOut();
    setUser(null);
    setStatus('signedOut');
  }, []);

  return <SessionContext value={{ status, user, refresh, signUp, signOut }}>{children}</SessionContext>;
}

export function useSession(): Session {
  const session = use(SessionContext);
  if (!session) throw new Error('useSession must be inside SessionProvider');
  return session;
}
