import React, { forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

// Theme colors
const themes = {
  dark: {
    background: '#0A0A0F',
    cardBg: 'rgba(255,255,255,0.06)',
    cardInsetHighlight: 'inset 0 1px 0 rgba(255,255,255,0.08)',
    cardShadow: '0 8px 32px rgba(0,0,0,0.3)',
    streakGlow: '0 0 0 1px rgba(251,191,36,0.2)',
    text: 'rgba(255,255,255,0.95)',
    textSecondary: 'rgba(255,255,255,0.5)',
    primary: '#A78BFA',
    accent: '#FBBF24',
    heroGlow: '0 0 60px rgba(167,139,250,0.15)',
    divider: 'rgba(255,255,255,0.15)',
    runnerUpBg: 'rgba(255,255,255,0.03)',
    subtleBg: `radial-gradient(ellipse 80% 60% at 50% 40%, rgba(139,92,246,0.04) 0%, transparent 70%)`,
  },
  light: {
    background: '#F8F9FA',
    cardBg: '#FFFFFF',
    cardInsetHighlight: 'none',
    cardShadow: '0 4px 20px rgba(0,0,0,0.04)',
    streakGlow: '0 0 0 1px rgba(245,158,11,0.2)',
    text: 'rgba(0,0,0,0.9)',
    textSecondary: 'rgba(0,0,0,0.5)',
    primary: '#7C3AED',
    accent: '#F59E0B',
    heroGlow: '0 0 60px rgba(124,58,237,0.1)',
    divider: 'rgba(0,0,0,0.1)',
    runnerUpBg: 'rgba(0,0,0,0.03)',
    subtleBg: `radial-gradient(ellipse 80% 60% at 50% 40%, rgba(124,58,237,0.03) 0%, transparent 70%)`,
  },
};

// Contextual motivational messages based on workout count
function getContextMessage(count) {
  if (count >= 25) return 'An unstoppable month';
  if (count >= 20) return 'Your strongest month yet';
  if (count >= 15) return 'Consistency at its finest';
  if (count >= 10) return 'Solid work this month';
  if (count >= 5) return 'Building momentum';
  return 'Every rep counts';
}

// Generate the HTML template with data interpolation
const generateRecapHTML = (data, theme = 'dark') => {
  const t = themes[theme] || themes.dark;
  const contextMessage = getContextMessage(data.totalWorkouts || 0);

  // Build runner-ups from topExercises (index 1 and 2)
  const runnerUps = (data.topExercises || []).slice(1, 3);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1080, initial-scale=0.3333, maximum-scale=0.3333">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      width: 1080px;
      height: 1920px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: ${t.background};
      color: ${t.text};
      overflow: hidden;
      position: relative;
    }

    /* Subtle radial gradient background */
    .bg-gradient {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: ${t.subtleBg};
    }

    /* Noise texture overlay */
    .noise {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      opacity: 0.03;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
      background-repeat: repeat;
      background-size: 256px 256px;
    }

    .container {
      position: relative;
      z-index: 1;
      padding: 72px 64px;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    /* Month badge — top-left */
    .month-badge {
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      opacity: 0.4;
      margin-bottom: 0;
      text-align: left;
    }

    /* Hero section */
    .hero-section {
      text-align: center;
      margin-top: 80px;
      margin-bottom: 60px;
    }

    .hero-number {
      font-size: 148px;
      font-weight: 800;
      line-height: 1;
      letter-spacing: -2px;
      opacity: 0.95;
      text-shadow: ${t.heroGlow};
    }

    .hero-label {
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 1px;
      opacity: 0.5;
      margin-top: 16px;
    }

    .hero-context {
      font-size: 17px;
      font-weight: 400;
      opacity: 0.7;
      margin-top: 20px;
    }

    /* Stats — asymmetric 3-card layout */
    .stats-row {
      display: flex;
      gap: 24px;
      margin-bottom: 24px;
    }

    .stat-card {
      flex: 1;
      background: ${t.cardBg};
      border-radius: 20px;
      padding: 24px;
      box-shadow: ${t.cardShadow}, ${t.cardInsetHighlight};
    }

    .stat-card.stagger-up {
      transform: translateY(-10px);
    }

    .stat-card.stagger-down {
      transform: translateY(10px);
    }

    .stat-card.streak {
      box-shadow: ${t.cardShadow}, ${t.cardInsetHighlight}, ${t.streakGlow};
    }

    .stat-card.full-width {
      width: 100%;
    }

    .stat-value {
      font-size: 52px;
      font-weight: 700;
      line-height: 1;
      letter-spacing: -1px;
    }

    .stat-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      opacity: 0.5;
      margin-top: 10px;
    }

    /* Signature move section */
    .signature-section {
      margin-top: 56px;
      text-align: center;
    }

    .signature-divider {
      width: 60%;
      height: 1px;
      background: ${t.divider};
      margin: 0 auto 40px auto;
    }

    .signature-title {
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.6;
      margin-bottom: 24px;
    }

    .signature-main {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
    }

    .signature-trophy {
      font-size: 36px;
      filter: drop-shadow(0 4px 8px rgba(251,191,36,0.3));
    }

    .signature-name {
      font-size: 22px;
      font-weight: 600;
      letter-spacing: 0;
    }

    .signature-sets {
      font-size: 14px;
      opacity: 0.6;
      margin-top: 8px;
    }

    /* Runner-ups */
    .runner-ups {
      background: ${t.runnerUpBg};
      border-radius: 16px;
      padding: 20px 28px;
      margin-top: 28px;
      display: inline-block;
    }

    .runner-ups-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      opacity: 0.4;
      margin-bottom: 12px;
    }

    .runner-up-item {
      font-size: 15px;
      opacity: 0.8;
      line-height: 1.8;
    }

    .runner-up-rank {
      opacity: 0.5;
      font-weight: 600;
    }

    /* Footer */
    .footer {
      margin-top: 72px;
      text-align: center;
      margin-top: auto;
      padding-top: 72px;
    }

    .footer-brand {
      font-size: 18px;
      font-weight: 500;
      letter-spacing: 0.3px;
    }

    .footer-tagline {
      font-size: 11px;
      font-weight: 400;
      letter-spacing: 1px;
      opacity: 0.5;
      margin-top: 8px;
    }
  </style>
</head>
<body>
  <div class="bg-gradient"></div>
  <div class="noise"></div>

  <div class="container">
    <!-- Month badge top-left -->
    <div class="month-badge">${data.month || 'January 2026'}</div>

    <!-- Hero -->
    <div class="hero-section">
      <div class="hero-number">${data.totalWorkouts || 0}</div>
      <div class="hero-label">Workouts Completed</div>
      <div class="hero-context">${contextMessage}</div>
    </div>

    <!-- Stats — 2 col top + 1 full width bottom -->
    <div class="stats-row">
      <div class="stat-card streak stagger-up">
        <div class="stat-value" style="color: ${t.accent};">${data.currentStreak || 0}</div>
        <div class="stat-label">Day Streak</div>
      </div>
      <div class="stat-card stagger-down">
        <div class="stat-value">${formatNumber(data.totalVolume)}</div>
        <div class="stat-label">lbs Lifted</div>
      </div>
    </div>
    <div class="stats-row">
      <div class="stat-card full-width">
        <div class="stat-value" style="color: ${t.primary};">${formatDuration(data.totalDuration)}</div>
        <div class="stat-label">Total Time Trained</div>
      </div>
    </div>

    <!-- Signature Move -->
    ${data.topExercise ? `
    <div class="signature-section">
      <div class="signature-divider"></div>
      <div class="signature-title">Your Signature Move</div>
      <div class="signature-main">
        <span class="signature-trophy">\u{1F3C6}</span>
        <span class="signature-name">${data.topExercise.name}</span>
      </div>
      ${data.topExercise.sets ? `<div class="signature-sets">${data.topExercise.sets} sets</div>` : ''}

      ${runnerUps.length > 0 ? `
      <div class="runner-ups">
        <div class="runner-ups-label">Also crushed</div>
        ${runnerUps.map((ex, i) => `
          <div class="runner-up-item">
            <span class="runner-up-rank">#${i + 2}</span> ${ex.name} &bull; ${ex.sets} sets
          </div>
        `).join('')}
      </div>
      ` : ''}
    </div>
    ` : ''}

    <!-- Footer -->
    <div class="footer">
      <div class="footer-brand">gymvy</div>
      <div class="footer-tagline">Track. Share. Grow.</div>
    </div>
  </div>
</body>
</html>
`;
};

// Helper functions for formatting
function formatNumber(num) {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toLocaleString();
}

function formatDuration(minutes) {
  if (!minutes) return '0h';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * MonthlyRecapTemplate
 * @param {Object} data - The recap data to display
 * @param {string} theme - 'dark' or 'light'
 * @param {Object} style - Additional styles
 */
export const MonthlyRecapTemplate = forwardRef(({ data, theme = 'dark', style }, ref) => {
  const html = generateRecapHTML(data, theme);

  return (
    <View
      ref={ref}
      style={[styles.container, style]}
      collapsable={false}
    >
      <WebView
        source={{ html }}
        style={styles.webview}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        originWhitelist={['*']}
      />
    </View>
  );
});

// Export the HTML generator for direct use (e.g., server-side rendering)
export { generateRecapHTML };

const styles = StyleSheet.create({
  container: {
    width: 360,
    height: 640,
    overflow: 'hidden',
    borderRadius: 16,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default MonthlyRecapTemplate;
