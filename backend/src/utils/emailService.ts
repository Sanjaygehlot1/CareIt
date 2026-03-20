import nodemailer from 'nodemailer';
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } from '../secrets';

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
});



export async function sendStreakReminderEmail(
    to: string,
    userName: string,
    currentStreak: number,
    minutesCodableLeft: number
) {
    const subject = `🔥 Don't lose your ${currentStreak}-day streak!`;

    const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #111827; border-radius: 16px; overflow: hidden; border: 1px solid #1f2937;">
      <div style="padding: 32px 28px 20px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 8px;">🔥</div>
        <h1 style="color: #f9fafb; font-size: 22px; margin: 0 0 4px;">Hey ${userName}!</h1>
        <p style="color: #9ca3af; font-size: 15px; margin: 0;">Your streak is about to break.</p>
      </div>

      <div style="padding: 0 28px 28px;">
        <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
          <div style="color: rgba(255,255,255,0.8); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Current Streak</div>
          <div style="color: #fff; font-size: 42px; font-weight: 800; line-height: 1;">${currentStreak}</div>
          <div style="color: rgba(255,255,255,0.7); font-size: 14px;">consecutive days</div>
        </div>

        <p style="color: #d1d5db; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
          You haven't coded enough today to keep your streak going. You need at least <strong style="color: #f9fafb;">30 minutes</strong> of coding time.
          ${minutesCodableLeft > 0 ? `You still have roughly <strong style="color: #34d399;">${minutesCodableLeft} hours</strong> left today.` : ''}
        </p>

        <p style="color: #9ca3af; font-size: 13px; margin: 0; text-align: center;">
          Open your editor and keep the momentum going! 💪
        </p>
      </div>

      <div style="background: #0d1117; padding: 16px 28px; text-align: center;">
        <p style="color: #6b7280; font-size: 11px; margin: 0;">
          You're receiving this because you have streak reminders enabled on CareIt.
          <br/>You can turn them off in your Reports page.
        </p>
      </div>
    </div>
    `;

    try {
        await transporter.sendMail({ from: SMTP_FROM, to, subject, html });
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
    const streakEmoji = streakStatus === 'missed' ? '😔' : streakStatus === 'extended' ? '🚀' : '🔥';
    const streakText = streakStatus === 'missed'
        ? 'Streak paused today'
        : `${currentStreak}-day streak ${streakStatus === 'extended' ? 'extended! 🎉' : 'maintained 🔥'}`;

    const subject = `✦ Your Day in 2 Lines — ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`;

    const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #0f172a; border-radius: 20px; overflow: hidden; border: 1px solid #1e293b;">

      <!-- Header -->
      <div style="background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); padding: 32px 28px 24px; text-align: center; border-bottom: 1px solid #1e293b;">
        <div style="display: inline-block; background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.3); border-radius: 50px; padding: 6px 16px; margin-bottom: 16px;">
          <span style="color: #a78bfa; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">Daily Wrap-Up</span>
        </div>
        <h1 style="color: #f8fafc; font-size: 20px; font-weight: 700; margin: 0 0 4px;">Hey ${userName} 👋</h1>
        <p style="color: #64748b; font-size: 14px; margin: 0;">Here's how your day went</p>
      </div>

      <!-- 2-line AI summary -->
      <div style="padding: 28px 28px 0;">
        <div style="background: rgba(139,92,246,0.08); border: 1px solid rgba(139,92,246,0.2); border-radius: 16px; padding: 22px 24px;">
          <div style="color: #a78bfa; font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 12px;">✦ Today's Summary</div>
          <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 8px; font-weight: 500;">${line1}</p>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0;">${line2}</p>
        </div>
      </div>

      <!-- Stats row -->
      <div style="padding: 20px 28px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div style="background: rgba(249,115,22,0.08); border: 1px solid rgba(249,115,22,0.2); border-radius: 12px; padding: 16px; text-align: center;">
            <div style="color: #f97316; font-size: 28px; font-weight: 800; line-height: 1;">${todayCodingMins < 60 ? todayCodingMins + 'm' : Math.floor(todayCodingMins / 60) + 'h ' + (todayCodingMins % 60) + 'm'}</div>
            <div style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Coding time</div>
          </div>
          <div style="background: ${streakStatus === 'missed' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)'}; border: 1px solid ${streakStatus === 'missed' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}; border-radius: 12px; padding: 16px; text-align: center;">
            <div style="font-size: 28px; line-height: 1;">${streakEmoji}</div>
            <div style="color: #94a3b8; font-size: 12px; margin-top: 4px;">${streakText}</div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #0d1117; padding: 16px 28px; text-align: center; border-top: 1px solid #1e293b;">
        <p style="color: #475569; font-size: 11px; margin: 0;">
          Daily digest from CareIt · You can disable this in Settings
        </p>
      </div>
    </div>
    `;

    try {
        await transporter.sendMail({ from: SMTP_FROM, to, subject, html });
        console.log(`[Daily Digest] Email sent to ${to}`);
    } catch (error) {
        console.error(`[Daily Digest] Failed to send to ${to}:`, error);
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
            emoji: '😴',
            title: 'Your coding pace has dipped',
            color: '#f59e0b',
            bgColor: 'rgba(245,158,11,0.08)',
            borderColor: 'rgba(245,158,11,0.25)',
            message: `You're coding about ${dropPercent}% less than when you first started. This is normal — life gets busy. Just a gentle nudge to check in with yourself.`,
            tip: 'Try a short 25-minute focused session. Starting is often the hardest part.',
        },
        MODERATE: {
            emoji: '⚠️',
            title: 'Noticeable decline in coding activity',
            color: '#f97316',
            bgColor: 'rgba(249,115,22,0.08)',
            borderColor: 'rgba(249,115,22,0.25)',
            message: `Your coding time over the past two weeks is ${dropPercent}% below your baseline. This pattern can compound — a few short sessions can turn this around.`,
            tip: 'Schedule one coding block on your calendar tomorrow. Treat it like a meeting.',
        },
        SEVERE: {
            emoji: '🔴',
            title: "We're worried about you",
            color: '#ef4444',
            bgColor: 'rgba(239,68,68,0.08)',
            borderColor: 'rgba(239,68,68,0.25)',
            message: `Your coding activity has dropped by ${dropPercent}% compared to your early days. This level of decline often signals burnout. It's okay — rest is part of the process.`,
            tip: "Take a proper break if you need it. Burnout is real. Come back when you're ready — your data will be here.",
        },
    };

    const cfg = configs[burnoutLevel];
    const subject = `${cfg.emoji} CareIt: ${cfg.title}`;

    const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #0f172a; border-radius: 20px; overflow: hidden; border: 1px solid #1e293b;">

      <!-- Header -->
      <div style="padding: 32px 28px 20px; text-align: center; border-bottom: 1px solid #1e293b;">
        <div style="font-size: 48px; margin-bottom: 12px;">${cfg.emoji}</div>
        <h1 style="color: #f8fafc; font-size: 20px; font-weight: 700; margin: 0 0 6px;">${cfg.title}</h1>
        <p style="color: #64748b; font-size: 14px; margin: 0;">Hey ${userName}, here's what we noticed</p>
      </div>

      <div style="padding: 28px;">

        <!-- Drop comparison -->
        <div style="background: ${cfg.bgColor}; border: 1px solid ${cfg.borderColor}; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;">
            <div style="text-align: center;">
              <div style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Your baseline</div>
              <div style="color: #34d399; font-size: 26px; font-weight: 800;">${baselineAvgMins < 60 ? baselineAvgMins + 'm' : Math.floor(baselineAvgMins / 60) + 'h'}</div>
              <div style="color: #64748b; font-size: 12px;">avg/day</div>
            </div>
            <div style="color: ${cfg.color}; font-size: 24px;">→</div>
            <div style="text-align: center;">
              <div style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Recent avg</div>
              <div style="color: ${cfg.color}; font-size: 26px; font-weight: 800;">${currentAvgMins < 60 ? currentAvgMins + 'm' : Math.floor(currentAvgMins / 60) + 'h'}</div>
              <div style="color: #64748b; font-size: 12px;">avg/day</div>
            </div>
            <div style="text-align: center;">
              <div style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Change</div>
              <div style="color: ${cfg.color}; font-size: 26px; font-weight: 800;">-${dropPercent}%</div>
            </div>
          </div>
        </div>

        <!-- Message -->
        <p style="color: #cbd5e1; font-size: 15px; line-height: 1.7; margin: 0 0 16px;">${cfg.message}</p>

        <!-- Tip -->
        <div style="background: rgba(255,255,255,0.04); border-left: 3px solid ${cfg.color}; border-radius: 0 8px 8px 0; padding: 14px 16px;">
          <div style="color: ${cfg.color}; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">💡 Suggestion</div>
          <p style="color: #94a3b8; font-size: 14px; margin: 0; line-height: 1.6;">${cfg.tip}</p>
        </div>
      </div>

      <div style="background: #0d1117; padding: 16px 28px; text-align: center; border-top: 1px solid #1e293b;">
        <p style="color: #475569; font-size: 11px; margin: 0;">
          CareIt is tracking your wellbeing, not just your code.
        </p>
      </div>
    </div>
    `;

    try {
        await transporter.sendMail({ from: SMTP_FROM, to, subject, html });
        console.log(`[Burnout Alert] ${burnoutLevel} email sent to ${to}`);
    } catch (error) {
        console.error(`[Burnout Alert] Failed to send to ${to}:`, error);
    }
}



export async function sendRecalibrateEmail(
    to: string,
    userName: string,
    missRate: number,          
    aiSuggestion: string,      
    currentGoalSummary: string, 
) {
    const subject = `🎯 Let's reset your targets, ${userName.split(' ')[0]}`;
    const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;background:#0f172a;border-radius:20px;overflow:hidden;border:1px solid #1e293b;">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#1e293b,#0f172a);padding:32px 28px 20px;text-align:center;border-bottom:1px solid #1e293b;">
        <div style="font-size:44px;margin-bottom:10px;">🎯</div>
        <h1 style="color:#f8fafc;font-size:20px;font-weight:700;margin:0 0 4px;">Time to recalibrate, ${userName.split(' ')[0]}</h1>
        <p style="color:#64748b;font-size:14px;margin:0;">Realistic goals beat impossible ones every time.</p>
      </div>

      <div style="padding:28px;">

        <!-- Miss rate stat -->
        <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:16px;padding:18px 20px;margin-bottom:20px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="flex-shrink:0;text-align:center;">
              <div style="color:#ef4444;font-size:30px;font-weight:800;line-height:1;">${missRate}%</div>
              <div style="color:#94a3b8;font-size:11px;margin-top:2px;">streaks missed</div>
            </div>
            <div style="color:#cbd5e1;font-size:14px;line-height:1.6;">
              Over the past two weeks, you missed your streak target ${missRate}% of the time.
              That's not a failure — it's data. Your current targets might just be set a little too high.
            </div>
          </div>
        </div>

        <!-- Current goals summary -->
        <div style="margin-bottom:16px;">
          <div style="color:#475569;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Current targets</div>
          <div style="color:#94a3b8;font-size:14px;padding:10px 14px;background:rgba(255,255,255,0.04);border-radius:10px;">${currentGoalSummary}</div>
        </div>

        <!-- AI suggestion -->
        <div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);border-left:3px solid #6366f1;border-radius:0 12px 12px 0;padding:16px 18px;margin-bottom:20px;">
          <div style="color:#818cf8;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">✦ AI Suggestion</div>
          <p style="color:#e2e8f0;font-size:15px;line-height:1.7;margin:0;">${aiSuggestion}</p>
        </div>

        <p style="color:#64748b;font-size:13px;text-align:center;margin:0;">
          Head to <strong style="color:#94a3b8;">CareIt → Goals</strong> to update your targets anytime.
        </p>
      </div>

      <div style="background:#0d1117;padding:14px 28px;text-align:center;border-top:1px solid #1e293b;">
        <p style="color:#475569;font-size:11px;margin:0;">CareIt · Helping you build sustainable habits</p>
      </div>
    </div>`;

    try {
        await transporter.sendMail({ from: SMTP_FROM, to, subject, html });
        console.log(`[Streak Coach] Recalibrate email sent to ${to}`);
    } catch (error) {
        console.error(`[Streak Coach] Failed to send recalibrate email to ${to}:`, error);
    }
}



export async function sendLevelUpEmail(
    to: string,
    userName: string,
    hitRate: number,            
    avgCodingMins: number,
    newGoals: { title: string; description: string; targetValue: number; unit: string }[],
) {
    const subject = `🚀 You're crushing it — new challenges unlocked, ${userName.split(' ')[0]}!`;
    const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;background:#0f172a;border-radius:20px;overflow:hidden;border:1px solid #1e293b;">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#0c4a6e,#0f172a);padding:32px 28px 20px;text-align:center;border-bottom:1px solid #1e293b;">
        <div style="font-size:48px;margin-bottom:10px;">🚀</div>
        <h1 style="color:#f8fafc;font-size:20px;font-weight:700;margin:0 0 4px;">Level up, ${userName.split(' ')[0]}!</h1>
        <p style="color:#64748b;font-size:14px;margin:0;">You've been consistently exceeding your targets. Time for bigger challenges.</p>
      </div>

      <div style="padding:28px;">

        <!-- Stats -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;">
          <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:14px;padding:16px;text-align:center;">
            <div style="color:#34d399;font-size:28px;font-weight:800;line-height:1;">${hitRate}%</div>
            <div style="color:#94a3b8;font-size:12px;margin-top:4px;">streak hit rate</div>
          </div>
          <div style="background:rgba(249,115,22,0.08);border:1px solid rgba(249,115,22,0.2);border-radius:14px;padding:16px;text-align:center;">
            <div style="color:#fb923c;font-size:28px;font-weight:800;line-height:1;">${avgCodingMins < 60 ? avgCodingMins + 'm' : Math.floor(avgCodingMins / 60) + 'h' + (avgCodingMins % 60 > 0 ? ' ' + (avgCodingMins % 60) + 'm' : '')}</div>
            <div style="color:#94a3b8;font-size:12px;margin-top:4px;">avg daily coding</div>
          </div>
        </div>

        <!-- New goals -->
        <div style="color:#475569;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">✦ New challenges added to your Goals</div>
        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">
          ${newGoals.map(g => `
          <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(99,102,241,0.2);border-radius:12px;padding:14px 16px;display:flex;align-items:flex-start;gap:12px;">
            <div style="width:8px;height:8px;background:#6366f1;border-radius:50%;margin-top:6px;flex-shrink:0;"></div>
            <div>
              <div style="color:#e2e8f0;font-size:14px;font-weight:600;">${g.title}</div>
              <div style="color:#64748b;font-size:13px;margin-top:2px;">Target: ${g.targetValue} ${g.unit}</div>
              ${g.description ? `<div style="color:#94a3b8;font-size:12px;margin-top:4px;">${g.description}</div>` : ''}
            </div>
          </div>`).join('')}
        </div>

        <p style="color:#64748b;font-size:13px;text-align:center;margin:0;">
          These goals are live in <strong style="color:#94a3b8;">CareIt → Goals</strong>. You've got this. 💪
        </p>
      </div>

      <div style="background:#0d1117;padding:14px 28px;text-align:center;border-top:1px solid #1e293b;">
        <p style="color:#475569;font-size:11px;margin:0;">CareIt · Raising the bar with you</p>
      </div>
    </div>`;

    try {
        await transporter.sendMail({ from: SMTP_FROM, to, subject, html });
        console.log(`[Streak Coach] Level-up email sent to ${to} (${newGoals.length} new goals)`);
    } catch (error) {
        console.error(`[Streak Coach] Failed to send level-up email to ${to}:`, error);
    }
}
