<template>
  <main class="guide-page min-h-screen" style="background: var(--bg); color: var(--fg);">
    <div class="guide-shell">
      <section class="guide-hero">
        <p class="guide-kicker">Guide</p>
        <div class="guide-hero-grid">
          <div class="guide-hero-copy">
            <h1>How To Use Mizomade</h1>
            <p class="guide-lead">
              Mizomade hi Mizo tawng leh culture awmze neia thurawn, post, comment leh save tihte a tih awlsam theih nan a siam a ni.
              Heta tarlan dan hian account siam, post tih, comment leh bookmark siam theih dan a sawifiah.
            </p>
            <div class="guide-pills" aria-label="Quick summary">
              <span>Read posts</span>
              <span>Create account</span>
              <span>Comment safely</span>
              <span>Save stories</span>
            </div>
          </div>

          <aside class="guide-panel">
            <p class="guide-panel-label">Quick start</p>
            <ul>
              <li>Account neih loh pawhin thu chhiar theih.</li>
              <li>Login nei hnuah create, comment, save tih theih.</li>
              <li>Profile details hi duh dan in update theih a ni.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section class="guide-grid">
        <article class="guide-card guide-card-wide">
          <p class="guide-card-number">01</p>
          <h2>Account Creation</h2>
          <p>
            Mizomade.com a thu awm te chhiar tur hian account neih kher a ngai lo a. Mahse post duh leh comment duh tan account siam a remchang.
          </p>
          <p>
            Hemi link ah lut la: https://mizomade.com/accounts/registration. Username, phone number leh password fill hnuah OTP a phone ah a lo thleng ang.
            OTP verify zawh hnuah account a siam a ni. Chumi hnuah <span>Profile Details</span> siam that leh theih a ni.
          </p>
        </article>

        <article class="guide-card">
          <p class="guide-card-number">02</p>
          <h2>Thu Post Dan</h2>
          <p>
            Account a login hnuah top bar a <span>Create</span> button hmu ang che. Hetah hian thu ziak tur editor a lo lang ang a, thu, thlalak leh video te pawh dah theih a ni.
          </p>
          <p>
            Zawh hnuah <span>Submit</span> click la. Page thar ah Title, category, post thlalak leh tags chhu lut ang a, chumi hnuah thu chu khawvel chhiar theih turin a publish dawn a ni.
          </p>
        </article>

        <article class="guide-card">
          <p class="guide-card-number">03</p>
          <h2>Edit, Delete, Unpublish</h2>
          <p>
            Thu post neih tawh chu post chhungah lut la, screen chunglam a <span>Delete</span>, <span>Edit</span> leh <span>Unpublish</span> button te hmu ang.
          </p>
          <p>
            Delete chuan post a paih vek ang. Edit chuan thu siam that theih a ni. Unpublish chuan mi chhiar theih loh a dah hrih a, a hman leh theih laia hidden a awm thin.
          </p>
        </article>

        <article class="guide-card">
          <p class="guide-card-number">04</p>
          <h2>Midang Thuziah Ah Comment</h2>
          <p>
            Midang post chungchangah ngaihdan sawi duh chuan post mawnglam a <span>Add comment</span> tih a lo lang ang. Heta comment te chu zah tak leh thiam takin dah tur a ni.
          </p>
          <p>
            <span>Add comment</span> a lo lang loh chuan logged in lo tihna a ni tlangpui. Comment leh theih nan login a ngai a, user account neih lo pawhin login hnuah comment theih a ni.
          </p>
        </article>

        <article class="guide-card guide-card-wide">
          <p class="guide-card-number">05</p>
          <h2>Bookmark Leh Saved</h2>
          <p>
            Post Title hnuai a <span>bookmark</span> button chu save tihna a ni. He button click chuan nakina chhiar leh theih turin post chu account ah a saved thin.
          </p>
          <p>
            Saved post en let duh chuan account a logged in in <span>Saved</span> section ah lut la. Heta kan save zawng zawng chu a awm vek ang.
          </p>
        </article>
      </section>

      <section class="guide-message">
        <h2>Thuchah</h2>
        <p>
          Mizomade hi Mizo te tan leh mi dang tan pawh tangkai theih tur a duan a ni. Thil dik lo leh thalo lam post loh hram kan tum a,
          midang zahsak tawn, pawi sawi lo leh thiam takin post leh comment siam hi kan tum hram hram dawn a ni.
        </p>
        <p>
          Mahni thiamna te hi kan tan pawh a hlu. Midang tan a lan chhuah theih hian kan talent a pun belh thin a,
          kan hnam leh kan ram tan pawhin tangkai takin a chhuah theih a ni.
        </p>
        <div class="mt-8">
          <NuxtLink to="/blogs" class="guide-button">
            Browse Posts
          </NuxtLink>
        </div>
      </section>
    </div>
  </main>
    <AppFooter/>
  <ButtomFooter/>
</template>

<style scoped>
.guide-page {
  position: relative;
  overflow: hidden;
}

.guide-page::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at top left, rgba(0, 0, 0, 0.06), transparent 32%),
    radial-gradient(circle at bottom right, rgba(0, 0, 0, 0.04), transparent 30%);
  opacity: 0.7;
}

:global(html.dark) .guide-page::before,
:global(body.dark) .guide-page::before {
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.08), transparent 32%),
    radial-gradient(circle at bottom right, rgba(255, 255, 255, 0.04), transparent 30%);
}

.guide-shell {
  position: relative;
  max-width: 1120px;
  margin: 0 auto;
  padding: 5rem 1.5rem 4rem;
}

.guide-hero {
  border: 1px solid var(--border);
  background: color-mix(in srgb, var(--bg) 92%, var(--fg) 8%);
  border-radius: 28px;
  padding: 1.5rem;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.06);
}

.guide-kicker {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--fg-soft);
  margin-bottom: 1rem;
}

.guide-hero-grid {
  display: grid;
  gap: 1.25rem;
}

.guide-hero-copy h1 {
  font-size: clamp(2.5rem, 7vw, 5.5rem);
  line-height: 0.95;
  font-weight: 900;
  letter-spacing: -0.05em;
  text-transform: uppercase;
  margin: 0 0 1rem;
  max-width: 12ch;
}

.guide-lead {
  max-width: 62ch;
  font-size: 1rem;
  line-height: 1.8;
  color: var(--fg-muted);
  margin: 0;
}

.guide-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.guide-pills span {
  padding: 0.55rem 0.9rem;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--card-bg);
  color: var(--fg);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.guide-panel {
  border-radius: 22px;
  border: 1px solid var(--border);
  background: var(--card-bg);
  padding: 1.25rem;
}

.guide-panel-label {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--fg-soft);
  margin-bottom: 0.9rem;
}

.guide-panel ul {
  margin: 0;
  padding-left: 1.1rem;
  color: var(--fg-muted);
  display: grid;
  gap: 0.75rem;
  line-height: 1.7;
}

.guide-grid {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.guide-card,
.guide-message {
  border: 1px solid var(--border);
  background: var(--card-bg);
  border-radius: 24px;
  padding: 1.25rem;
}

.guide-card {
  display: grid;
  gap: 0.8rem;
}

.guide-card-number {
  display: inline-flex;
  width: fit-content;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  background: var(--bg);
  border: 1px solid var(--border);
  color: var(--fg-soft);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.18em;
}

.guide-card h2,
.guide-message h2 {
  margin: 0;
  font-size: 1.3rem;
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.guide-card p,
.guide-message p {
  margin: 0;
  color: var(--fg-muted);
  line-height: 1.8;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.guide-card span,
.guide-message span {
  font-weight: 800;
  color: var(--fg);
}

.guide-card a,
.guide-message a,
.guide-card li,
.guide-message li {
  overflow-wrap: anywhere;
  word-break: break-word;
}

.guide-message {
  margin-top: 1rem;
}

.guide-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.9rem 1.2rem;
  border-radius: 999px;
  border: 1px solid var(--fg);
  background: var(--fg);
  color: var(--bg);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.guide-button:hover {
  transform: translateY(-1px);
  opacity: 0.92;
}

@media (max-width: 767px) {
  .guide-shell {
    padding: 3rem 1rem 2.5rem;
  }

  .guide-hero {
    padding: 1.1rem;
    border-radius: 22px;
  }

  .guide-kicker {
    margin-bottom: 0.75rem;
  }

  .guide-hero-copy h1 {
    max-width: none;
    font-size: clamp(2rem, 10vw, 3rem);
    line-height: 1;
    margin-bottom: 0.85rem;
  }

  .guide-lead {
    font-size: 0.95rem;
    line-height: 1.75;
  }

  .guide-pills {
    gap: 0.5rem;
  }

  .guide-pills span {
    width: 100%;
    text-align: center;
    padding: 0.8rem 0.9rem;
    font-size: 0.72rem;
    letter-spacing: 0.1em;
  }

  .guide-panel {
    padding: 1rem;
    border-radius: 18px;
  }

  .guide-panel ul {
    padding-left: 1rem;
    gap: 0.6rem;
    font-size: 0.95rem;
  }

  .guide-grid {
    gap: 0.85rem;
    margin-top: 0.85rem;
  }

  .guide-card,
  .guide-message {
    padding: 1rem;
    border-radius: 18px;
  }

  .guide-card h2,
  .guide-message h2 {
    font-size: 1.1rem;
  }

  .guide-card p,
  .guide-message p,
  .guide-panel li {
    font-size: 0.95rem;
    line-height: 1.75;
  }

  .guide-card a,
  .guide-message a {
    display: inline-block;
    max-width: 100%;
  }

  .guide-button {
    width: 100%;
    max-width: 100%;
    padding: 0.95rem 1rem;
  }
}

@media (min-width: 768px) {
  .guide-shell {
    padding-top: 6rem;
    padding-bottom: 5rem;
  }

  .guide-hero {
    padding: 2rem;
  }

  .guide-hero-grid {
    grid-template-columns: minmax(0, 1.5fr) minmax(280px, 0.85fr);
    align-items: start;
  }

  .guide-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    margin-top: 1.25rem;
  }

  .guide-card-wide {
    grid-column: span 2;
  }

  .guide-card,
  .guide-message {
    padding: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .guide-shell {
    padding-left: 2rem;
    padding-right: 2rem;
  }

  .guide-hero {
    padding: 2.25rem;
  }

  .guide-card h2,
  .guide-message h2 {
    font-size: 1.45rem;
  }
}
</style>
