import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

const USERS_KEY = "@MomentumApp:users";
const CURRENT_USER_KEY = "@MomentumApp:currentUser";

interface User {
  username: string;
  password: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  clearAllData: () => Promise<void>;
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

const setUsers = async (users: User[]) => {
  await safeSetItem(USERS_KEY, JSON.stringify(users));
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
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
  }, []);

  const login = async (usernameInput: string, passwordInput: string) => {
    const normalizedUsername = usernameInput.trim().toLowerCase();
    const normalizedPassword = passwordInput.trim();
    const users = await getUsers();

    const user = users.find(
      (u) => u.username.trim().toLowerCase() === normalizedUsername
    );

    if (!user) {
      return {
        success: false,
        message: "Account not found. Please check your name or sign up.",
      };
    }

    if (user.password.trim() !== normalizedPassword) {
      return {
        success: false,
        message: "Incorrect password. Please try again.",
      };
    }

    setUsername(user.username);
    await safeSetItem(CURRENT_USER_KEY, user.username);
    return { success: true };
  };

  const signup = async (usernameInput: string, passwordInput: string) => {
    const displayUsername = usernameInput.trim();
    const normalizedUsername = displayUsername.toLowerCase();
    const normalizedPassword = passwordInput.trim();
    const users = await getUsers();

    const userExists = users.some(
      (u) => u.username.trim().toLowerCase() === normalizedUsername
    );

    if (userExists) {
      return {
        success: false,
        message: "An account already exists with that name.",
      };
    }

    const newUser: User = {
      username: displayUsername,
      password: normalizedPassword,
    };

    const nextUsers = [...users, newUser];
    await setUsers(nextUsers);
    setUsername(displayUsername);
    await safeSetItem(CURRENT_USER_KEY, displayUsername);

    return { success: true };
  };

  const logout = async () => {
    setUsername(null);
    await safeRemoveItem(CURRENT_USER_KEY);
  };

  const clearAllData = async () => {
    setUsername(null);
    await safeRemoveItem(USERS_KEY);
    await safeRemoveItem(CURRENT_USER_KEY);
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
