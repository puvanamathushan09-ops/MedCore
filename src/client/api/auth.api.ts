import { apiRequest } from './api-client';
import type {
    AuthUser,
    LoginInput,
    LoginResponse,
    RegisterInput,
    RegisterResponse,
} from '../types/auth.types';

export class AuthApiClient {
    /**
     * POST /auth/login
     * Authenticates a user and returns an access token.
     */
    static async login(data: LoginInput): Promise<LoginResponse> {
        return apiRequest<LoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * POST /auth/register
     * Creates a new student account.
     */
    static async register(data: RegisterInput): Promise<RegisterResponse> {
        return apiRequest<RegisterResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * GET /auth/me
     * Retrieves the currently authenticated user.
     */
    static async getMe(token: string): Promise<AuthUser> {
        return apiRequest<AuthUser>('/auth/me', {
            method: 'GET',
            token,
        });
    }
}