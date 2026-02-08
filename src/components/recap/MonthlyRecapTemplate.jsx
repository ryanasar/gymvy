import React, { forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

// Theme colors
const themes = {
  dark: {
    background: '#0A0A0F',
    cardBg: 'rgba(18, 18, 26, 0.8)',
    cardBgHighlight: 'linear-gradient(135deg, rgba(129, 140, 248, 0.2) 0%, rgba(52, 211, 153, 0.1) 100%)',
    text: '#F8FAFC',
    textSecondary: '#B4C0CE',
    textMuted: '#64748B',
    primary: '#818CF8',
    primaryLight: '#A5B4FC',
    accent: '#34D399',
    warning: '#FBBF24',
    border: 'rgba(129, 140, 248, 0.2)',
    borderHighlight: 'rgba(129, 140, 248, 0.4)',
    gradientBg: `
      radial-gradient(ellipse 80% 50% at 20% 10%, rgba(129, 140, 248, 0.25) 0%, transparent 50%),
      radial-gradient(ellipse 60% 40% at 80% 90%, rgba(52, 211, 153, 0.2) 0%, transparent 50%),
      radial-gradient(ellipse 50% 30% at 50% 50%, rgba(129, 140, 248, 0.1) 0%, transparent 50%)
    `,
    heroGradient: 'linear-gradient(180deg, #F8FAFC 0%, #818CF8 100%)',
    decorOpacity: 0.15,
  },
  light: {
    background: '#F1F5F9',
    cardBg: 'rgba(255, 255, 255, 0.9)',
    cardBgHighlight: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
    text: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    primary: '#6366F1',
    primaryLight: '#818CF8',
    accent: '#10B981',
    warning: '#F59E0B',
    border: 'rgba(99, 102, 241, 0.2)',
    borderHighlight: 'rgba(99, 102, 241, 0.4)',
    gradientBg: `
      radial-gradient(ellipse 80% 50% at 20% 10%, rgba(99, 102, 241, 0.2) 0%, transparent 50%),
      radial-gradient(ellipse 60% 40% at 80% 90%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse 50% 30% at 50% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 50%)
    `,
    heroGradient: 'linear-gradient(180deg, #0F172A 0%, #6366F1 100%)',
    decorOpacity: 0.1,
  },
};

// Generate the HTML template with data interpolation
const generateRecapHTML = (data, theme = 'dark') => {
  const t = themes[theme] || themes.dark;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1080, height=1920, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

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

    /* Animated gradient background */
    .bg-gradient {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: ${t.gradientBg};
    }

    .container {
      position: relative;
      z-index: 1;
      padding: 80px 60px;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    /* Header */
    .header {
      text-align: center;
      margin-bottom: 40px;
    }

    .month-label {
      font-size: 28px;
      font-weight: 500;
      color: ${t.textSecondary};
      text-transform: uppercase;
      letter-spacing: 6px;
      margin-bottom: 16px;
    }

    .recap-title {
      font-size: 72px;
      font-weight: 900;
      background: linear-gradient(135deg, ${t.primary} 0%, ${t.primaryLight} 50%, ${t.accent} 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -2px;
    }

    /* Hero stat */
    .hero-section {
      text-align: center;
      margin: 60px 0;
    }

    .hero-number {
      font-size: 200px;
      font-weight: 900;
      line-height: 0.9;
      background: ${t.heroGradient};
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-label {
      font-size: 36px;
      font-weight: 600;
      color: ${t.textSecondary};
      margin-top: 8px;
    }

    .hero-subtitle {
      font-size: 24px;
      color: ${t.textMuted};
      margin-top: 12px;
    }

    /* Stats grid */
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin: 40px 0;
    }

    .stat-card {
      background: ${t.cardBg};
      border: 1px solid ${t.border};
      border-radius: 24px;
      padding: 32px;
      text-align: center;
    }

    .stat-card.highlight {
      background: ${t.cardBgHighlight};
      border-color: ${t.borderHighlight};
    }

    .stat-value {
      font-size: 56px;
      font-weight: 800;
      color: ${t.text};
      line-height: 1;
    }

    .stat-value.accent {
      color: ${t.accent};
    }

    .stat-value.primary {
      color: ${t.primary};
    }

    .stat-value.warning {
      color: ${t.warning};
    }

    .stat-label {
      font-size: 20px;
      color: ${t.textSecondary};
      margin-top: 8px;
      font-weight: 500;
    }

    .stat-unit {
      font-size: 28px;
      font-weight: 600;
      color: ${t.textMuted};
    }

    /* Highlight section */
    .highlight-section {
      background: ${theme === 'dark'
        ? 'linear-gradient(135deg, rgba(129, 140, 248, 0.15) 0%, rgba(18, 18, 26, 0.9) 100%)'
        : 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(255, 255, 255, 0.95) 100%)'
      };
      border: 1px solid ${t.borderHighlight};
      border-radius: 32px;
      padding: 40px;
      margin: 40px 0;
      text-align: center;
    }

    .highlight-emoji {
      font-size: 64px;
      margin-bottom: 16px;
    }

    .highlight-title {
      font-size: 24px;
      color: ${t.textSecondary};
      font-weight: 500;
      margin-bottom: 8px;
    }

    .highlight-value {
      font-size: 44px;
      font-weight: 800;
      color: ${t.text};
    }

    .highlight-value span {
      color: ${t.primary};
    }

    /* Top exercises */
    .top-exercises {
      margin: 40px 0;
    }

    .section-title {
      font-size: 28px;
      font-weight: 700;
      color: ${t.text};
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .section-title::before {
      content: '';
      width: 4px;
      height: 28px;
      background: linear-gradient(180deg, ${t.primary} 0%, ${t.accent} 100%);
      border-radius: 2px;
    }

    .exercise-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .exercise-item {
      display: flex;
      align-items: center;
      gap: 20px;
      background: ${theme === 'dark' ? 'rgba(18, 18, 26, 0.6)' : 'rgba(255, 255, 255, 0.8)'};
      border-radius: 16px;
      padding: 20px 24px;
    }

    .exercise-rank {
      font-size: 32px;
      font-weight: 800;
      color: ${t.primary};
      width: 50px;
    }

    .exercise-name {
      flex: 1;
      font-size: 26px;
      font-weight: 600;
      color: ${t.text};
    }

    .exercise-stat {
      font-size: 22px;
      color: ${t.accent};
      font-weight: 600;
    }

    /* Footer */
    .footer {
      margin-top: auto;
      text-align: center;
      padding-top: 40px;
    }

    .branding {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }

    .logo-text {
      font-size: 36px;
      font-weight: 800;
      background: linear-gradient(135deg, ${t.primary} 0%, ${t.accent} 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .tagline {
      font-size: 20px;
      color: ${t.textMuted};
      margin-top: 8px;
    }

    /* Decorative elements */
    .decoration {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
    }

    .decoration-1 {
      width: 400px;
      height: 400px;
      background: ${t.primary};
      top: -100px;
      right: -100px;
      opacity: ${t.decorOpacity};
    }

    .decoration-2 {
      width: 300px;
      height: 300px;
      background: ${t.accent};
      bottom: 200px;
      left: -100px;
      opacity: ${t.decorOpacity * 0.7};
    }
  </style>
</head>
<body>
  <div class="bg-gradient"></div>
  <div class="decoration decoration-1"></div>
  <div class="decoration decoration-2"></div>

  <div class="container">
    <div class="header">
      <div class="month-label">${data.month || 'January 2026'}</div>
      <div class="recap-title">Your Recap</div>
    </div>

    <div class="hero-section">
      <div class="hero-number">${data.totalWorkouts || 0}</div>
      <div class="hero-label">workouts completed</div>
      <div class="hero-subtitle">You showed up ${data.totalWorkouts || 0} times this month</div>
    </div>

    <div class="stats-grid">
      <div class="stat-card highlight">
        <div class="stat-value primary">${data.currentStreak || 0}</div>
        <div class="stat-label">Day Streak</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${formatNumber(data.totalVolume)}</div>
        <div class="stat-label">lbs lifted</div>
      </div>
      <div class="stat-card">
        <div class="stat-value accent">${formatDuration(data.totalDuration)}</div>
        <div class="stat-label">total time</div>
      </div>
      <div class="stat-card">
        <div class="stat-value warning">${data.totalSets || 0}</div>
        <div class="stat-label">sets crushed</div>
      </div>
    </div>

    ${data.topExercise ? `
    <div class="highlight-section">
      <div class="highlight-emoji">\u{1F3C6}</div>
      <div class="highlight-title">Your #1 Exercise</div>
      <div class="highlight-value">${data.topExercise.name}</div>
    </div>
    ` : ''}

    ${data.topExercises && data.topExercises.length > 0 ? `
    <div class="top-exercises">
      <div class="section-title">Top Exercises</div>
      <div class="exercise-list">
        ${data.topExercises.slice(0, 3).map((ex, i) => `
          <div class="exercise-item">
            <div class="exercise-rank">${i + 1}</div>
            <div class="exercise-name">${ex.name}</div>
            <div class="exercise-stat">${ex.sets} sets</div>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    <div class="footer">
      <div class="branding">
        <span class="logo-text">gymvy</span>
      </div>
      <div class="tagline">Track. Share. Grow.</div>
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
