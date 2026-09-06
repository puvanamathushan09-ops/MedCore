import { apiRequest } from './api-client';
import type {
    UserProfile,
    UpdateProfileInput,
} from '../types/profile.types';

export class ProfileApiClient {
    /**
     * GET /profile/me
     * Retrieves the currently authenticated user's profile.
     */
    static async getMyProfile(token: string): Promise<UserProfile> {
        return apiRequest<UserProfile>('/profile/me', {
            method: 'GET',
            token,
        });
    }

    /**
     * PATCH /profile/me
     * Updates the currently authenticated user's profile.
     */
    static async updateMyProfile(
        data: UpdateProfileInput,
        token: string,
    ): Promise<UserProfile> {
        return apiRequest<UserProfile>('/profile/me', {
            method: 'PATCH',
            body: JSON.stringify(data),
            token,
        });
    }
}