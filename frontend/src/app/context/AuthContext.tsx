import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface MedicalDetails {
    blood_group?: string;
    allergies?: string;
    conditions?: string;
    medications?: string;
}

interface EmergencyContact {
    name: string;
    phone: string;
    relation: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    medical_details?: MedicalDetails;
    emergency_contacts?: EmergencyContact[];
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem("thor_token");
        const storedUser = localStorage.getItem("thor_user");
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (newToken: string, newUser: User) => {
        localStorage.setItem("thor_token", newToken);
        localStorage.setItem("thor_user", JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
    };

    const logout = () => {
        localStorage.removeItem("thor_token");
        localStorage.removeItem("thor_user");
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
