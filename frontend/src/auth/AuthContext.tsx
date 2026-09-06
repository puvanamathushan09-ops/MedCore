import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';
import { AuthApiClient } from '../../../src/client/api/auth.api';
import {
    getAccessToken,
    setAccessToken,
    removeAccessToken,
} from './auth-storage';
import type {
    AuthUser,
    LoginInput,
} from '../../../src/client/types/auth.types';

interface AuthContextValue {
    user: AuthUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (data: LoginInput) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = async (): Promise<void> => {
        const token = getAccessToken();

        if (!token) {
            setUser(null);
            return;
        }

        try {
            const currentUser = await AuthApiClient.getMe(token);
            setUser(currentUser);
        } catch {
            removeAccessToken();
            setUser(null);
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                await refreshUser();
            } finally {
                setIsLoading(false);
            }
        };

        void initializeAuth();
    }, []);

    const login = async (data: LoginInput): Promise<void> => {
        const response = await AuthApiClient.login(data);

        setAccessToken(response.accessToken);
        setUser(response.user);
    };

    const logout = (): void => {
        removeAccessToken();
        setUser(null);
    };

    const value: AuthContextValue = {
        user,
        isLoading,
        isAuthenticated: user !== null,
        login,
        logout,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used inside an AuthProvider');
    }

    return context;
}