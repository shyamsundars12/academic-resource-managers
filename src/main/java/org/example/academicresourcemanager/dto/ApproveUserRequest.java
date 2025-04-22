package org.example.academicresourcemanager.dto;

public class ApproveUserRequest {

    private boolean approved;

    // Constructor
    public ApproveUserRequest(boolean approved) {
        this.approved = approved;
    }

    // Getter and Setter
    public boolean isApproved() {
        return approved;
    }

    public void setApproved(boolean approved) {
        this.approved = approved;
    }
}
