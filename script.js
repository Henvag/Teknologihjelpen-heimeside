// Hero figure: five tangled cables straighten out and plug into the right ports.
// Plays once when the figure comes into view; the button tangles them again.
(function () {
  const svg = document.getElementById("cables");
  if (!svg) return;
  const btn = document.getElementById("tangle-btn");
  const status = document.getElementById("tangle-status");
  const NS = "http://www.w3.org/2000/svg";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const W = 640, H = 420, LEFT = 46, RIGHT = 450, K = 8;
  const cables = [
    { label: "Webapper", color: "#f4ede4" },
    { label: "Databaser", color: "#e8a3ae" },
    { label: "Innlogging", color: "#e2b65a" },
    { label: "Skydrift", color: "#9fc6ae" },
    { label: "IT-hjelp", color: "#a9c4de" },
  ];
  const rowY = (i) => 58 + i * 76;

  // Seeded random so a tangle looks the same on every load, new seed on each replay.
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  // Tidy state: the five run as one bundle through a cable tie, then fan out to their ports.
  const MID = 210, XS = [LEFT, 105, 160, 215, 285, 350, 410, RIGHT];
  const neatPoints = (i) =>
    XS.map((x, j) => {
      const off = i - 2;
      if (j === 0) return [x, MID + off * 18];
      if (j <= 3) return [x, MID + off * 12];
      const mix = [0, 0, 0, 0, 0.3, 0.78, 1, 1][j];
      return [x, MID + off * 12 + (rowY(i) - MID - off * 12) * mix];
    });

  // Left ends lie in a heap, the middle loops over the whole panel.
  const tangledPoints = (i) =>
    Array.from({ length: K }, (_, j) => {
      if (j === 0) return [LEFT, rowY(i)];
      if (j === K - 1) return [RIGHT - 30 - rand() * 60, 120 + rand() * 200];
      return [90 + rand() * 340, 30 + rand() * (H - 60)];
    });

  // Catmull-Rom through the points, written out as cubic Béziers.
  function pathFor(pts) {
    let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    return d;
  }

  const el = (name, attrs, parent) => {
    const n = document.createElementNS(NS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    (parent || svg).appendChild(n);
    return n;
  };

  // Ports on the right: socket, label, status light.
  const ports = cables.map((c, i) => {
    const g = el("g", { transform: `translate(${RIGHT},${rowY(i)})` });
    el("rect", { x: 0, y: -15, width: 26, height: 30, rx: 5, fill: "#43101f", stroke: "#74304a" }, g);
    const light = el("circle", { cx: 40, cy: 0, r: 4, fill: "#74304a" }, g);
    const text = el("text", { x: 52, y: 5, class: "port-label", fill: "#d9c3c8", opacity: 0.55 }, g);
    text.textContent = c.label;
    return { light, text };
  });

  // Cables: a dark casing under each colored core reads as over/under at crossings.
  const wires = cables.map((c) => {
    const g = el("g", {});
    const casing = el("path", { fill: "none", stroke: "#43101f", "stroke-width": 13, "stroke-linecap": "round" }, g);
    const core = el("path", { fill: "none", stroke: c.color, "stroke-width": 7, "stroke-linecap": "round" }, g);
    const plug = el("rect", { width: 22, height: 14, rx: 3, fill: c.color, stroke: "#43101f", "stroke-width": 2 }, g);
    return { casing, core, plug };
  });

  const tie = el("rect", { x: 152, y: MID - 38, width: 16, height: 76, rx: 4, fill: "#43101f", stroke: "#f4ede4", "stroke-width": 2, opacity: 0 });
  tie.style.transition = "opacity .4s ease";

  let from = cables.map((_, i) => neatPoints(i));
  let to = from;
  let tangled = false;
  let raf = 0;

  function draw(stateOf) {
    cables.forEach((c, i) => {
      const pts = stateOf(i);
      const d = pathFor(pts);
      wires[i].casing.setAttribute("d", d);
      wires[i].core.setAttribute("d", d);
      const end = pts[K - 1], prev = pts[K - 2];
      const ang = (Math.atan2(end[1] - prev[1], end[0] - prev[0]) * 180) / Math.PI;
      wires[i].plug.setAttribute("transform", `translate(${end[0]},${end[1]}) rotate(${ang}) translate(-14,-7)`);
    });
  }

  function setPort(i, on) {
    ports[i].light.setAttribute("fill", on ? "#9fc6ae" : "#74304a");
    ports[i].text.setAttribute("opacity", on ? 1 : 0.55);
    ports[i].text.setAttribute("fill", on ? "#f4ede4" : "#d9c3c8");
  }

  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  function animate(target, done) {
    cancelAnimationFrame(raf);
    const snapshot = from.map((pts, i) => pts.map((p, j) => p.slice()));
    to = target;
    const DUR = 1600, STAGGER = 220, start = performance.now();
    const current = snapshot.map((p) => p.map((q) => q.slice()));
    function frame(now) {
      let finished = true;
      for (let i = 0; i < cables.length; i++) {
        let t = (now - start - i * STAGGER) / DUR;
        t = Math.max(0, Math.min(1, t));
        if (t < 1) finished = false;
        const e = ease(t);
        for (let j = 0; j < K; j++) {
          current[i][j][0] = snapshot[i][j][0] + (to[i][j][0] - snapshot[i][j][0]) * e;
          current[i][j][1] = snapshot[i][j][1] + (to[i][j][1] - snapshot[i][j][1]) * e;
        }
        if (!tangled && t === 1) setPort(i, true);
      }
      draw((i) => current[i]);
      from = current;
      if (!finished) raf = requestAnimationFrame(frame);
      else done && done();
    }
    raf = requestAnimationFrame(frame);
  }

  function tangle(instant) {
    tangled = true;
    cables.forEach((_, i) => setPort(i, false));
    tie.setAttribute("opacity", 0);
    const target = cables.map((_, i) => tangledPoints(i));
    status.textContent = "Her har noe gått i floke.";
    btn.textContent = "Rydd opp";
    if (instant || reduce) { from = target; draw((i) => target[i]); }
    else animate(target);
  }

  function untangle(instant) {
    tangled = false;
    const target = cables.map((_, i) => neatPoints(i));
    const finish = () => {
      tie.setAttribute("opacity", 1);
      status.textContent = "Alt koblet riktig.";
      btn.textContent = "Floke dem til igjen";
    };
    if (instant || reduce) {
      from = target; draw((i) => target[i]); cables.forEach((_, i) => setPort(i, true)); finish();
    } else animate(target, finish);
  }

  btn.addEventListener("click", () => (tangled ? untangle() : tangle()));

  if (reduce || !("IntersectionObserver" in window)) {
    untangle(true);
    return;
  }

  // Start tangled, sort it out once someone is looking.
  tangle(true);
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      io.disconnect();
      setTimeout(() => untangle(), 500);
    }
  }, { threshold: 0.4 });
  io.observe(svg);
})();

// Header: slides away while scrolling down, comes back on any scroll up (same as the Tenant Access
// landing bar). Near the top it always shows. Picking a section in the bar keeps it in view while
// the page scrolls there.
(function () {
  const bar = document.querySelector(".top");
  if (!bar) return;
  const HIDE_AFTER = 96; // px from the top before the bar may hide
  const TRAVEL = 8; // px moved in one direction before it hides or comes back
  let lastY = window.scrollY;
  let travel = 0;
  let holding = false;
  const setHidden = (hidden) => bar.classList.toggle("is-hidden", hidden);

  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    const step = y - lastY;
    lastY = y;
    if (y < HIDE_AFTER) { travel = 0; setHidden(false); return; }
    if (holding || step === 0) { travel = 0; return; }
    travel = Math.sign(step) === Math.sign(travel) ? travel + step : step;
    if (travel > TRAVEL) setHidden(true);
    else if (travel < -TRAVEL) setHidden(false);
  }, { passive: true });

  bar.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", () => {
      setHidden(false);
      holding = true;
      let timer = 0;
      const release = () => {
        holding = false;
        window.clearTimeout(timer);
        window.removeEventListener("scrollend", release);
      };
      window.addEventListener("scrollend", release);
      timer = window.setTimeout(release, 1200); // browsers without scrollend
    });
  });
})();
