import { render } from "@react-email/render";
import { VerificationEmail } from "../../emails/verification-email";
import React from "react";
import { UserRole } from "@prisma/client";
import VerificationEmailDoctor from "../../emails/verification-email-doctor";
import VerificationEmailHospital from "../../emails/verification-email-hospital";
import PasswordResetEmail from "../../emails/password-reset-email";
import PasswordResetSuccessEmail from "../../emails/password-reset-sucess-email";

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
