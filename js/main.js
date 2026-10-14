/* =========================================================
   个人主页 · 第一版框架交互脚本
   功能：滚动进度条 / 导航高亮 / 移动端菜单 /
        滚动入场动画 / 打字机效果 / 粒子背景 / 页脚年份
   ========================================================= */
(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* -----------------------------------------------------
     1. 滚动进度条 + 导航栏状态
     ----------------------------------------------------- */
  const header = document.querySelector(".site-header");
  const progressBar = document.getElementById("scroll-progress-bar");

  function onScroll() {
    const docEl = document.documentElement;
    const scrollTop = window.scrollY || docEl.scrollTop;
    const scrollHeight = docEl.scrollHeight - docEl.clientHeight;
    const ratio = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

    if (progressBar) {
      progressBar.style.width = (ratio * 100).toFixed(2) + "%";
    }
    if (header) {
      header.classList.toggle("is-scrolled", scrollTop > 10);
    }
    updateActiveSection();
  }

  /* -----------------------------------------------------
     2. 导航当前区块高亮
     ----------------------------------------------------- */
  const navLinks = Array.from(document.querySelectorAll(".nav__link"));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  function updateActiveSection() {
    const offset = window.innerHeight * 0.32;
    let currentId = sections.length ? sections[0].id : null;

    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= offset) {
        currentId = section.id;
      }
    });

    navLinks.forEach((link) => {
      link.classList.toggle(
        "is-active",
        link.getAttribute("href") === "#" + currentId
      );
    });
  }

  /* -----------------------------------------------------
     3. 移动端菜单开关
     ----------------------------------------------------- */
  const navToggle = document.querySelector(".nav__toggle");
  const navList = document.querySelector(".nav__list");

  if (navToggle && navList) {
    navToggle.addEventListener("click", function () {
      const isOpen = navList.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navList.addEventListener("click", function (e) {
      if (e.target.closest(".nav__link")) {
        navList.classList.remove("is-open");
        navToggle.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* -----------------------------------------------------
     4. 滚动入场动画（IntersectionObserver）
     ----------------------------------------------------- */
  const revealEls = document.querySelectorAll(".reveal");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* -----------------------------------------------------
     5. Hero 打字机效果
     ----------------------------------------------------- */
  const typedEl = document.querySelector(".typed");

  if (typedEl && !prefersReducedMotion) {
    let words = [];
    try {
      words = JSON.parse(typedEl.getAttribute("data-typed") || "[]");
    } catch (err) {
      words = [];
    }

    if (words.length) {
      let wordIndex = 0;
      let charIndex = 0;
      let deleting = false;

      const type = function () {
        const word = words[wordIndex];
        charIndex += deleting ? -1 : 1;
        typedEl.textContent = word.slice(0, charIndex);

        let delay = deleting ? 55 : 110;

        if (!deleting && charIndex === word.length) {
          delay = 1600;
          deleting = true;
        } else if (deleting && charIndex === 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
          delay = 350;
        }
        window.setTimeout(type, delay);
      };

      window.setTimeout(type, 600);
    }
  } else if (typedEl) {
    try {
      const first = JSON.parse(typedEl.getAttribute("data-typed") || "[]")[0];
      if (first) typedEl.textContent = first;
    } catch (err) {
      /* 忽略解析错误 */
    }
  }

  /* -----------------------------------------------------
     6. 粒子背景（轻量 Canvas 实现）
     ----------------------------------------------------- */
  const canvas = document.getElementById("particle-canvas");

  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext("2d");
    let particles = [];
    let rafId = null;
    const colors = ["59,130,246", "139,92,246", "34,211,238"];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    }

    function initParticles() {
      const count = Math.min(
        70,
        Math.floor((canvas.width * canvas.height) / 24000)
      );
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 2 + 1,
        c: colors[Math.floor(Math.random() * colors.length)],
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + p.c + ",0.55)";
        ctx.fill();
      });

      // 粒子间连线
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle =
              "rgba(99,102,241," + (0.14 * (1 - dist / 130)).toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      rafId = window.requestAnimationFrame(draw);
    }

    let resizeTimer = null;
    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 200);
    });

    // 页面不可见时暂停动画，节省资源
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        if (rafId) {
          window.cancelAnimationFrame(rafId);
          rafId = null;
        }
      } else if (!rafId) {
        draw();
      }
    });

    resize();
    draw();
  }

  /* -----------------------------------------------------
     7. 页脚年份
     ----------------------------------------------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* -----------------------------------------------------
     8. 简历下载（若文件缺失给出友好提示）
     ----------------------------------------------------- */
  const downloadBtn = document.getElementById("resume-download");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", function () {
      // 提示：请将简历文件放到 assets/resume.pdf
      console.info(
        "[简历] 下载入口已就绪，请把简历文件放到 assets/resume.pdf"
      );
    });
  }

  /* -----------------------------------------------------
     9. 初始化
     ----------------------------------------------------- */
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
})();
