import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Statistic counter. Each digit is a 20-line reel (0-9 twice) moved with translateY.
function Odometer({ value }) {
  return (
    <span aria-label={value} className="flex justify-center">
      {[...value].map((c, i) =>
        /\d/.test(c) ? (
          <span
            key={i}
            data-digit={c}
            className="inline-block overflow-hidden"
            style={{ height: "1.1em" }}
          >
            <span data-reel className="will flex flex-col">
              {Array.from({ length: 20 }, (_, k) => (
                <span
                  key={k}
                  className="block"
                  style={{ height: "1.1em", lineHeight: 1.1 }}
                >
                  {k % 10}
                </span>
              ))}
            </span>
          </span>
        ) : (
          <span
            key={i}
            className="block"
            style={{ height: "1.1em", lineHeight: 1.1 }}
          >
            {c}
          </span>
        ),
      )}
    </span>
  );
}

const WORDS = ["WELCOME", "ITZFIZZ"];
const BGS = ["dots-a", "dots-b", "laptop", "usb"];
const FAN = [
  { x: -40, y: -70, r: -9, s: 1.08 },
  { x: 0, y: -130, r: 0, s: 1.2 },
  { x: 40, y: -70, r: 9, s: 1.08 },
];
const STATS = [
  { to: 85, dec: 0, suf: "%", label: "Faster page loads" },
  { to: 3.2, dec: 1, suf: "x", label: "Longer visits" },
  { to: 60, dec: 0, suf: "%", label: "More enquiries" },
];

export default function Hero() {
  const root = useRef(null);

  useLayoutEffect(() => {
    const q = gsap.utils.selector(root);
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = gsap.context(() => {
      // Intro: cards are visible at once; each stat inside fades up one by one while its number counts from 0
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro.from(q("[data-letter]"), {
        y: 48,
        opacity: 0,
        duration: 1.1,
        stagger: 0.07,
      });
      q("[data-intro]").forEach((el, i) => {
        const at = 1.2 + i * 0.6; // delay between cards
        intro.from(el, { y: 24, opacity: 0, duration: 0.9 }, at);
        // Odometer: every digit reel rolls from 0 to its digit; later digits start slightly after
        el.querySelectorAll("[data-reel]").forEach((reel, j) => {
          const d = Number(reel.parentElement.dataset.digit);
          intro.fromTo(
            reel,
            { yPercent: 0 },
            {
              yPercent: -((d + 10) / 20) * 100,
              duration: 1.6 + j * 0.2,
              ease: "power3.inOut",
            },
            at + 0.2 + j * 0.08,
          );
        });
      });

      if (reduce) return;

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
        },
      });

      //  slow background zoom on all layers, later layers crossfade in over earlier ones
      tl.fromTo(
        q("[data-bg]"),
        { scale: 1.15, yPercent: 0 },
        { scale: 1.35, yPercent: -6, duration: 1 },
        0,
      )
        .fromTo(
          q("[data-bg='1']"),
          { opacity: 0 },
          { opacity: 1, duration: 0.12 },
          0.2,
        )
        .fromTo(
          q("[data-bg='2']"),
          { opacity: 0 },
          { opacity: 1, duration: 0.12 },
          0.45,
        )
        .fromTo(
          q("[data-bg='3']"),
          { opacity: 0 },
          { opacity: 1, duration: 0.12 },
          0.7,
        )
        .to(q("[data-head]"), { yPercent: -25, scale: 0.92, duration: 1 }, 0)
        .to(q("[data-cue]"), { opacity: 0, duration: 0.08 }, 0);

      // Cards: each one fans out with its own translate, scale and rotate, tied to scroll, then fades away
      q("[data-card]").forEach((el, i) => {
        const f = FAN[i];
        const start = i * 0.1; // each card starts a little after the previous one
        tl.fromTo(
          el,
          { x: 0, y: 0, rotate: 0, scale: 1 },
          { x: f.x, y: f.y, rotate: f.r, scale: f.s, duration: 0.55 },
          start,
        ).to(el, { opacity: 0, duration: 0.2 }, start + 0.55); // fade out once its transform has finished
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative h-[400vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-black">
        {BGS.map((n, i) => (
          <img
            key={n}
            data-bg={i}
            // src={`/images/${n}.jpg`}
            src={`${import.meta.env.BASE_URL}images/${n}.jpg`}
            alt=""
            className={`will absolute inset-0 h-full w-full object-cover ${i ? "opacity-0" : ""}`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/75" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <h1
            data-head
            className="will font-display font-fraunces text-[clamp(1.4rem,5.2vw,4.5rem)] font-extrabold leading-none"
          >
            {WORDS.map((w, wi) => (
              <span
                key={w}
                className={`inline-block whitespace-nowrap ${wi ? "ml-[1.2em]" : ""}`}
              >
                {w.split("").map((c, i) => (
                  <span
                    key={i}
                    data-letter
                    className="will inline-block pr-[0.2em]"
                  >
                    {c}
                  </span>
                ))}
              </span>
            ))}
          </h1>

          <ul className="mt-14 grid w-full max-w-3xl grid-cols-3 gap-3 sm:gap-6">
            {STATS.map((s) => (
              <li key={s.label} data-card className="will">
                <div className="rounded-2xl border border-cyan-300/25 bg-[#06121c]/60 px-3 py-6 shadow-2xl shadow-black/40">
                  <div data-intro className="will">
                    <div className="font-display text-3xl font-semibold text-cyan-300 sm:text-5xl">
                      <Odometer value={s.to.toFixed(s.dec) + s.suf} />
                    </div>
                    <div className="mt-2 text-xs font-light text-sky-100/70 sm:text-sm">
                      {s.label}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
