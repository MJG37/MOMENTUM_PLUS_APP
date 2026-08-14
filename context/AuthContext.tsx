// Keeps account sessions in device storage and coordinates secure cloud account actions.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

const USERS_KEY = "@MomentumApp:users";
const CURRENT_USER_KEY = "@MomentumApp:currentUser";
// Versioned so existing installs retry the safe one-time cloud migration.
const LOCAL_ACCOUNTS_MIGRATED_KEY = "@MomentumApp:localAccountsMigrated:v2";

interface User {
  username: string;
  password: string;
  securityAnswers?: {
    birthday: string;
    country: string;
    favouriteColor: string;
  };
}

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  clearAllData: () => Promise<void>;
  cancelSignup: () => Promise<void>;
  deleteCurrentAccount: () => Promise<{ success: boolean; message?: string }>;
  saveSecurityAnswers: (answers: NonNullable<User["securityAnswers"]>) => Promise<void>;
  verifyAndResetPassword: (username: string, answers: NonNullable<User["securityAnswers"]>, newPassword: string) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const safeGetItem = async (key: string): Promise<string | null> => {
  if (!AsyncStorage?.getItem) return null;
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSetItem = async (key: string, value: string): Promise<void> => {
  if (!AsyncStorage?.setItem) return;
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    return;
  }
};

const safeRemoveItem = async (key: string): Promise<void> => {
  if (!AsyncStorage?.removeItem) return;
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    return;
  }
};

const getUsers = async (): Promise<User[]> => {
  try {
    const stored = await safeGetItem(USERS_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    
    // Safely filter valid objects
    return parsed.filter(
      (u) => u && typeof u.username === "string" && typeof u.password === "string"
    );
  } catch {
    return [];
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const migrateLocalAccounts = useMutation(api.accounts.migrateLocalAccounts);
  const loginAccount = useMutation(api.accounts.login);
  const signupAccount = useMutation(api.accounts.signup);
  const saveAnswers = useMutation(api.accounts.saveSecurityAnswers);
  const resetPassword = useMutation(api.accounts.resetPassword);
  const deleteAccount = useMutation(api.accounts.deleteAccount);
  const sessionAccount = useQuery(
    api.accounts.getByUsername,
    username ? { username } : "skip"
  );

  useEffect(() => {
    if (username && sessionAccount === null) {
      setUsername(null);
      void safeRemoveItem(CURRENT_USER_KEY);
    }
  }, [sessionAccount, username]);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const migrated = await safeGetItem(LOCAL_ACCOUNTS_MIGRATED_KEY);
        if (!migrated) {
          const users = await getUsers();
          await migrateLocalAccounts({ accounts: users });
          await safeSetItem(LOCAL_ACCOUNTS_MIGRATED_KEY, "true");
        }

        const storedUser = await safeGetItem(CURRENT_USER_KEY);
        if (storedUser) {
          setUsername(storedUser);
        }
      } catch {
        // Ignore storage errors
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [migrateLocalAccounts]);

  const login = async (usernameInput: string, passwordInput: string) => {
    try {
      const account = await loginAccount({ username: usernameInput, password: passwordInput });
      if (account.status !== "authenticated") {
        return { success: false, message: "Incorrect name or password. Please try again." };
      }
      setUsername(account.username);
      await safeSetItem(CURRENT_USER_KEY, account.username);
      return { success: true };
    } catch {
      return { success: false, message: "Incorrect name or password. Please try again." };
    }
  };

  const signup = async (usernameInput: string, passwordInput: string) => {
    try {
      const account = await signupAccount({ username: usernameInput, password: passwordInput });
      if (account.status === "duplicate") return { success: false, message: "An account already exists with that name." };
      if (account.status === "weak_password") return { success: false, message: "Use at least 4 characters and 1 symbol." };
      setUsername(account.username);
      await safeSetItem(CURRENT_USER_KEY, account.username);
      return { success: true };
    } catch {
      return { success: false, message: "An account already exists with that name." };
    }
  };

  const logout = async () => {
    setUsername(null);
    await safeRemoveItem(CURRENT_USER_KEY);
  };

  const cancelSignup = async () => {
    if (username) await deleteAccount({ username });
    setUsername(null);
    await safeRemoveItem(CURRENT_USER_KEY);
  };

  const clearAllData = async () => {
    setUsername(null);
    await safeRemoveItem(CURRENT_USER_KEY);
  };

  const deleteCurrentAccount = async () => {
    if (!username) return { success: false };
    try {
      const result = await deleteAccount({ username });
      if (result.status === "protected") return { success: false, message: "The Admin demo account cannot be deleted." };
      setUsername(null);
      await safeRemoveItem(CURRENT_USER_KEY);
      return { success: true };
    } catch {
      return { success: false, message: "Your account could not be deleted. Please try again." };
    }
  };

  const saveSecurityAnswers = async (answers: NonNullable<User["securityAnswers"]>) => {
    if (!username) return;
    await saveAnswers({ username, answers });
  };

  const verifyAndResetPassword = async (
    usernameInput: string,
    answers: NonNullable<User["securityAnswers"]>,
    newPassword: string
  ) => {
    try {
      const result = await resetPassword({ username: usernameInput, answers, newPassword });
      if (result.status === "protected") return { success: false, message: "The Admin demo account password cannot be changed." };
      if (result.status === "weak_password") return { success: false, message: "Use at least 4 characters and 1 symbol." };
      return { success: result.status === "reset" };
    } catch {
      return { success: false };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: username !== null,
        username,
        loading,
        login,
        signup,
        logout,
        clearAllData,
        cancelSignup,
        deleteCurrentAccount,
        saveSecurityAnswers,
        verifyAndResetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
