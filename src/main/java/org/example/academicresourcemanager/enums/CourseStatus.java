package org.example.academicresourcemanager.enums;

public enum CourseStatus {
    DRAFT,      // When a teacher first creates a course
    PENDING,    // When course is submitted for admin approval
    ACTIVE,     // When course is approved and available for enrollment
    ARCHIVED,   // When course is no longer active but preserved for reference
    REJECTED    // When course is rejected by admin
} 