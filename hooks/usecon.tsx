import { TokenSource, TokenSourceBase, TokenSourceResponseObject } from 'livekit-client';
import { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { SessionProvider, useSession } from '@livekit/components-react';
import { useRoomContext } from '@livekit/components-react';

// TODO: Add your Sandbox ID here
const sandboxID = 'gpfinal-1q5j11';

// The name of the agent you wish to be dispatched.
const agentName = undefined;

const hardcodedUrl = '';
const hardcodedToken = '';

export interface UserInfo {
  phone: string;
  tenantName: string;
}

interface ConnectionContextType {
  isConnectionActive: boolean;
  connect: (userInfo: UserInfo) => void;
  disconnect: () => void;
}

const ConnectionContext = createContext<ConnectionContextType>({
  isConnectionActive: false,
  connect: () => {},
  disconnect: () => {},
});

export function useConnection() {
  const ctx = useContext(ConnectionContext);
  if (!ctx) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return ctx;
}

interface ConnectionProviderProps {
  children: React.ReactNode;
}

// Inner component that has access to the LiveKit room context
function ConnectionProviderInner({ children, pendingUserInfo, onConnected }: {
  children: React.ReactNode;
  pendingUserInfo: UserInfo | null;
  onConnected: () => void;
}) {
  const room = useRoomContext();

  // Once connected and we have pending metadata, set it on the participant
  useMemo(() => {
    if (!room || !pendingUserInfo) return;

    const handleConnected = () => {
      room.localParticipant.setMetadata(JSON.stringify({
        phone: pendingUserInfo.phone,
        tenantName: pendingUserInfo.tenantName,
      }));
      onConnected();
    };

    room.on('connected', handleConnected);
    return () => { room.off('connected', handleConnected); };
  }, [room, pendingUserInfo, onConnected]);

  return <>{children}</>;
}

export function ConnectionProvider({ children }: ConnectionProviderProps) {
  const [isConnectionActive, setIsConnectionActive] = useState(false);
  const [pendingUserInfo, setPendingUserInfo] = useState<UserInfo | null>(null);

  const tokenSource = useMemo(() => {
    if (sandboxID) {
      return TokenSource.sandboxTokenServer(sandboxID);
    } else {
      return TokenSource.literal(
        {
          serverUrl: hardcodedUrl,
          participantToken: hardcodedToken,
        } satisfies TokenSourceResponseObject
      );
    }
  }, []);

  const session = useSession(
    tokenSource,
    agentName ? { agentName } : undefined
  );

  const { start: startSession, end: endSession } = session;

  const handleConnected = useCallback(() => {
    setPendingUserInfo(null);
  }, []);

  const value = useMemo(() => {
    return {
      isConnectionActive,
      connect: (userInfo: UserInfo) => {
        setPendingUserInfo(userInfo);
        setIsConnectionActive(true);
        startSession();
      },
      disconnect: () => {
        setIsConnectionActive(false);
        setPendingUserInfo(null);
        endSession();
      },
    };
  }, [startSession, endSession, isConnectionActive]);

  return (
    <SessionProvider session={session}>
      <ConnectionProviderInner
        pendingUserInfo={pendingUserInfo}
        onConnected={handleConnected}
      >
        <ConnectionContext.Provider value={value}>
          {children}
        </ConnectionContext.Provider>
      </ConnectionProviderInner>
    </SessionProvider>
  );
}
