export type UserRole =
    | 'STUDENT'
    | 'MEDICAL_REVIEWER'
    | 'ADMIN';

export interface AuthUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface RegisterInput {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface LoginResponse {
    accessToken: string;
    user: AuthUser;
}

export interface RegisterResponse {
    message: string;
    user: AuthUser;
}