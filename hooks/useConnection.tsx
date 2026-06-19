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
// // import { LocalParticipant, Participant, TokenSource, TokenSourceBase, TokenSourceResponseObject } from 'livekit-client';
// // import { createContext, useContext, useMemo, useState, useCallback } from 'react';
// // import { SessionProvider, useSession } from '@livekit/components-react';
// // import { useRoomContext } from '@livekit/components-react';

// // // TODO: Add your Sandbox ID here
// // const sandboxID = 'realestateagent-18wgwt';

// // // The name of the agent you wish to be dispatched.
// // const agentName = undefined;

// // const hardcodedUrl = '';
// // const hardcodedToken = '';

// // export interface UserInfo {
// //   phone: string;
// //   tenantName: string;
// // }

// // interface ConnectionContextType {
// //   isConnectionActive: boolean;
// //   connect: (userInfo: UserInfo) => void;
// //   disconnect: () => void;
// // }

// // const ConnectionContext = createContext<ConnectionContextType>({
// //   isConnectionActive: false,
// //   connect: () => {},
// //   disconnect: () => {},
// // });

// // export function useConnection() {
// //   const ctx = useContext(ConnectionContext);
// //   if (!ctx) {
// //     throw new Error('useConnection must be used within a ConnectionProvider');
// //   }
// //   return ctx;
// // }

// // interface ConnectionProviderProps {
// //   children: React.ReactNode;
// // }

// // // Inner component that has access to the LiveKit room context
// // function ConnectionProviderInner({ children, pendingUserInfo, onConnected }: {
// //   children: React.ReactNode;
// //   pendingUserInfo: UserInfo | null;
// //   onConnected: () => void;
// // }) {
// //   const room = useRoomContext();

// //   // Once connected and we have pending metadata, set it on the participant
// //   useMemo(() => {
// //     if (!room || !pendingUserInfo) return;

// //     const handleConnected = () => {
// //       console.log("Tenant name is :" +pendingUserInfo.tenantName + " phone number is "  + pendingUserInfo.phone )
// //       room.localParticipant.setMetadata(JSON.stringify({
// //         phone_number: pendingUserInfo.phone,
// //         tenant_name: pendingUserInfo.tenantName,
// //       }));
// //       onConnected();
// //     };

// //     room.on('connected', handleConnected);
// //     return () => { room.off('connected', handleConnected); };
// //   }, [room, pendingUserInfo, onConnected]);

// //   return <>{children}</>;
// // }

// // export function ConnectionProvider({ children }: ConnectionProviderProps) {
// //   const [isConnectionActive, setIsConnectionActive] = useState(false);
// //   const [pendingUserInfo, setPendingUserInfo] = useState<UserInfo | null>(null);

// //   const tokenSource = useMemo(() => {
// //     if (sandboxID) {
// //       const source = TokenSource.sandboxTokenServer(sandboxID);
// //       console.log('Token source:', JSON.stringify(source));  // <-- add this
// //       return source;
// //     } else {
// //       return TokenSource.literal(
// //         {
// //           serverUrl: hardcodedUrl,
// //           participantToken: hardcodedToken,
// //         } satisfies TokenSourceResponseObject
// //       );
// //     }
// //   }, []);

// //   const session = useSession(
// //     tokenSource,
// //     agentName ? { agentName } : undefined
// //   );

// //   const { start: startSession, end: endSession } = session;

// //   const handleConnected = useCallback(() => {
// //     setPendingUserInfo(null);
// //   }, []);

// //   const value = useMemo(() => {
// //     return {
// //       isConnectionActive,
// //       connect: (userInfo: UserInfo) => {
// //         setPendingUserInfo(userInfo);
// //         setIsConnectionActive(true);
// //         startSession();
// //       },
// //       disconnect: () => {
// //         setIsConnectionActive(false);
// //         setPendingUserInfo(null);
// //         endSession();
// //       },
// //     };
// //   }, [startSession, endSession, isConnectionActive]);

// //   return (
// //     <SessionProvider session={session}>
// //       <ConnectionProviderInner
// //         pendingUserInfo={pendingUserInfo}
// //         onConnected={handleConnected}
// //       >
// //         <ConnectionContext.Provider value={value}>
// //           {children}
// //         </ConnectionContext.Provider>
// //       </ConnectionProviderInner>
// //     </SessionProvider>
// //   );
// // }


// // // ==================
// // // import { TokenSource, TokenSourceBase, TokenSourceResponseObject } from 'livekit-client';
// // // import { createContext, useContext, useMemo, useState } from 'react';
// // // import { SessionProvider, useSession } from '@livekit/components-react';

// // // // TODO: Add your Sandbox ID here
// // // const sandboxID = 'gpfinal-1q5j11' ;

// // // // The name of the agent you wish to be dispatched.
// // // const agentName = undefined

// // // // NOTE: If you prefer not to use the token server for testing, you can generate your
// // // // tokens manually by visiting https://cloud.livekit.io/projects/p_/settings/keys
// // // // and using one of your API Keys to generate a token with custom TTL and permissions.

// // // // For use without a token server.
// // // const hardcodedUrl = '';
// // // const hardcodedToken = '';

// // // interface ConnectionContextType {
// // //   isConnectionActive: boolean;
// // //   connect: () => void;
// // //   disconnect: () => void;
// // // }

// // // const ConnectionContext = createContext<ConnectionContextType>({
// // //   isConnectionActive: false,
// // //   connect: () => {},
// // //   disconnect: () => {},
// // // });

// // // export function useConnection() {
// // //   const ctx = useContext(ConnectionContext);
// // //   if (!ctx) {
// // //     throw new Error('useConnection must be used within a ConnectionProvider');
// // //   }
// // //   return ctx;
// // // }

// // // interface ConnectionProviderProps {
// // //   children: React.ReactNode;
// // // }

// // // export function ConnectionProvider({ children }: ConnectionProviderProps) {
// // //   const [isConnectionActive, setIsConnectionActive] = useState(false);

// // //   const tokenSource = useMemo(() => {
// // //     if (sandboxID) {
// // //       return TokenSource.sandboxTokenServer(sandboxID)
// // //     } else {
// // //       return TokenSource.literal(
// // //         {
// // //           serverUrl: hardcodedUrl,
// // //           participantToken: hardcodedToken,
// // //         } satisfies TokenSourceResponseObject
// // //       )
// // //     }
// // //   }, [sandboxID, hardcodedUrl, hardcodedToken])

// // //   const session = useSession(
// // //     tokenSource,
// // //     agentName ? { agentName } : undefined
// // //   );

// // //   const { start: startSession, end: endSession } = session;

// // //   const value = useMemo(() => {
// // //     return {
// // //       isConnectionActive,
// // //       connect: () => {
// // //         setIsConnectionActive(true);
// // //         startSession();
// // //       },
// // //       disconnect: () => {
// // //         setIsConnectionActive(false);
// // //         endSession();
// // //       },
// // //     };
// // //   }, [startSession, endSession, isConnectionActive]);

// // //   return (
// // //     <SessionProvider session={session}>
// // //       <ConnectionContext.Provider value={value}>{children}</ConnectionContext.Provider>
// // //     </SessionProvider>
// // //   );
// // // }