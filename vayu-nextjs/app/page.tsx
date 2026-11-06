"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Home() {
  // Stats counting animation
  useEffect(() => {
    const stats = document.querySelectorAll(".stat-value");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startCounting(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );

    stats.forEach((stat) => observer.observe(stat));

    function startCounting(el: Element) {
      const target = parseFloat(el.getAttribute("data-target") || "0");
      const decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      const index = Array.from(stats).indexOf(el);

      const duration = 1500 + index * 80;
      const delay = 480 + index * 90;
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

      setTimeout(() => {
        const start = performance.now();

        function update(currentTime: number) {
          const elapsed = currentTime - start;
          const progress = Math.min(elapsed / duration, 1);
          const current = target * easeOutCubic(progress);

          el.textContent = current.toFixed(decimals);

          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            el.textContent = target.toFixed(decimals);
          }
        }

        requestAnimationFrame(update);
      }, delay);
    }

    return () => {
      stats.forEach((stat) => observer.unobserve(stat));
    };
  }, []);

  return (
    <>
      <div className="bg">
        <video
          className="bg-video"
          autoPlay
          muted
          loop
          playsInline
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      <div className="page" style={{ paddingTop: "80px" }}>
        <main className="hero">
          <h1 className="headline">
            <span className="line line1 anim" style={{ "--d": "0.12s" } as React.CSSProperties}>
              Intelligence
            </span>
            <br />
            <span className="line anim" style={{ "--d": "0.3s" } as React.CSSProperties}>
              Designed To Evolve
            </span>
          </h1>

          <p className="subhead anim" style={{ "--d": "0.28s" } as React.CSSProperties}>
            Experience true autonomous cybersecurity. VAYU doesn&apos;t just find vulnerabilities—
            <br />
            it reasons, patches, and mathematically proves they are eradicated.
          </p>

          <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
            <Link
              href="/pulse"
              className="cta anim"
              style={
                {
                  "--d": "0.4s",
                  background: "#5e6ad2",
                  color: "#ffffff",
                  boxShadow: "0 0 24px rgba(94, 106, 210, 0.45)",
                  fontWeight: 600,
                  letterSpacing: "-0.2px",
                } as React.CSSProperties
              }
            >
              Enter Arena
            </Link>
            <Link
              href="/reviews"
              className="cta anim"
              style={
                {
                  "--d": "0.48s",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.2)",
                } as React.CSSProperties
              }
            >
              Code Reviews
            </Link>
          </div>
        </main>

        <footer className="stats-footer">
          <div className="stat anim" style={{ "--d": "0.5s" } as React.CSSProperties}>
            <div className="stat-icon">&lt;</div>
            <div className="stat-value-container">
              <span className="stat-value" data-target="0" data-decimals="0">
                0
              </span>
              <span className="stat-suffix"></span>
            </div>
            <div className="stat-label">False Positives</div>
          </div>
          <div className="stat anim" style={{ "--d": "0.58s" } as React.CSSProperties}>
            <div className="stat-icon">%</div>
            <div className="stat-value-container">
              <span className="stat-value" data-target="100" data-decimals="0">
                0
              </span>
              <span className="stat-suffix">%</span>
            </div>
            <div className="stat-label">Patch Verification</div>
          </div>
          <div className="stat anim" style={{ "--d": "0.66s" } as React.CSSProperties}>
            <div className="stat-icon">*</div>
            <div className="stat-value-container">
              <span className="stat-value" data-target="24" data-decimals="0">
                0
              </span>
              <span className="stat-suffix">/7</span>
            </div>
            <div className="stat-label">Autonomous SecOps</div>
          </div>
        </footer>
      </div>
    </>
  );
}
