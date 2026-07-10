/* ============================================================
   SUMI — casa de tinta
   A · la mancha de tinta sigue al cursor (con retardo, como se
       extiende de verdad en el papel)
   B · los títulos se "pintan" al entrar en cuadro (IntersectionObserver)
   C · al pasar sobre una obra, la tinta florece desde el punto tocado
   Sin librerías.
   ============================================================ */
(() => {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lerp = (a, b, k) => a + (b - a) * k;
  document.documentElement.classList.add("tinta"); // JS activo → habilita la cortina de los títulos

  /* ---------- A · mancha que sigue el cursor ---------- */
  const ink = document.querySelector(".ink-cursor");
  const fino = matchMedia("(pointer:fine)").matches;
  let mx = innerWidth / 2, my = innerHeight / 2, ix = mx, iy = my, activo = false;

  if (fino && !reduce) {
    let corriendo = false;
    // el loop solo vive mientras la tinta persigue al cursor; al alcanzarlo se
    // detiene (idle = cero trabajo, para no robarle frames a las demás animaciones)
    const paso = () => {
      ix = lerp(ix, mx, 0.16);
      iy = lerp(iy, my, 0.16);
      ink.style.transform = `translate(${ix.toFixed(1)}px, ${iy.toFixed(1)}px)`;
      if (Math.abs(ix - mx) > 0.4 || Math.abs(iy - my) > 0.4) requestAnimationFrame(paso);
      else corriendo = false;
    };
    addEventListener("pointermove", e => {
      mx = e.clientX; my = e.clientY;
      if (!activo) { activo = true; ix = mx; iy = my; document.body.classList.add("ink-on"); }
      if (!corriendo) { corriendo = true; requestAnimationFrame(paso); }
    }, { passive: true });
  }

  /* ---------- B · títulos pintados al entrar en cuadro ---------- */
  const titulos = [...document.querySelectorAll(".brush")];
  if (reduce || !("IntersectionObserver" in window)) {
    titulos.forEach(t => t.classList.add("in"));
  } else {
    const io = new IntersectionObserver((entradas) => {
      for (const en of entradas) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      }
    }, { threshold: 0.35, rootMargin: "0px 0px -8% 0px" });
    titulos.forEach(t => io.observe(t));
  }

  /* ---------- C · florecimiento de tinta sobre las obras ---------- */
  for (const obra of document.querySelectorAll(".obra")) {
    const splot = obra.querySelector(".splot");
    if (!splot) continue;
    obra.addEventListener("pointermove", e => {
      const r = obra.getBoundingClientRect();
      splot.style.setProperty("--x", (e.clientX - r.left) + "px");
      splot.style.setProperty("--y", (e.clientY - r.top) + "px");
    }, { passive: true });
    // en teclado (focus) florece desde el centro
    obra.addEventListener("focus", () => {
      splot.style.setProperty("--x", "50%");
      splot.style.setProperty("--y", "42%");
    });
  }
})();
