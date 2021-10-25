import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { api } from '@/services/api';

interface IUser {
  id: string;
  name: string;
  login: string;
  avatar_url: string;
}

interface IAuthContext {
  user: IUser | null;
  signInUrl: string;
  signOut: () => void;
  loading: boolean;
}

interface IAuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    login: string;
    avatar_url: string;
  };
}

const AuthContext = createContext<IAuthContext>({} as IAuthContext);

const AuthProvider: React.FC = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<IUser | null>(null);

  const signInUrl = `https://github.com/login/oauth/authorize?scope=read:user&client_id=${
    import.meta.env.VITE_GITHUB_CLIENT_ID
  }`;

  async function signIn(githubCode: string) {
    const { data: authData } = await api.post<IAuthResponse>('authenticate', {
      code: githubCode,
    });

    const { token, user: u } = authData;
    localStorage.setItem('@DOWhile:token', token);
    api.defaults.headers.common.authorization = `Bearer ${token}`;

    setUser(u);
  }

  async function signOut() {
    setUser(null);

    delete api.defaults.headers.common.authorization;
    localStorage.removeItem('@DOWhile:token');
  }

  const signUserWithCode = useCallback(async () => {
    const url = window.location.href;
    const hasGithubCode = url.includes('?code=');

    if (hasGithubCode) {
      const [urlWithoutCode, githubCode] = url.split('?code=');
      window.history.pushState({}, '', urlWithoutCode);

      await signIn(githubCode);
    }
  }, []);

  const getSignedUser = useCallback(async () => {
    const token = localStorage.getItem('@DOWhile:token');
    if (token) {
      api.defaults.headers.common.authorization = `Bearer ${token}`;

      try {
        const { data: userData } = await api.get<IUser>('profile');
        setUser(userData);
      } catch (err) {
        delete api.defaults.headers.common.authorization;
        localStorage.removeItem('@DOWhile:token');
        alert((err as Error)?.message);
      }
    }
  }, []);

  useEffect(() => {
    async function initialLoad() {
      await signUserWithCode();
      await getSignedUser();

      setLoading(false);
    }

    initialLoad();
  }, [getSignedUser, signUserWithCode]);

  return (
    <AuthContext.Provider value={{ signInUrl, user, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = (): IAuthContext => useContext(AuthContext);

export { AuthProvider, useAuth };
