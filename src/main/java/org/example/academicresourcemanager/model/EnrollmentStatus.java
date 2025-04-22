package org.example.academicresourcemanager.model;

public enum EnrollmentStatus {
    PENDING,    // When student first requests enrollment
    APPROVED,   // When teacher approves enrollment
    REJECTED,   // When teacher rejects enrollment
    COMPLETED,  // When student completes the course
    WITHDRAWN   // When student withdraws from the course
} 