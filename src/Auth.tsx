import React, { createContext, useState, ReactNode, useContext } from 'react';
// Définition du type pour le contexte (le type utilisateur peut être amélioré selon vos besoins)
import type { AuthContextType } from './types';

// Création du contexte avec une valeur par défaut de `undefined`
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Typage des props du `AuthProvider`
type AuthProviderProps = {
    children: ReactNode; // children est de type ReactNode, ce qui permet d'accepter n'importe quel élément React
};

// `AuthProvider` gère le contexte de l'authentification
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [uid, setUserUid] = useState<string | null>(null);

    const authUid = (uid: string) => {
        setUserUid(uid);
    };

    const deconnecter = () => {
        setUserUid(null);
    };

    return (
        <AuthContext.Provider value={{ uid, authUid, deconnecter }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};