import { render } from "@react-email/render";
import { VerificationEmail } from "../../emails/verification-email";
import React from "react";
import { UserRole } from "@prisma/client";
import VerificationEmailDoctor from "../../emails/verification-email-doctor";
import VerificationEmailHospital from "../../emails/verification-email-hospital";
import PasswordResetEmail from "../../emails/password-reset-email";
import PasswordResetSuccessEmail from "../../emails/password-reset-sucess-email";
import ApprovalEmail from "../../emails/approval-email";
import PatientWelcomeEmail from "../../emails/patient-welcome-email";
import VerificationPendingEmail from "../../emails/VerificationPendingEmail";

export async function getVerificationEmailTemplate(
  userName: string,
  verificationLink: string,
  userRole: UserRole = "PATIENT",
  expiryHours?: number,
  hospitalName?: string
) {
  let html: string;

  if (userRole === "PATIENT") {
    html = await render(
      React.createElement(VerificationEmail, {
        verificationLink: verificationLink,
        userName: userName,
        expiryHours: expiryHours,
      })
    );
  } else if (userRole === "INDEPENDENT_DOCTOR") {
    html = await render(
      React.createElement(VerificationEmailDoctor, {
        verificationLink: verificationLink,
        doctorName: userName,
        expiryHours: expiryHours,
      })
    );
  } else {
    html = await render(
      React.createElement(VerificationEmailHospital, {
        verificationLink: verificationLink,
        adminName: userName,
        hospitalName: hospitalName,
        expiryHours: expiryHours,
      })
    );
  }

  return html;
}

export async function getPasswordResetCodeEmailTemplate(
  username: string,
  code: string,
  expiresIn: number
) {
  return await render(
    React.createElement(PasswordResetEmail, {
      resetCode: code,
      userName: username,
      expiryMinutes: expiresIn,
    })
  );
}

export async function getPasswordResetSuccessEmailTemplate(username: string) {
  return await render(
    React.createElement(PasswordResetSuccessEmail, {
      userName: username,
    })
  );
}

export async function getApprovalEmailTemplate(
  name: string,
  hospitalName: string,
  userRole: "INDEPENDENT_DOCTOR" | "HOSPITAL_ADMIN"
) {
  return await render(
    React.createElement(ApprovalEmail, {
      name,
      hospitalName,
      userRole,
    })
  );
}

/**
 * Returns the HTML for the patient welcome / invite email.
 * If setPasswordUrl is provided => invite to set password.
 * Otherwise => generic welcome with login button.
 */
export async function getPatientWelcomeEmailTemplate(opts: {
  name: string;
  setPasswordUrl?: string;
  loginUrl?: string;
}) {
  const { name, setPasswordUrl, loginUrl } = opts;

  return await render(
    React.createElement(PatientWelcomeEmail, {
      name,
      setPasswordUrl,
      loginUrl,
    })
  );
}

export async function getAdminIndependantWelcomeEmailTemplate(opts: {
  name: string;
  role: "HOSPITAL_ADMIN" | "INDEPENDENT_DOCTOR";
  helpUrl?: string;
  statusUrl?: string;
}) {
  const { name, role, helpUrl, statusUrl } = opts;

  return await render(
    React.createElement(VerificationPendingEmail, {
      name,
      role,
      helpUrl,
      statusUrl,
    })
  );
}
