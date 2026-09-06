export interface StudentProfile {
    id: string;
    medicalSchool: string | null;
    yearOfStudy: number | null;
    targetExam: string | null;
    specializationInterest: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface UserProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    role: 'STUDENT' | 'MEDICAL_REVIEWER' | 'ADMIN';
    createdAt: string;
    updatedAt: string;
    studentProfile: StudentProfile | null;
}

export interface UpdateProfileInput {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    medicalSchool?: string;
    yearOfStudy?: number;
    targetExam?: string;
    specializationInterest?: string;
}