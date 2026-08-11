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
    return stored ? (JSON.parse(stored) as User[]) : [];
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
        // Ignore storage failures; continue with no authenticated user.
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  const login = async (usernameInput: string, password: string) => {
    const normalizedUsername = usernameInput.trim();
    const users = await getUsers();
    const foundUser = users.find(
      (user) => user.username === normalizedUsername && user.password === password
    );

    if (!foundUser) {
      return { success: false, message: "Username or password is incorrect." };
    }

    setUsername(normalizedUsername);
    await safeSetItem(CURRENT_USER_KEY, normalizedUsername);
    return { success: true };
  };

  const signup = async (usernameInput: string, password: string) => {
    const normalizedUsername = usernameInput.trim();
    const users = await getUsers();

    if (users.some((user) => user.username === normalizedUsername)) {
      return { success: false, message: "An account already exists with that username." };
    }

    const nextUsers = [...users, { username: normalizedUsername, password }];
    await setUsers(nextUsers);
    setUsername(normalizedUsername);
    await safeSetItem(CURRENT_USER_KEY, normalizedUsername);

    return { success: true };
  };

  const logout = async () => {
    setUsername(null);
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
