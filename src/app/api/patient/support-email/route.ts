import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { render } from "@react-email/components";
import SupportEmailTemplate from "../../../../../emails/support-email";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const formData = await req.formData();

  const subject = formData.get("subject") as string;
  const category = formData.get("category") as string;
  const priority = formData.get("priority") as string;
  const message = formData.get("message") as string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const attachments: any[] = [];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const [_, value] of Array.from(formData.entries())) {
    if (value instanceof File) {
      const buffer = Buffer.from(await value.arrayBuffer());
      attachments.push({
        filename: value.name,
        content: buffer,
      });
    }
  }

  const html = await render(
    SupportEmailTemplate({
      name: session?.user?.name ?? "",
      email: session?.user?.email ?? "",
      subject,
      category,
      priority,
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
    from: `"MITIC CARE" <${process.env.EMAIL_USER}>`,
    to: "contact@miticsarl.com",
    subject: `Support MITIC CARE - ${subject}`,
    html,
    replyTo: session?.user?.email,
    attachments,
  });

  return NextResponse.json({
    success: true,
    ticketId: `TICKET-${Math.floor(Math.random() * 10000)}`,
  });
}
