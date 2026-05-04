<template>
  <div :class="$style.page">
    <section :class="$style.wrapper">
      <div :class="$style.pageHeader">
        <p :class="$style.pageEyebrow">MizoMade · Account</p>
        <h1 :class="$style.pageTitle">Settings</h1>
        <p :class="$style.pageSubtitle">
          Choose a setting to open its detail page.
        </p>
      </div>

      <main :class="$style.main">
        <NuxtLink to="/settings/password-change" :class="$style.sectionBtn">
          <div :class="$style.sectionBtnContent">
            <h2 :class="$style.sectionTitle">Change Password</h2>
            <p :class="$style.sectionText">Open the password change detail page.</p>
          </div>
          <span :class="$style.sectionArrow">→</span>
        </NuxtLink>

        <NuxtLink to="/settings/change-phone-number" :class="$style.sectionBtn">
          <div :class="$style.sectionBtnContent">
            <h2 :class="$style.sectionTitle">Change Phone Number</h2>
            <p :class="$style.sectionText">Open the phone number change detail page.</p>
          </div>
          <span :class="$style.sectionArrow">→</span>
        </NuxtLink>

        <NuxtLink to="/settings/disable-account" :class="$style.sectionBtn">
          <div :class="$style.sectionBtnContent">
            <h2 :class="$style.sectionTitle">Disable Account</h2>
            <p :class="$style.sectionText">Open the account status detail page.</p>
          </div>
          <span :class="$style.sectionArrow">→</span>
        </NuxtLink>
      </main>
    </section>

    <section :class="$style.footerSection">
      <AppFooter />
      <ButtomFooter />
    </section>
  </div>
</template>

<style module>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

:global(:root) {
  --dash-page-bg: #ffffff;
  --dash-surface: #ffffff;
  --dash-border: rgba(24, 24, 27, 0.12);
  --dash-text: #18181b;
  --dash-text-muted: #71717a;
  --dash-accent: #18181b;
  --dash-hover-bg: rgba(24, 24, 27, 0.06);
  --dash-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
}

:global(html.dark) {
  --dash-page-bg: #000000;
  --dash-surface: #19191d;
  --dash-border: rgba(255, 255, 255, 0.08);
  --dash-text: #fafafa;
  --dash-text-muted: #a1a1aa;
  --dash-accent: #f4f4f5;
  --dash-hover-bg: rgba(255, 255, 255, 0.08);
  --dash-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

.page {
  font-family: 'Sora', sans-serif;
  background: var(--dash-page-bg);
  min-height: 100vh;
  color: var(--dash-text);
}

.wrapper {
  max-width: 980px;
  margin: 0 auto;
  padding: 84px 16px 40px;
}

.pageHeader { margin-bottom: 20px; }

.pageEyebrow {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--dash-text-muted);
  font-family: 'DM Mono', monospace;
}

.pageTitle {
  margin-top: 6px;
  font-size: clamp(2rem, 4vw, 2.7rem);
  font-weight: 800;
  letter-spacing: -0.03em;
}

.pageSubtitle {
  margin-top: 8px;
  color: var(--dash-text-muted);
  font-size: 0.9rem;
}

.main {
  display: grid;
  gap: 14px;
}

.sectionBtn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.4rem 1.6rem;
  border: 1px solid var(--dash-border);
  border-radius: 14px;
  background: var(--dash-surface);
  box-shadow: var(--dash-shadow);
  cursor: pointer;
  color: var(--dash-text);
  text-align: left;
  transition: transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}

.sectionBtn:hover {
  transform: translateY(-1px);
  background: color-mix(in srgb, var(--dash-surface) 92%, var(--dash-hover-bg));
}

.sectionBtnContent {
  display: grid;
  gap: 0.35rem;
}

.sectionTitle {
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.sectionText {
  color: var(--dash-text-muted);
  font-size: 0.9rem;
  line-height: 1.6;
}

.sectionArrow {
  font-size: 1.4rem;
  color: var(--dash-text-muted);
  flex-shrink: 0;
}

.footerSection {
  margin-top: 20px;
}

@media (max-width: 640px) {
  .wrapper {
    padding-top: 70px;
  }

  .sectionBtn {
    padding: 1.1rem 1rem;
  }
}
</style>
