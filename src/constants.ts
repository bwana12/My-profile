export const CONTENT = {
  about: `
    <div class="panel-label">01 / About</div>
    <h2 class="panel-title">Hi, I'm <span>Bwana Mwase</span></h2>
    <div class="panel-body">
      <p>I'm a full-stack developer and creative technologist with 3 years of experience building immersive digital products that live at the intersection of engineering and design.</p>
      <p>Specialized in React, Node.js, Three.js, and cloud-native architectures. I believe great software should not just work — it should feel alive, like a living star system.</p>
      <div style="margin-top:1.5rem;display:flex;gap:1rem;flex-wrap:wrap;">
        <div style="flex:1;min-width:140px;border:1px solid rgba(212, 175, 55, 0.15);padding:1.5rem;text-align:center;background:rgba(255,255,255,0.01);">
          <div style="font-size:2rem;font-weight:900;color:var(--primary)">3</div>
          <div style="font-size:0.6rem;color:var(--text-muted);letter-spacing:0.2em;font-family:'Inter',sans-serif;text-transform:uppercase;">YEARS EXP</div>
        </div>
        <div style="flex:1;min-width:140px;border:1px solid rgba(212, 175, 55, 0.15);padding:1.5rem;text-align:center;background:rgba(255,255,255,0.01);">
          <div style="font-size:2rem;font-weight:900;color:var(--primary)">3</div>
          <div style="font-size:0.6rem;color:var(--text-muted);letter-spacing:0.2em;font-family:'Inter',sans-serif;text-transform:uppercase;">CURRENT PROJECTS</div>
        </div>
        <div style="flex:1;min-width:140px;border:1px solid rgba(212, 175, 55, 0.15);padding:1.5rem;text-align:center;background:rgba(255,255,255,0.01);">
          <div style="font-size:2rem;font-weight:900;color:var(--primary)">12</div>
          <div style="font-size:0.6rem;color:var(--text-muted);letter-spacing:0.2em;font-family:'Inter',sans-serif;text-transform:uppercase;">CLIENTS</div>
        </div>
      </div>
    </div>
  `,
  skills: `
    <div class="panel-label">02 / Skills</div>
    <h2 class="panel-title">Tech <span>Arsenal</span></h2>
    <div class="panel-body">
      <p>Technologies I work with, ordered by expertise:</p>
      <div class="skill-grid" id="skill-grid"></div>
    </div>
  `,
  projects: `
    <div class="panel-label">03 / Projects</div>
    <h2 class="panel-title">Selected <span>Work</span></h2>
    <div class="panel-body" id="projects-body"></div>
  `,
  contact: `
    <div class="panel-label">04 / Contact</div>
    <h2 class="panel-title">Get In <span>Touch</span></h2>
    <div class="panel-body">
      <p>Have a project in mind? Let's build something extraordinary together.</p>
      <form class="contact-form" action="https://formspree.io/f/xeepddle" method="POST">
        <input class="form-field" type="text" name="name" placeholder="Your Name" required>
        <input class="form-field" type="email" name="email" placeholder="Email Address" required>
        <textarea class="form-field" name="message" rows="4" placeholder="Your Message" required></textarea>
        <button class="form-submit" type="submit">Send Message →</button>
      </form>
      <div class="social-row">
        <a href="https://github.com/bwana12" target="_blank" class="social-btn">⌥ GitHub</a>
        <a href="https://linkedin.com" target="_blank" class="social-btn">⌘ LinkedIn</a>
        <a href="https://facebook.com" target="_blank" class="social-btn">✦ Facebook</a>
      </div>
    </div>
  `
};

export const SKILLS = [
  { name:'React', pct:95 },{ name:'Next.js', pct:90 },{ name:'TypeScript', pct:88 },
  { name:'Node.js', pct:85 },{ name:'Three.js', pct:80 },{ name:'WebGL', pct:72 },
  { name:'PostgreSQL', pct:82 },{ name:'Docker', pct:78 },{ name:'AWS', pct:75 },
  { name:'Python', pct:70 },{ name:'GSAP', pct:88 },{ name:'GraphQL', pct:76 },
];

export const PROJECTS = [
  { 
    title:'WhisperLink', 
    desc:'Anonymous messaging platform. Users send and receive anonymous messages via a personal link. Built with Next.js, Prisma, PostgreSQL.', 
    tags:['Next.js','Prisma','PostgreSQL'], 
    link:'https://whisper-link-kohl.vercel.app/u/bwana' 
  },
  { 
    title:'DevSpace', 
    desc:'Cinematic 3D developer portfolio built with Three.js, GSAP, React, and TypeScript.', 
    tags:['Three.js','GSAP','React','TypeScript'], 
    link:'#' 
  },
];
