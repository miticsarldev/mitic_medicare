import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { render } from "@react-email/components";
import GeneralContactEmailTemplate from "../../../../../emails/general-email-contact";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { name, email, subject, message } = body;

  const html = await render(
    GeneralContactEmailTemplate({
      name,
      email,
      subject,
      message,
    })
  );

  const transporter = nodemailer.createTransport({
    host: "send.one.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASS!,
    },
  });

  await transporter.sendMail({
    from: `"MITICCARE Contact" <${process.env.EMAIL_USER}>`,
    to: "contact@miticsarl.com",
    subject: `Message de contact - ${subject}`,
    html,
    replyTo: email,
  });

  return NextResponse.json({ success: true });
}
