"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  PublicClientApplication,
  AccountInfo,
  InteractionStatus,
  EventType,
  AuthenticationResult,
} from "@azure/msal-browser";
import { MsalProvider, useMsal, useAccount } from "@azure/msal-react";
import { msalConfig, loginRequest, graphConfig } from "@/lib/auth-config";

// Initialize MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

// User profile from Microsoft Graph
interface UserProfile {
  id: string;
  displayName: string;
  mail: string;
  userPrincipalName: string;
  jobTitle?: string;
}

// Auth context type
interface AuthContextType {
  user: UserProfile | null;
  account: AccountInfo | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Inner provider that uses MSAL hooks
function AuthProviderInner({ children }: { children: React.ReactNode }) {
  const { instance, accounts, inProgress } = useMsal();
  const account = useAccount(accounts[0] || {});
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile from Microsoft Graph
  const fetchUserProfile = useCallback(async (token: string) => {
    try {
      const response = await fetch(graphConfig.graphMeEndpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const profile = await response.json();
        setUser({
          id: profile.id,
          displayName: profile.displayName,
          mail: profile.mail || profile.userPrincipalName,
          userPrincipalName: profile.userPrincipalName,
          jobTitle: profile.jobTitle,
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }, []);

  // Get access token silently or via popup
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (!account) return null;

    try {
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: account,
      });
      return response.accessToken;
    } catch (error) {
      // Silent token acquisition failed, try popup
      try {
        const response = await instance.acquireTokenPopup(loginRequest);
        return response.accessToken;
      } catch (popupError) {
        console.error("Error acquiring token:", popupError);
        return null;
      }
    }
  }, [account, instance]);

  // Sign in handler
  const signIn = useCallback(async () => {
    try {
      const response = await instance.loginPopup(loginRequest);
      if (response.accessToken) {
        setAccessToken(response.accessToken);
        await fetchUserProfile(response.accessToken);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  }, [instance, fetchUserProfile]);

  // Sign out handler
  const signOut = useCallback(async () => {
    try {
      await instance.logoutPopup({
        postLogoutRedirectUri: "/",
      });
      setUser(null);
      setAccessToken(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [instance]);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      // Handle redirect response if any
      try {
        await instance.initialize();
        const response = await instance.handleRedirectPromise();
        if (response) {
          setAccessToken(response.accessToken);
          await fetchUserProfile(response.accessToken);
        }
      } catch (error) {
        console.error("Error handling redirect:", error);
      }

      // Check for existing account
      const currentAccounts = instance.getAllAccounts();
      if (currentAccounts.length > 0) {
        const token = await getAccessToken();
        if (token) {
          setAccessToken(token);
          await fetchUserProfile(token);
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, [instance, fetchUserProfile, getAccessToken]);

  // Listen for auth events
  useEffect(() => {
    const callbackId = instance.addEventCallback((event) => {
      if (event.eventType === EventType.LOGIN_SUCCESS) {
        const result = event.payload as AuthenticationResult;
        if (result.accessToken) {
          setAccessToken(result.accessToken);
          fetchUserProfile(result.accessToken);
        }
      } else if (event.eventType === EventType.LOGOUT_SUCCESS) {
        setUser(null);
        setAccessToken(null);
      }
    });

    return () => {
      if (callbackId) {
        instance.removeEventCallback(callbackId);
      }
    };
  }, [instance, fetchUserProfile]);

  const isAuthenticated = useMemo(
    () => !!account && !!accessToken,
    [account, accessToken]
  );

  const contextValue = useMemo(
    () => ({
      user,
      account,
      accessToken,
      isLoading: isLoading || inProgress !== InteractionStatus.None,
      isAuthenticated,
      signIn,
      signOut,
      getAccessToken,
    }),
    [
      user,
      account,
      accessToken,
      isLoading,
      inProgress,
      isAuthenticated,
      signIn,
      signOut,
      getAccessToken,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// Main auth provider wrapper
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <MsalProvider instance={msalInstance}>
      <AuthProviderInner>{children}</AuthProviderInner>
    </MsalProvider>
  );
}
