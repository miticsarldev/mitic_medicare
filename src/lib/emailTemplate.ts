import { render } from "@react-email/render";
import { VerificationEmail } from "../../emails/verification-email";
import React from "react";
import { UserRole } from "@prisma/client";
import VerificationEmailDoctor from "../../emails/verification-email-doctor";
import VerificationEmailHospital from "../../emails/verification-email-hospital";

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
