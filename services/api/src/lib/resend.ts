import { Resend } from 'resend';
import { env } from '../config.js';

export const resend = new Resend(env.RESEND_API_KEY);

export const FROM_EMAIL = 'Flick <noreply@flickapp.co>';

export async function sendWelcomeEmail(to: string, displayName: string) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Welcome to Flick, ${displayName} 🎬`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;color:#1a1a1a;">
        <h1 style="font-size:24px;font-weight:700;">Your cinema journey starts now.</h1>
        <p>Hi ${displayName},</p>
        <p>Welcome to Flick. You'll get a personalised Daily Pick every morning — at least one film per day that's chosen specifically for the way <em>you</em> watch films.</p>
        <p>Start by rating a few films you've already seen. The more you rate, the better your picks get.</p>
        <p style="margin-top:32px;color:#888;font-size:13px;">
          You're receiving this because you signed up for Flick.<br>
          <a href="https://flickapp.co/unsubscribe" style="color:#888;">Unsubscribe</a>
        </p>
      </div>
    `,
  });
}

export async function sendDigestEmail(
  to: string,
  displayName: string,
  content: {
    weeklyPick: { title: string; year: number };
    personalised: { title: string; year: number };
    hiddenGem: { title: string; year: number };
  }
) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Your weekly Flick picks`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;color:#1a1a1a;">
        <h1 style="font-size:20px;font-weight:700;">This week on Flick</h1>
        <p>Hi ${displayName}, here are your handpicked films for the week:</p>
        <ul>
          <li><strong>Film of the week:</strong> ${content.weeklyPick.title} (${content.weeklyPick.year})</li>
          <li><strong>Because of your taste:</strong> ${content.personalised.title} (${content.personalised.year})</li>
          <li><strong>Hidden gem:</strong> ${content.hiddenGem.title} (${content.hiddenGem.year})</li>
        </ul>
        <p style="margin-top:32px;color:#888;font-size:13px;">
          <a href="https://flickapp.co/unsubscribe" style="color:#888;">Unsubscribe from digest emails</a>
        </p>
      </div>
    `,
  });
}
