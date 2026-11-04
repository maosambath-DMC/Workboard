# Workboard 🦊

A collaborative creative workspace web application prototype built for creatives, students, and teams to brainstorm, collect visual references, dot-vote on ideas, and align on a shared creative direction.

---

## 👥 Team
- **Team**: DMC Team
- **Project Lead**: Mao Sambath
- **Class / Persona Collaborators**: Simon (Product Lead), David (Tech Lead), Andrea (Design Lead), Maya (Visual Researcher)

---

## ✨ What It Does

Workboard combines an open visual whiteboard with structured creative collaboration workflows:

1. **Project Selection Hub**: A dedicated landing page showcasing all team projects with live sneak-peek canvases and sprint highlights.
2. **Interactive Visual Canvas**: Smooth infinite panning and zooming with dotted, lined, and clean grid styles.
3. **Drag & Drop Toolbar**: Drag sticky notes, standalone text, visual picture references, voting polls, miniboards, and frame containers directly onto the canvas.
4. **10 Tactile Sticky Note Shapes**: Square, Soft Rounded, Circle Token, Folded Corner, Washi Tape, Luggage Tag, Cloud Idea, Badge Pill, Postage Stamp, and Roman Arch.
5. **Universal Idea Branching**: Branch any idea, comment, picture, poll, or miniboard into linked variations with smooth connector lines.
6. **Interactive Voting Polls & Dot-Voting**: Timeboxed dot-voting rounds with animated progress bars, live voter avatars, and confetti celebrations.
7. **Miniboard Sub-Whiteboard Portals**: Drop miniature whiteboard portals that allow teammates to teleport into nested sub-canvases with a single click.
8. **Silent Ideation Tray**: Private drafting tray where teammates draft references and thoughts without bias before revealing them together.
9. **Decision Matrix & Briefs**: Lock winning concepts into Core Direction, Secondary, and Backlog roadmaps.

---

## 🛠️ Built With
- **React 19** + **TypeScript**
- **Vite** (Static build)
- **Tailwind CSS v4**
- **Lucide Icons**
- **Canvas-Confetti**
- **BroadcastChannel API** (Cross-tab live peer sync)

---

## 🚀 Getting Started Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the local development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Production Build
```bash
npm run build
```
Generates production-ready static assets in the `dist/` directory for Firebase Hosting.
