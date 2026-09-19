import React, { useState, useEffect } from 'react';
import { ProfileApiClient } from '../../../src/client/api/profile.api';
import { getAccessToken } from '../auth/auth-storage';
import { useAuth } from '../auth/AuthContext';
import type { UserProfile, UpdateProfileInput } from '../../../src/client/types/profile.types';
import './Profile.css';

export const Profile: React.FC = () => {
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  // Student profile fields
  const [medicalSchool, setMedicalSchool] = useState<string>('');
  const [yearOfStudy, setYearOfStudy] = useState<string>('');
  const [targetExam, setTargetExam] = useState<string>('');
  const [specializationInterest, setSpecializationInterest] = useState<string>('');

  // Reviewer profile fields
  const [professionalTitle, setProfessionalTitle] = useState<string>('');
  const [specialty, setSpecialty] = useState<string>('');
  const [qualifications, setQualifications] = useState<string>('');
  const [institution, setInstitution] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [expertise, setExpertise] = useState<string>('');

  useEffect(() => {
    const fetchProfile = async () => {
      const token = getAccessToken();
      if (!token) {
        setError('No access token found. Please sign in again.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await ProfileApiClient.getMyProfile(token);
        setProfile(data);

        // Populate basic fields
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setAvatarUrl(data.avatarUrl || '');

        // Populate Student profile fields if role === 'STUDENT'
        if (data.studentProfile) {
          setMedicalSchool(data.studentProfile.medicalSchool || '');
          setYearOfStudy(data.studentProfile.yearOfStudy ? String(data.studentProfile.yearOfStudy) : '');
          setTargetExam(data.studentProfile.targetExam || '');
          setSpecializationInterest(data.studentProfile.specializationInterest || '');
        }

        // Populate Reviewer profile fields if role === 'MEDICAL_REVIEWER'
        if (data.reviewerProfile) {
          setProfessionalTitle(data.reviewerProfile.professionalTitle || '');
          setSpecialty(data.reviewerProfile.specialty || '');
          setQualifications(data.reviewerProfile.qualifications || '');
          setInstitution(data.reviewerProfile.institution || '');
          setBio(data.reviewerProfile.bio || '');
          setExpertise(data.reviewerProfile.expertise || '');
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    void fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAccessToken();
    if (!token) {
      setError('No access token found. Please sign in again.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    const payload: UpdateProfileInput = {
      firstName,
      lastName,
      avatarUrl: avatarUrl ? avatarUrl : undefined,
    };

    if (profile?.role === 'STUDENT') {
      payload.medicalSchool = medicalSchool ? medicalSchool : undefined;
      payload.yearOfStudy = yearOfStudy ? parseInt(yearOfStudy, 10) : undefined;
      payload.targetExam = targetExam ? targetExam : undefined;
      payload.specializationInterest = specializationInterest ? specializationInterest : undefined;
    } else if (profile?.role === 'MEDICAL_REVIEWER') {
      payload.professionalTitle = professionalTitle ? professionalTitle : undefined;
      payload.specialty = specialty ? specialty : undefined;
      payload.qualifications = qualifications ? qualifications : undefined;
      payload.institution = institution ? institution : undefined;
      payload.bio = bio ? bio : undefined;
      payload.expertise = expertise ? expertise : undefined;
    }

    try {
      const updated = await ProfileApiClient.updateMyProfile(payload, token);
      setProfile(updated);
      setSuccessMessage('Profile updated successfully!');
      await refreshUser();
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-loading-state">
          <div className="spinner" />
          <p>Loading profile details...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="profile-container">
        <div className="profile-error-state">
          <div className="alert-banner error">{error}</div>
        </div>
      </div>
    );
  }

  const getRoleBadge = () => {
    switch (profile?.role) {
      case 'MEDICAL_REVIEWER':
        return <span className="role-badge medical_reviewer">Medical Reviewer</span>;
      case 'ADMIN':
        return <span className="role-badge admin">Administrator</span>;
      default:
        return <span className="role-badge student">Medical Student</span>;
    }
  };

  return (
    <div className="profile-container">
      {/* HEADER CARD */}
      <div className="profile-header-card">
        <div className="profile-avatar-large">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" />
          ) : (
            firstName ? firstName[0].toUpperCase() : 'U'
          )}
        </div>
        <div className="profile-header-info">
          <h1>{firstName} {lastName}</h1>
          <p className="user-email">{profile?.email}</p>
          {getRoleBadge()}
        </div>
      </div>

      {successMessage && (
        <div className="alert-banner success">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {successMessage}
        </div>
      )}

      {error && (
        <div className="alert-banner error">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* BASIC USER INFORMATION */}
        <div className="profile-card">
          <h2 className="profile-section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Personal Information
          </h2>

          <div className="profile-form-grid">
            <div className="profile-form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                type="text"
                className="profile-form-input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
                required
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                type="text"
                className="profile-form-input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
                required
              />
            </div>

            <div className="profile-form-group form-group-full">
              <label htmlFor="avatarUrl">Avatar Image URL</label>
              <input
                id="avatarUrl"
                type="url"
                className="profile-form-input"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>
        </div>

        {/* ROLE SPECIFIC FIELDS */}
        {profile?.role === 'STUDENT' && (
          <div className="profile-card">
            <h2 className="profile-section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
              Student Academic Profile
            </h2>

            <div className="profile-form-grid">
              <div className="profile-form-group">
                <label htmlFor="medicalSchool">Medical School</label>
                <input
                  id="medicalSchool"
                  type="text"
                  className="profile-form-input"
                  value={medicalSchool}
                  onChange={(e) => setMedicalSchool(e.target.value)}
                  placeholder="e.g. Johns Hopkins School of Medicine"
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="yearOfStudy">Year of Study</label>
                <select
                  id="yearOfStudy"
                  className="profile-form-select"
                  value={yearOfStudy}
                  onChange={(e) => setYearOfStudy(e.target.value)}
                >
                  <option value="">Select Year</option>
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                  <option value="5">Year 5+</option>
                </select>
              </div>

              <div className="profile-form-group">
                <label htmlFor="targetExam">Target Exam</label>
                <input
                  id="targetExam"
                  type="text"
                  className="profile-form-input"
                  value={targetExam}
                  onChange={(e) => setTargetExam(e.target.value)}
                  placeholder="e.g. USMLE Step 1, PLAB 1"
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="specializationInterest">Specialization Interest</label>
                <input
                  id="specializationInterest"
                  type="text"
                  className="profile-form-input"
                  value={specializationInterest}
                  onChange={(e) => setSpecializationInterest(e.target.value)}
                  placeholder="e.g. Cardiology, Neurology"
                />
              </div>
            </div>
          </div>
        )}

        {profile?.role === 'MEDICAL_REVIEWER' && (
          <div className="profile-card">
            <h2 className="profile-section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Medical Reviewer Professional Profile
            </h2>

            <div className="profile-form-grid">
              <div className="profile-form-group">
                <label htmlFor="professionalTitle">Professional Title</label>
                <input
                  id="professionalTitle"
                  type="text"
                  className="profile-form-input"
                  value={professionalTitle}
                  onChange={(e) => setProfessionalTitle(e.target.value)}
                  placeholder="e.g. Associate Professor of Cardiology"
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="specialty">Clinical Specialty</label>
                <input
                  id="specialty"
                  type="text"
                  className="profile-form-input"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="e.g. Interventional Cardiology"
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="qualifications">Qualifications</label>
                <input
                  id="qualifications"
                  type="text"
                  className="profile-form-input"
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  placeholder="e.g. MD, FACC, PhD"
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="institution">Institution / Hospital</label>
                <input
                  id="institution"
                  type="text"
                  className="profile-form-input"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. Mayo Clinic"
                />
              </div>

              <div className="profile-form-group form-group-full">
                <label htmlFor="bio">Professional Bio</label>
                <textarea
                  id="bio"
                  className="profile-form-textarea"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Summary of your medical background and experience..."
                />
              </div>

              <div className="profile-form-group form-group-full">
                <label htmlFor="expertise">Areas of Expertise</label>
                <textarea
                  id="expertise"
                  className="profile-form-textarea"
                  value={expertise}
                  onChange={(e) => setExpertise(e.target.value)}
                  placeholder="Key clinical subjects or research topics you review..."
                />
              </div>
            </div>
          </div>
        )}

        <div className="profile-actions">
          <button
            type="submit"
            className="btn-save-profile"
            disabled={saving}
          >
            {saving ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
