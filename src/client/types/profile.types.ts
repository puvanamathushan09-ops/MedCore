export interface StudentProfile {
    id: string;
    medicalSchool: string | null;
    yearOfStudy: number | null;
    targetExam: string | null;
    specializationInterest: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ReviewerProfile {
    id: string;
    professionalTitle: string | null;
    specialty: string | null;
    qualifications: string | null;
    institution: string | null;
    bio: string | null;
    expertise: string | null;
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
    reviewerProfile: ReviewerProfile | null;
}

export interface UpdateProfileInput {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    medicalSchool?: string;
    yearOfStudy?: number;
    targetExam?: string;
    specializationInterest?: string;
    professionalTitle?: string;
    specialty?: string;
    qualifications?: string;
    institution?: string;
    bio?: string;
    expertise?: string;
}