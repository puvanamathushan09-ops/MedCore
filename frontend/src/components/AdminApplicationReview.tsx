import React, { useState, useEffect, useCallback } from 'react';
import { ReviewerApplicationsApiClient } from '../../../src/client/api/reviewer-applications.api';
import { getAccessToken } from '../auth/auth-storage';
import type {
  ReviewerApplication,
  ApplicationStatus,
} from '../../../src/client/types/reviewer-application.types';
import './AdminApplicationReview.css';

export const AdminApplicationReview: React.FC = () => {
  const [applications, setApplications] = useState<ReviewerApplication[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState<'ALL' | ApplicationStatus>('PENDING');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Modals state
  const [selectedApp, setSelectedApp] = useState<ReviewerApplication | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setError('Admin access token missing.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await ReviewerApplicationsApiClient.getAllApplications(
        {
          status: statusFilter === 'ALL' ? undefined : statusFilter,
          page,
          limit: 10,
        },
        token,
      );

      setApplications(response.data || []);
      setTotalCount(response.meta?.total || 0);
      setTotalPages(response.meta?.totalPages || 1);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch reviewer applications.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleApprove = async (appId: string, applicantName: string) => {
    if (!window.confirm(`Are you sure you want to approve "${applicantName}" as a Medical Reviewer?`)) {
      return;
    }

    const token = getAccessToken();
    if (!token) return;

    setProcessingId(appId);
    setError(null);
    setSuccessMessage(null);

    try {
      await ReviewerApplicationsApiClient.approveApplication(appId, token);
      setSuccessMessage(`Successfully approved ${applicantName} as a Medical Reviewer.`);
      await fetchApplications();
    } catch (err: any) {
      setError(err?.message || 'Failed to approve reviewer application.');
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (app: ReviewerApplication) => {
    setSelectedApp(app);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedApp) return;

    const token = getAccessToken();
    if (!token) return;

    setProcessingId(selectedApp.id);
    setError(null);
    setSuccessMessage(null);

    try {
      await ReviewerApplicationsApiClient.rejectApplication(
        selectedApp.id,
        { rejectionReason: rejectionReason.trim() || undefined },
        token,
      );
      setSuccessMessage(`Application for ${selectedApp.user?.firstName || 'applicant'} rejected.`);
      setShowRejectModal(false);
      setSelectedApp(null);
      await fetchApplications();
    } catch (err: any) {
      setError(err?.message || 'Failed to reject reviewer application.');
    } finally {
      setProcessingId(null);
    }
  };

  const openDetailModal = (app: ReviewerApplication) => {
    setSelectedApp(app);
    setShowDetailModal(true);
  };

  return (
    <div className="admin-app-review-container" data-testid="admin-application-review">
      {/* HEADER */}
      <div className="admin-review-header">
        <div>
          <h2 className="admin-review-title">Medical Reviewer Verification Portal</h2>
          <p className="admin-review-subtitle">
            Review applicant credentials and approve clinical experts to grant Medical Reviewer privileges.
          </p>
        </div>
      </div>

      {/* ALERT BANNERS */}
      {error && (
        <div className="admin-review-alert alert-error" data-testid="admin-review-error">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="btn-alert-close">&times;</button>
        </div>
      )}

      {successMessage && (
        <div className="admin-review-alert alert-success" data-testid="admin-review-success">
          <span>{successMessage}</span>
          <button type="button" onClick={() => setSuccessMessage(null)} className="btn-alert-close">&times;</button>
        </div>
      )}

      {/* TABS & FILTERS */}
      <div className="admin-review-controls">
        <div className="status-tabs">
          <button
            type="button"
            className={`tab-btn ${statusFilter === 'PENDING' ? 'active' : ''}`}
            onClick={() => { setStatusFilter('PENDING'); setPage(1); }}
            data-testid="filter-pending-btn"
          >
            Pending Review
          </button>
          <button
            type="button"
            className={`tab-btn ${statusFilter === 'APPROVED' ? 'active' : ''}`}
            onClick={() => { setStatusFilter('APPROVED'); setPage(1); }}
            data-testid="filter-approved-btn"
          >
            Approved
          </button>
          <button
            type="button"
            className={`tab-btn ${statusFilter === 'REJECTED' ? 'active' : ''}`}
            onClick={() => { setStatusFilter('REJECTED'); setPage(1); }}
            data-testid="filter-rejected-btn"
          >
            Rejected
          </button>
          <button
            type="button"
            className={`tab-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => { setStatusFilter('ALL'); setPage(1); }}
            data-testid="filter-all-btn"
          >
            All Applications
          </button>
        </div>
      </div>

      {/* TABLE / LIST CONTENT */}
      {loading ? (
        <div className="admin-review-loading">
          <div className="spinner"></div>
          <p>Loading applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="admin-review-empty" data-testid="admin-review-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
          <p>No reviewer applications found for status "{statusFilter}".</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="admin-review-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Professional Credentials</th>
                <th>Institution</th>
                <th>Submitted</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => {
                const applicantName = app.user
                  ? `${app.user.firstName} ${app.user.lastName}`
                  : 'Applicant';
                const applicantEmail = app.user?.email || 'N/A';
                const isPending = app.status === 'PENDING';

                return (
                  <tr key={app.id} data-testid={`application-row-${app.id}`}>
                    <td>
                      <div className="applicant-cell-name">{applicantName}</div>
                      <div className="applicant-cell-email">{applicantEmail}</div>
                    </td>
                    <td>
                      <div className="credentials-title">{app.professionalTitle} - {app.specialty}</div>
                      <div className="credentials-sub">{app.qualifications}</div>
                    </td>
                    <td>{app.institution}</td>
                    <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge status-${app.status.toLowerCase()}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="text-right action-cells">
                      <button
                        type="button"
                        className="btn-action btn-view-details"
                        onClick={() => openDetailModal(app)}
                        data-testid={`view-details-btn-${app.id}`}
                      >
                        Details
                      </button>

                      {isPending && (
                        <>
                          <button
                            type="button"
                            className="btn-action btn-approve"
                            onClick={() => handleApprove(app.id, applicantName)}
                            disabled={processingId === app.id}
                            data-testid={`approve-btn-${app.id}`}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="btn-action btn-reject"
                            onClick={() => openRejectModal(app)}
                            disabled={processingId === app.id}
                            data-testid={`reject-btn-${app.id}`}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            type="button"
            className="btn-page"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span>Page {page} of {totalPages} (Total {totalCount})</span>
          <button
            type="button"
            className="btn-page"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      )}

      {/* DETAILS MODAL */}
      {showDetailModal && selectedApp && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} data-testid="detail-modal">
            <div className="modal-header">
              <h3>Applicant Credentials & Profile</h3>
              <button type="button" className="modal-close-btn" onClick={() => setShowDetailModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <strong>Applicant Name:</strong>
                <span>{selectedApp.user ? `${selectedApp.user.firstName} ${selectedApp.user.lastName}` : 'N/A'}</span>
              </div>
              <div className="detail-row">
                <strong>Email Address:</strong>
                <span>{selectedApp.user?.email}</span>
              </div>
              <div className="detail-row">
                <strong>Professional Title:</strong>
                <span>{selectedApp.professionalTitle}</span>
              </div>
              <div className="detail-row">
                <strong>Specialty:</strong>
                <span>{selectedApp.specialty}</span>
              </div>
              <div className="detail-row">
                <strong>Qualifications:</strong>
                <span>{selectedApp.qualifications}</span>
              </div>
              <div className="detail-row">
                <strong>Institution:</strong>
                <span>{selectedApp.institution}</span>
              </div>
              {selectedApp.bio && (
                <div className="detail-block">
                  <strong>Professional Bio:</strong>
                  <p>{selectedApp.bio}</p>
                </div>
              )}
              {selectedApp.expertise && (
                <div className="detail-block">
                  <strong>Areas of Expertise:</strong>
                  <p>{selectedApp.expertise}</p>
                </div>
              )}
              {selectedApp.rejectionReason && (
                <div className="detail-block rejection-block">
                  <strong>Rejection Reason:</strong>
                  <p>{selectedApp.rejectionReason}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-modal-secondary" onClick={() => setShowDetailModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && selectedApp && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} data-testid="reject-modal">
            <div className="modal-header">
              <h3>Reject Medical Reviewer Application</h3>
              <button type="button" className="modal-close-btn" onClick={() => setShowRejectModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p>
                Please provide a reason for rejecting the application from{' '}
                <strong>{selectedApp.user?.firstName} {selectedApp.user?.lastName}</strong>.
              </p>
              <textarea
                className="reject-reason-textarea"
                rows={4}
                placeholder="Enter rejection reason or feedback for applicant..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-modal-secondary"
                onClick={() => setShowRejectModal(false)}
                disabled={processingId === selectedApp.id}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-modal-danger"
                onClick={handleConfirmReject}
                disabled={processingId === selectedApp.id}
                data-testid="confirm-reject-btn"
              >
                {processingId === selectedApp.id ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
