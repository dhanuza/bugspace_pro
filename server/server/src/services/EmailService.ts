import nodemailer from "nodemailer";

/**
 * EmailService — sends invite emails via SMTP.
 *
 * Configuration via environment variables:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 *
 * Falls back to console logging if SMTP is not configured.
 */
export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private from: string;

  constructor() {
    this.from = process.env.SMTP_FROM || "BugspacePro <noreply@bugspacepro.com>";

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      console.log("[EmailService] SMTP configured:", process.env.SMTP_HOST);
    } else {
      console.log("[EmailService] No SMTP config — emails will be logged to console.");
    }
  }

  /**
   * Send an invite email with a secure link.
   */
  async sendInviteEmail(options: {
    to: string;
    name: string;
    role: string;
    inviteUrl: string;
    orgName?: string;
  }): Promise<void> {
    const { to, name, role, inviteUrl, orgName = "BugspacePro" } = options;

    const subject = `You've been invited to ${orgName}`;
    const html = this.buildInviteHtml({ name, role, inviteUrl, orgName });
    const text = `Hi ${name},\n\nYou've been invited to join ${orgName} as a ${role}.\n\nAccept your invitation: ${inviteUrl}\n\nThis link expires in 24 hours.\n\n— The ${orgName} Team`;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.from,
          to,
          subject,
          text,
          html,
        });
        console.log(`[EmailService] Invite sent to ${to}`);
      } catch (err) {
        console.error(`[EmailService] Failed to send to ${to}:`, err);
        throw new Error("Failed to send invite email.");
      }
    } else {
      // Fallback: log to console for development
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`📧 INVITE EMAIL (dev mode — no SMTP configured)`);
      console.log(`   To:   ${to}`);
      console.log(`   Name: ${name}`);
      console.log(`   Role: ${role}`);
      console.log(`   Link: ${inviteUrl}`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    }
  }

  private buildInviteHtml(opts: {
    name: string;
    role: string;
    inviteUrl: string;
    orgName: string;
  }): string {
    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8f9fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
    <tr>
      <td style="background:linear-gradient(135deg,#0b0e14 0%,#1e1b4b 100%);padding:32px 40px;text-align:center;">
        <div style="font-size:24px;font-weight:800;color:#fff;letter-spacing:-0.5px;">
          Bugspace<span style="color:#a855f7;">Pro</span>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding:40px;">
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1e293b;">
          You're invited! 🎉
        </h1>
        <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;">
          Hi <strong>${opts.name}</strong>, you've been invited to join
          <strong>${opts.orgName}</strong> as a <strong style="color:#7c3aed;">${opts.role}</strong>.
        </p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${opts.inviteUrl}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:0.3px;">
            Accept Invitation
          </a>
        </div>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:24px 0;">
          <p style="margin:0;font-size:13px;color:#64748b;line-height:1.6;">
            <strong>Important:</strong> You must sign in with <strong>${opts.name.split(" ")[0]}'s email address</strong>
            that received this invitation. You can use Google OAuth or Email &amp; Password.
          </p>
        </div>
        <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;">
          This invitation expires in <strong>24 hours</strong>. If the button doesn't work, copy this link:<br>
          <a href="${opts.inviteUrl}" style="color:#7c3aed;word-break:break-all;">${opts.inviteUrl}</a>
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;">
        <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">
          © ${new Date().getFullYear()} BugspacePro. This is an automated invitation — please do not reply.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
  }
}

export const emailService = new EmailService();
