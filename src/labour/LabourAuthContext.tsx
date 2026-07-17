import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface LabourUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarText: string;
  avatarColor: string;
  rating: number;
  reviewsCount: number;
  completedJobs: number;
  status: string;
}

interface LabourAuthContextType {
  labour: LabourUser | null;
  token: string | null;
  loginLabour: (token: string, labour: LabourUser) => void;
  logoutLabour: () => void;
  isLoading: boolean;
}

const LabourAuthContext = createContext<LabourAuthContextType | undefined>(undefined);

export const LabourAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [labour, setLabour] = useState<LabourUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('nestly_labour_token');
    const storedLabour = localStorage.getItem('nestly_labour_user');
    if (storedToken && storedLabour) {
      setToken(storedToken);
      try {
        setLabour(JSON.parse(storedLabour));
      } catch {
        localStorage.removeItem('nestly_labour_token');
        localStorage.removeItem('nestly_labour_user');
      }

      // Sync live profile from SQLite database
      fetch('/api/labour/me', {
        headers: { Authorization: `Bearer ${storedToken}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Invalid token');
          return res.json();
        })
        .then(dbLabour => {
          setLabour(dbLabour);
          localStorage.setItem('nestly_labour_user', JSON.stringify(dbLabour));
        })
        .catch(() => {
          setToken(null);
          setLabour(null);
          localStorage.removeItem('nestly_labour_token');
          localStorage.removeItem('nestly_labour_user');
        });
    }
    setIsLoading(false);
  }, []);

  const loginLabour = (newToken: string, newLabour: LabourUser) => {
    setToken(newToken);
    setLabour(newLabour);
    localStorage.setItem('nestly_labour_token', newToken);
    localStorage.setItem('nestly_labour_user', JSON.stringify(newLabour));
  };

  const logoutLabour = () => {
    setToken(null);
    setLabour(null);
    localStorage.removeItem('nestly_labour_token');
    localStorage.removeItem('nestly_labour_user');
  };

  return (
    <LabourAuthContext.Provider value={{ labour, token, loginLabour, logoutLabour, isLoading }}>
      {children}
    </LabourAuthContext.Provider>
  );
};

export const useLabourAuth = () => {
  const ctx = useContext(LabourAuthContext);
  if (!ctx) throw new Error('useLabourAuth must be used within LabourAuthProvider');
  return ctx;
};
