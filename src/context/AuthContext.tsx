import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Usuario } from '../types/Usuario';
import { loginUsuario, cadastrarUsuario } from '../database/usuarioRepository';

type AuthContextType = {
  usuario: Usuario | null;
  login: (nome: string, senha: string) => Promise<void>;
  cadastrar: (nome: string, senha: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const login = async (nome: string, senha: string) => {
    const user = await loginUsuario(nome, senha);
    setUsuario(user);
  };

  const cadastrar = async (nome: string, senha: string) => {
    await cadastrarUsuario(nome, senha);
    const user = await loginUsuario(nome, senha);
    setUsuario(user);
  };

  const logout = () => setUsuario(null);

  return (
    <AuthContext.Provider value={{ usuario, login, cadastrar, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
