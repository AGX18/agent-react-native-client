/*
import { TokenSource, TokenSourceResponseObject } from 'livekit-client';
import { createContext, useContext, useMemo, useState, useRef } from 'react';
import { SessionProvider, useSession } from '@livekit/components-react';
import React from 'react';

const sandboxID = 'realestateagent-18wgwt';
const SANDBOX_URL = 'https://cloud-api.livekit.io/api/v2/sandbox/connection-details';

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

export function ConnectionProvider({ children }: ConnectionProviderProps) {
  const [isConnectionActive, setIsConnectionActive] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);
  const userInfoRef = useRef<UserInfo | null>(null);

  const tokenSource = useMemo(() => {
    if (sandboxID) {
      const source = TokenSource.endpoint(SANDBOX_URL, {
        headers: { 'X-Sandbox-ID': sandboxID },
      });

      return TokenSource.custom(async () => {
        const metadata = userInfoRef.current
          ? JSON.stringify({
              phone_number: userInfoRef.current.phone,
              tenant_name: userInfoRef.current.tenantName,
            })
          : undefined;

        return source.fetch(
          metadata ? { participantMetadata: metadata } : {}
        );
      });
    } else {
      return TokenSource.literal({
        serverUrl: hardcodedUrl,
        participantToken: hardcodedToken,
      } satisfies TokenSourceResponseObject);
    }
  }, [sessionKey]); // rebuild tokenSource when sessionKey changes

  const session = useSession(
    tokenSource,
    agentName ? { agentName } : undefined
  );

  const { start: startSession, end: endSession } = session;

  const value = useMemo(() => ({
    isConnectionActive,
    connect: (info: UserInfo) => {
      userInfoRef.current = info;
      setSessionKey((k) => k + 1); // new tokenSource → new session instance
      setIsConnectionActive(true);
      // startSession is called in useEffect below after sessionKey triggers re-render
    },
    disconnect: () => {
      setIsConnectionActive(false);
      userInfoRef.current = null;
      endSession();
    },
  }), [startSession, endSession, isConnectionActive]);

  // Start the session after sessionKey bumps and new tokenSource/session is ready
  const isFirstMount = useRef(true);
  React.useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return; // skip auto-start on initial mount
    }
    if (isConnectionActive) {
      startSession();
    }
  }, [sessionKey]); // fires when sessionKey changes i.e. connect() was called

  return (
    <SessionProvider session={session}>
      <ConnectionContext.Provider value={value}>
        {children}
      </ConnectionContext.Provider>
    </SessionProvider>
  );
}
*/

import { TokenSource, TokenSourceResponseObject } from 'livekit-client';
import { createContext, useContext, useMemo, useState, useRef } from 'react';
import { SessionProvider, useSession } from '@livekit/components-react';

const sandboxID = 'realestateagent-18wgwt';
const SANDBOX_URL = 'https://cloud-api.livekit.io/api/v2/sandbox/connection-details';

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

export function ConnectionProvider({ children }: ConnectionProviderProps) {
  const [isConnectionActive, setIsConnectionActive] = useState(false);

  // useRef so the latest userInfo is always available inside the
  // tokenSource closure without needing to rebuild it on every change.
  const userInfoRef = useRef<UserInfo | null>(null);

  const tokenSource = useMemo(() => {
    if (sandboxID) {
      // TokenSource.endpoint fetches the URL and passes any extra params
      // (including participant_metadata) as query params to the server.
      const source = TokenSource.endpoint(SANDBOX_URL, {
        headers: { 'X-Sandbox-ID': sandboxID },
      });

      // Wrap it in a custom source so we can inject participant_metadata
      // from the ref at fetch time.
      return TokenSource.custom(async () => {
        const metadata = userInfoRef.current
          ? JSON.stringify({
              phone_number: userInfoRef.current.phone,
              tenant_name: userInfoRef.current.tenantName,
            })
          : undefined;

        return source.fetch(
          metadata ? { participantMetadata: metadata } : {}
        );
      });
    } else {
      return TokenSource.literal({
        serverUrl: hardcodedUrl,
        participantToken: hardcodedToken,
      } satisfies TokenSourceResponseObject);
    }
  }, []); // built once — userInfo is read from ref at call time

  const session = useSession(
    tokenSource,
    agentName ? { agentName } : undefined
  );

  const { start: startSession, end: endSession } = session;

  const value = useMemo(() => {
    return {
      isConnectionActive,
      connect: (info: UserInfo) => {
        userInfoRef.current = info; // set before startSession fetches the token
        setIsConnectionActive(true);
        startSession();
      },
      disconnect: () => {
        setIsConnectionActive(false);
        userInfoRef.current = null;
        session.end() ; 
        endSession();
      },
    };
  }, [startSession, endSession, isConnectionActive]);

  return (
    <SessionProvider session={session}>
      <ConnectionContext.Provider value={value}>
        {children}
      </ConnectionContext.Provider>
    </SessionProvider>
  );
}

   /*   =====================   ============== */

// import { TokenSource, TokenSourceResponseObject } from 'livekit-client';
// import { createContext, useContext, useMemo, useState } from 'react';
// import { SessionProvider, useSession } from '@livekit/components-react';

// const sandboxID = 'gpfinal-1q5j11'; 
// const SANDBOX_URL = 'https://cloud-api.livekit.io/api/v2/sandbox/connection-details';

// const agentName = undefined;

// const hardcodedUrl = '';
// const hardcodedToken = '';

// export interface UserInfo {
//   phone: string;
//   tenantName: string;
// }

// interface ConnectionContextType {
//   isConnectionActive: boolean;
//   connect: (userInfo: UserInfo) => void;
//   disconnect: () => void;
// }

// const ConnectionContext = createContext<ConnectionContextType>({
//   isConnectionActive: false,
//   connect: () => {},
//   disconnect: () => {},
// });

// export function useConnection() {
//   const ctx = useContext(ConnectionContext);
//   if (!ctx) {
//     throw new Error('useConnection must be used within a ConnectionProvider');
//   }
//   return ctx;
// }

// interface ConnectionProviderProps {
//   children: React.ReactNode;
// }

// export function ConnectionProvider({ children }: ConnectionProviderProps) {
//   const [isConnectionActive, setIsConnectionActive] = useState(false);
//   const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

//   const tokenSource = useMemo(() => {
//     if (sandboxID) {
//       if (userInfo) {
//         const metadata = JSON.stringify({
//           phone_number: userInfo.phone,
//           tenant_name: userInfo.tenantName,
//         });
//         const url = `${SANDBOX_URL}?metadata=${encodeURIComponent(metadata)}`;
//         return TokenSource.endpoint(url, { headers: {'X-Sandbox-ID': sandboxID},
//         });
//       }
//       return TokenSource.sandboxTokenServer(sandboxID);
//     } else {
//       return TokenSource.literal(
//         {
//           serverUrl: hardcodedUrl,
//           participantToken: hardcodedToken,
//         } satisfies TokenSourceResponseObject
//       );
//     }
//   }, [userInfo]);

//   const session = useSession(
//     tokenSource,
//     agentName ? { agentName } : undefined
//   );

//   const { start: startSession, end: endSession } = session;

//   const value = useMemo(() => {
//     return {
//       isConnectionActive,
//       connect: (info: UserInfo) => {
//         setUserInfo(info);
//         setIsConnectionActive(true);
//         startSession();
//       },
//       disconnect: () => {
//         setIsConnectionActive(false);
//         setUserInfo(null);
//         endSession();
//       },
//     };
//   }, [startSession, endSession, isConnectionActive]);

//   return (
//     <SessionProvider session={session}>
//       <ConnectionContext.Provider value={value}>
//         {children}
//       </ConnectionContext.Provider>
//     </SessionProvider>
//   );
// }

