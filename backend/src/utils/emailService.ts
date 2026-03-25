import nodemailer from 'nodemailer';
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, RESEND_API_KEY } from '../secrets';
import { Resend } from 'resend';

const resend = new Resend(RESEND_API_KEY);

async function sendMailWithRetry(mailOptions: any, retries = 2): Promise<any> {
  try {
    const { data, error } = await resend.emails.send({
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      html: mailOptions.html,
    })
  } catch (error) {
    if (retries === 0) throw error;
    console.warn('[SMTP] Retry sending mail...', retries);
    return sendMailWithRetry(mailOptions, retries - 1);
  }
}

function fmtMins(mins: number) {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function shell(title: string, body: string, footer: string) {
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;background:#ffffff;color:#111827;">
      <div style="padding:40px 32px 0;">
        <div style="font-size:11px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#9ca3af;margin-bottom:24px;">CareIt</div>
        <h1 style="font-size:20px;font-weight:600;color:#111827;margin:0 0 24px;line-height:1.4;">${title}</h1>
        ${body}
      </div>
      <div style="padding:24px 32px;margin-top:32px;border-top:1px solid #f3f4f6;">
        <p style="font-size:12px;color:#9ca3af;margin:0;line-height:1.5;">${footer}</p>
      </div>
    </div>`;
}

function statBlock(value: string, label: string, color = '#111827') {
  return `
    <div style="text-align:center;padding:16px 0;">
      <div style="font-size:32px;font-weight:700;color:${color};line-height:1;">${value}</div>
      <div style="font-size:12px;color:#6b7280;margin-top:6px;">${label}</div>
    </div>`;
}

export async function sendStreakReminderEmail(
  to: string,
  userName: string,
  currentStreak: number,
  minutesCodableLeft: number
) {
  const subject = `Your ${currentStreak}-day streak needs attention`;

  const body = `
        <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 24px;">
          ${userName.split(' ')[0]}, you haven't hit 30 minutes of coding today. Your current streak is at risk.
        </p>

        <div style="display:flex;gap:1px;background:#f3f4f6;border-radius:10px;overflow:hidden;margin-bottom:24px;">
          <div style="flex:1;background:#fff;padding:20px;text-align:center;">
            <div style="font-size:28px;font-weight:700;color:#111827;">${currentStreak}</div>
            <div style="font-size:11px;color:#6b7280;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;">day streak</div>
          </div>
          <div style="flex:1;background:#fff;padding:20px;text-align:center;">
            <div style="font-size:28px;font-weight:700;color:#f97316;">30m</div>
            <div style="font-size:11px;color:#6b7280;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;">required</div>
          </div>
          ${minutesCodableLeft > 0 ? `
          <div style="flex:1;background:#fff;padding:20px;text-align:center;">
            <div style="font-size:28px;font-weight:700;color:#10b981;">${minutesCodableLeft}h</div>
            <div style="font-size:11px;color:#6b7280;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;">remaining</div>
          </div>` : ''}
        </div>

        <p style="font-size:14px;color:#6b7280;margin:0;">
          Open your editor to keep going.
        </p>`;

  const html = shell(
    `Don't lose your ${currentStreak}-day streak`,
    body,
    'You received this because streak reminders are enabled. Turn them off in Reports.'
  );

  try {
    await sendMailWithRetry({
      from: SMTP_FROM,
      to,
      subject,
      html,
    });
    console.log(`[Streak Reminder] Email sent to ${to}`);
  } catch (error) {
    console.error(`[Streak Reminder] Failed to send email to ${to}:`, error);
  }
}

export async function sendDailyDigestEmail(
  to: string,
  userName: string,
  line1: string,
  line2: string,
  todayCodingMins: number,
  streakStatus: 'maintained' | 'extended' | 'missed',
  currentStreak: number
) {
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  const subject = `${dateStr} — Your daily summary`;

  const streakLabel = streakStatus === 'missed'
    ? 'Streak paused'
    : `${currentStreak}-day streak ${streakStatus === 'extended' ? 'extended' : 'maintained'}`;
  const streakColor = streakStatus === 'missed' ? '#ef4444' : '#10b981';

  const body = `
        <p style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;font-weight:600;margin:0 0 12px;">${dateStr}</p>

        <div style="border-left:2px solid #e5e7eb;padding-left:16px;margin-bottom:28px;">
          <p style="font-size:16px;color:#111827;line-height:1.7;margin:0 0 4px;font-weight:500;">${line1}</p>
          <p style="font-size:14px;color:#6b7280;line-height:1.6;margin:0;">${line2}</p>
        </div>

        <div style="display:flex;gap:1px;background:#f3f4f6;border-radius:10px;overflow:hidden;">
          <div style="flex:1;background:#fff;padding:20px;text-align:center;">
            <div style="font-size:24px;font-weight:700;color:#111827;">${fmtMins(todayCodingMins)}</div>
            <div style="font-size:11px;color:#6b7280;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;">coding</div>
          </div>
          <div style="flex:1;background:#fff;padding:20px;text-align:center;">
            <div style="font-size:14px;font-weight:600;color:${streakColor};line-height:1.3;">${streakLabel}</div>
          </div>
        </div>`;

  const html = shell(
    `Hey ${userName.split(' ')[0]}, here's your day`,
    body,
    'Daily digest from CareIt. Disable in Settings.'
  );

  try {
    await sendMailWithRetry({
      from: SMTP_FROM,
      to,
      subject,
      html,
    });
    console.log(`[Streak Reminder] Email sent to ${to}`);
  } catch (error) {
    console.error(`[Streak Reminder] Failed to send email to ${to}:`, error);
  }
}

export async function sendBurnoutAlertEmail(
  to: string,
  userName: string,
  burnoutLevel: 'MILD' | 'MODERATE' | 'SEVERE',
  currentAvgMins: number,
  baselineAvgMins: number,
  dropPercent: number
) {
  const configs = {
    MILD: {
      title: 'Your coding pace has dipped',
      accent: '#f59e0b',
      message: `Your recent average is ${dropPercent}% below your baseline. A short focused session can help rebuild momentum.`,
      tip: 'Try a 25-minute focused session tomorrow.',
    },
    MODERATE: {
      title: 'Noticeable decline in activity',
      accent: '#f97316',
      message: `Coding time is down ${dropPercent}% over the past two weeks. A few consistent sessions can turn this around.`,
      tip: 'Block 30 minutes on your calendar and protect that time.',
    },
    SEVERE: {
      title: 'Significant drop in activity',
      accent: '#ef4444',
      message: `Activity has dropped ${dropPercent}% from your baseline. This often signals burnout. Rest is productive too.`,
      tip: 'Take a proper break. Your data will be here when you return.',
    },
  };

  const cfg = configs[burnoutLevel];
  const subject = `CareIt: ${cfg.title}`;

  const body = `
        <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 24px;">
          ${userName.split(' ')[0]}, we noticed a change in your coding patterns.
        </p>

        <div style="display:flex;gap:1px;background:#f3f4f6;border-radius:10px;overflow:hidden;margin-bottom:24px;">
          ${statBlock(fmtMins(baselineAvgMins), 'baseline avg/day', '#10b981')}
          <div style="display:flex;align-items:center;padding:0 4px;background:#fff;color:#d1d5db;">→</div>
          ${statBlock(fmtMins(currentAvgMins), 'recent avg/day', cfg.accent)}
          ${statBlock(`-${dropPercent}%`, 'change', cfg.accent)}
        </div>

        <p style="font-size:14px;color:#374151;line-height:1.7;margin:0 0 20px;">${cfg.message}</p>

        <div style="border-left:2px solid ${cfg.accent};padding:12px 16px;background:#fafafa;border-radius:0 8px 8px 0;">
          <p style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;margin:0 0 4px;">Suggestion</p>
          <p style="font-size:14px;color:#374151;margin:0;line-height:1.5;">${cfg.tip}</p>
        </div>`;

  const html = shell(cfg.title, body, 'CareIt tracks your wellbeing, not just your code.');

  try {
    await sendMailWithRetry({
      from: SMTP_FROM,
      to,
      subject,
      html,
    });
    console.log(`[Streak Reminder] Email sent to ${to}`);
  } catch (error) {
    console.error(`[Streak Reminder] Failed to send email to ${to}:`, error);
  }
}

export async function sendRecalibrateEmail(
  to: string,
  userName: string,
  missRate: number,
  aiSuggestion: string,
  currentGoalSummary: string,
) {
  const firstName = userName.split(' ')[0];
  const subject = `Time to adjust your targets, ${firstName}`;

  const body = `
        <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 24px;">
          ${firstName}, you've missed your streak target ${missRate}% of the time recently.
          That's not a failure — it's a signal your targets may be too ambitious.
        </p>

        <div style="background:#fafafa;border-radius:10px;padding:20px;text-align:center;margin-bottom:24px;">
          <div style="font-size:36px;font-weight:700;color:#ef4444;line-height:1;">${missRate}%</div>
          <div style="font-size:12px;color:#6b7280;margin-top:6px;">miss rate (last 2 weeks)</div>
        </div>

        <div style="margin-bottom:20px;">
          <p style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;margin:0 0 8px;">Current targets</p>
          <div style="font-size:14px;color:#374151;padding:12px 16px;background:#fafafa;border-radius:8px;line-height:1.6;">${currentGoalSummary}</div>
        </div>

        <div style="border-left:2px solid #6366f1;padding:12px 16px;background:#fafafa;border-radius:0 8px 8px 0;margin-bottom:20px;">
          <p style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;margin:0 0 4px;">AI suggestion</p>
          <p style="font-size:14px;color:#374151;margin:0;line-height:1.6;">${aiSuggestion}</p>
        </div>

        <p style="font-size:13px;color:#6b7280;margin:0;">
          Update your targets in <strong style="color:#374151;">Goals</strong> anytime.
        </p>`;

  const html = shell(`Time to recalibrate, ${firstName}`, body, 'CareIt — helping you build sustainable habits.');

  try {
    await sendMailWithRetry({
      from: SMTP_FROM,
      to,
      subject,
      html,
    });
    console.log(`[Streak Reminder] Email sent to ${to}`);
  } catch (error) {
    console.error(`[Streak Reminder] Failed to send email to ${to}:`, error);
  }
}

export async function sendLevelUpEmail(
  to: string,
  userName: string,
  hitRate: number,
  avgCodingMins: number,
  newGoals: { title: string; description: string; targetValue: number; unit: string }[],
) {
  const firstName = userName.split(' ')[0];
  const subject = `New challenges unlocked, ${firstName}`;

  const body = `
        <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 24px;">
          ${firstName}, you've been consistently exceeding your targets. Time for the next level.
        </p>

        <div style="display:flex;gap:1px;background:#f3f4f6;border-radius:10px;overflow:hidden;margin-bottom:28px;">
          ${statBlock(`${hitRate}%`, 'streak hit rate', '#10b981')}
          ${statBlock(fmtMins(avgCodingMins), 'avg daily coding', '#f97316')}
        </div>

        <p style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;margin:0 0 12px;">New goals added</p>
        <div style="margin-bottom:24px;">
          ${newGoals.map(g => `
          <div style="padding:14px 0;border-bottom:1px solid #f3f4f6;">
            <div style="font-size:14px;font-weight:600;color:#111827;margin-bottom:2px;">${g.title}</div>
            <div style="font-size:13px;color:#6b7280;">Target: ${g.targetValue} ${g.unit}</div>
            ${g.description ? `<div style="font-size:12px;color:#9ca3af;margin-top:2px;">${g.description}</div>` : ''}
          </div>`).join('')}
        </div>

        <p style="font-size:13px;color:#6b7280;margin:0;">
          These goals are live in <strong style="color:#374151;">Goals</strong>. Keep going.
        </p>`;

  const html = shell(`Level up, ${firstName}`, body, 'CareIt — raising the bar with you.');

  try {
    await sendMailWithRetry({
      from: SMTP_FROM,
      to,
      subject,
      html,
    });
    console.log(`[Streak Reminder] Email sent to ${to}`);
  } catch (error) {
    console.error(`[Streak Reminder] Failed to send email to ${to}:`, error);
  }
}

export async function sendFeedbackEmail(
  userName: string,
  userEmail: string,
  category: 'bug' | 'feature' | 'other',
  message: string,
) {
  const categoryLabels = { bug: 'Bug Report', feature: 'Feature Request', other: 'General Feedback' };
  const categoryColors = { bug: '#ef4444', feature: '#8b5cf6', other: '#6b7280' };

  const subject = `[CareIt Feedback] ${categoryLabels[category]} from ${userName}`;
  const body = `
        <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 20px;">
          New feedback submitted through the app.
        </p>

        <div style="margin-bottom:24px;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td style="font-size:12px;color:#6b7280;padding:8px 0;border-bottom:1px solid #f3f4f6;width:90px;">From</td>
              <td style="font-size:14px;color:#111827;font-weight:500;padding:8px 0;border-bottom:1px solid #f3f4f6;">${userName} (${userEmail})</td>
            </tr>
            <tr>
              <td style="font-size:12px;color:#6b7280;padding:8px 0;border-bottom:1px solid #f3f4f6;">Category</td>
              <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;">
                <span style="display:inline-block;font-size:11px;font-weight:600;color:${categoryColors[category]};background:${categoryColors[category]}12;padding:2px 10px;border-radius:20px;letter-spacing:0.5px;">${categoryLabels[category]}</span>
              </td>
            </tr>
            <tr>
              <td style="font-size:12px;color:#6b7280;padding:8px 0;">Time</td>
              <td style="font-size:14px;color:#111827;padding:8px 0;">${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom:8px;">
          <p style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.8px;font-weight:600;margin:0 0 8px;">Message</p>
          <div style="font-size:14px;color:#374151;padding:16px;background:#fafafa;border-radius:8px;line-height:1.7;white-space:pre-wrap;">${message}</div>
        </div>`;

  const html = shell(`Feedback: ${categoryLabels[category]}`, body, `Sent by ${userName} · ${userEmail}`);

  try {
    await sendMailWithRetry({
      from: SMTP_FROM,
      to: SMTP_USER,
      subject,
      html,
    });
    console.log(`[Streak Reminder] Email sent to ${SMTP_USER}`);
  } catch (error) {
    console.error(`[Streak Reminder] Failed to send email to ${SMTP_USER}:`, error);
  }
}

export async function sendWelcomeEmail(to: string, userName: string) {
  const subject = `Welcome to CareIt, ${userName.split(' ')[0]} 🚀`;

  const body = `
        <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 16px;">
          Hi ${userName.split(' ')[0]},
        </p>
        <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 16px;">
          We are thrilled to welcome you to CareIt. This platform represents the union of your coding consistency and your personal well-being.
        </p>
        <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 24px;">
          To get started, try running your first deep work session or sync your Google Calendar to evaluate your meeting load.
        </p>
        
        <p style="font-size:14px;color:#6b7280;margin:0;">
          Happy coding,<br/>The CareIt Team
        </p>`;

  const html = shell(`Welcome to CareIt`, body, 'Focus deeply. Live well.');

  try {
    await sendMailWithRetry({
      from: SMTP_FROM,
      to,
      subject,
      html,
    });
    console.log(`[Streak Reminder] Email sent to ${to}`);
  } catch (error) {
    console.error(`[Streak Reminder] Failed to send email to ${to}:`, error);
  }
}

export async function sendGoodbyeEmail(to: string, userName: string) {
  const subject = `Your CareIt account has been deleted`;

  const body = `
        <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 16px;">
          Hi ${userName.split(' ')[0]},
        </p>
        <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 16px;">
          We are confirming that your CareIt account and all associated relational data have been permanently deleted from our servers, exactly as you requested.
        </p>
        <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 24px;">
          We're sad to see you go. If you ever want to rebuild your streaks and optimize your developer workflow, you're always welcome back.
        </p>
        
        <p style="font-size:14px;color:#6b7280;margin:0;">
          Farewell,<br/>The CareIt Team
        </p>`;

  const html = shell(`Account Deleted successfully`, body, 'Your data has been wiped.');

  try {
    await sendMailWithRetry({
      from: SMTP_FROM,
      to,
      subject,
      html,
    });
    console.log(`[Streak Reminder] Email sent to ${to}`);
  } catch (error) {
    console.error(`[Streak Reminder] Failed to send email to ${to}:`, error);
  }
}
