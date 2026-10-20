(() => {
  "use strict";

  const CONFIG = {
    whatsappNumber: "5493515580535"
  };

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const byId = (id) => document.getElementById(id);
  const all = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const rand = (min, max) => min + Math.random() * (max - min);
  const waUrl = (message) => `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;

  all(".js-wa").forEach((link) => {
    const message = link.dataset.wa || "Hola GODER JS! Quiero hacer una consulta.";
    link.href = waUrl(message);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });

  const year = byId("year");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  const header = byId("siteHeader");
  const scrollProgress = document.querySelector(".scroll-progress");

  const updateScroll = () => {
    const currentY = window.scrollY || document.documentElement.scrollTop;
    if (header) {
      header.classList.toggle("is-scrolled", currentY > 26);
    }
    if (scrollProgress) {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress.style.transform = `scaleX(${scrollable > 0 ? clamp(currentY / scrollable, 0, 1) : 0})`;
    }
  };

  window.addEventListener("scroll", updateScroll, { passive: true });
  window.addEventListener("resize", updateScroll);
  updateScroll();

  const navToggle = byId("navToggle");
  const primaryNav = byId("primaryNav");
  let navOpen = false;

  const setNav = (open) => {
    if (!navToggle || !primaryNav || !header) {
      return;
    }
    navOpen = open;
    primaryNav.classList.toggle("is-open", open);
    header.classList.toggle("is-nav-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");

    if (open && window.innerWidth <= 900) {
      const firstLink = primaryNav.querySelector("a");
      if (firstLink) {
        window.setTimeout(() => firstLink.focus({ preventScroll: true }), 60);
      }
    }
  };

  const trapNavFocus = (event) => {
    if (!navOpen || event.key !== "Tab" || window.innerWidth > 900) {
      return;
    }
    const focusable = [navToggle].concat(all("a", primaryNav));
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (navToggle && primaryNav) {
    navToggle.addEventListener("click", () => setNav(!navOpen));

    all("a", primaryNav).forEach((link) => {
      link.addEventListener("click", () => setNav(false));
    });

    document.addEventListener("click", (event) => {
      if (navOpen && !primaryNav.contains(event.target) && !navToggle.contains(event.target)) {
        setNav(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navOpen) {
        setNav(false);
        navToggle.focus();
        return;
      }
      trapNavFocus(event);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900 && navOpen) {
        setNav(false);
      }
    });
  }

  const revealItems = all("[data-reveal]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((element) => element.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: .12,
      rootMargin: "0px 0px -48px 0px"
    });

    revealItems.forEach((element) => revealObserver.observe(element));
  }

  all(".faq-item").forEach((item) => {
    item.addEventListener("toggle", () => {
      if (item.open) {
        all(".faq-item").forEach((other) => {
          if (other !== item) {
            other.open = false;
          }
        });
      }
    });
  });

  const worksGrid = byId("worksGrid");

  if (worksGrid) {
    const filterButtons = all(".works-filters [data-filter]");
    const workItems = all(".work-item", worksGrid);

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter;
        filterButtons.forEach((other) => {
          const active = other === button;
          other.classList.toggle("is-active", active);
          other.setAttribute("aria-pressed", String(active));
        });
        workItems.forEach((item) => {
          const show = filter === "all" || item.dataset.cat === filter;
          item.classList.toggle("is-hidden", !show);
          if (show) {
            item.classList.add("is-visible");
          }
        });
      });
    });

    const lightbox = byId("lightbox");
    const lbImg = byId("lbImg");
    const lbTitle = byId("lbTitle");
    const lbDesc = byId("lbDesc");
    const lbPrev = byId("lbPrev");
    const lbNext = byId("lbNext");
    const lbClose = byId("lbClose");

    if (lightbox && typeof lightbox.showModal === "function" && lbImg) {
      let current = 0;
      let opener = null;

      const visibleCards = () => all(".work-item:not(.is-hidden) .work-card", worksGrid);

      const show = (index) => {
        const cards = visibleCards();
        if (!cards.length) {
          return;
        }
        current = (index + cards.length) % cards.length;
        const card = cards[current];
        const thumb = card.querySelector("img");
        lbImg.src = card.dataset.full || (thumb ? thumb.src : "");
        lbImg.alt = thumb ? thumb.alt : "";
        lbTitle.textContent = card.dataset.title || "";
        lbDesc.textContent = card.dataset.desc || "";
        const single = cards.length < 2;
        lbPrev.hidden = single;
        lbNext.hidden = single;
      };

      worksGrid.addEventListener("click", (event) => {
        const card = event.target.closest(".work-card");
        if (!card) {
          return;
        }
        opener = card;
        show(visibleCards().indexOf(card));
        lightbox.showModal();
        document.documentElement.style.overflow = "hidden";
      });

      lbPrev.addEventListener("click", () => show(current - 1));
      lbNext.addEventListener("click", () => show(current + 1));
      lbClose.addEventListener("click", () => lightbox.close());

      lightbox.addEventListener("click", (event) => {
        if (event.target === lightbox || event.target.classList.contains("lightbox-inner")) {
          lightbox.close();
        }
      });

      lightbox.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") {
          show(current - 1);
        } else if (event.key === "ArrowRight") {
          show(current + 1);
        }
      });

      lightbox.addEventListener("close", () => {
        document.documentElement.style.overflow = "";
        lbImg.removeAttribute("src");
        if (opener) {
          opener.focus({ preventScroll: true });
        }
      });
    } else {
      all(".work-card", worksGrid).forEach((card) => {
        card.style.cursor = "default";
      });
    }
  }

  const quoteForm = byId("quoteForm");

  if (quoteForm) {
    const formStatus = byId("formStatus");
    const formFallback = byId("formFallback");
    const nameInput = byId("name");
    const zoneInput = byId("zone");
    const serviceInput = byId("service");
    const detailsInput = byId("details");
    const requiredFields = [nameInput, zoneInput, serviceInput].filter(Boolean);

    const setStatus = (message, type) => {
      if (!formStatus) {
        return;
      }
      formStatus.textContent = message;
      formStatus.className = "form-status" + (type ? ` is-${type}` : "");
    };

    requiredFields.forEach((field) => {
      const clearError = () => {
        field.classList.remove("is-invalid");
        field.removeAttribute("aria-invalid");
        if (formStatus && formStatus.classList.contains("is-error")) {
          setStatus("", "");
        }
      };

      field.addEventListener("input", clearError);
      field.addEventListener("change", clearError);
    });

    all("[data-preselect]").forEach((link) => {
      link.addEventListener("click", () => {
        if (!serviceInput) {
          return;
        }
        serviceInput.value = link.dataset.preselect || "";
        serviceInput.classList.remove("is-invalid", "is-highlighted");
        serviceInput.removeAttribute("aria-invalid");
        void serviceInput.offsetWidth;
        serviceInput.classList.add("is-highlighted");
        window.setTimeout(() => serviceInput.classList.remove("is-highlighted"), 2200);
      });
    });

    quoteForm.addEventListener("submit", (event) => {
      event.preventDefault();
      let firstInvalid = null;

      requiredFields.forEach((field) => {
        const invalid = !field.value.trim();
        field.classList.toggle("is-invalid", invalid);
        if (invalid) {
          field.setAttribute("aria-invalid", "true");
          if (!firstInvalid) {
            firstInvalid = field;
          }
        } else {
          field.removeAttribute("aria-invalid");
        }
      });

      if (firstInvalid) {
        setStatus("Completá nombre, zona y servicio para armar el mensaje.", "error");
        if (formFallback) {
          formFallback.hidden = true;
        }
        firstInvalid.focus();
        return;
      }

      const name = nameInput.value.trim();
      const zone = zoneInput.value.trim();
      const service = serviceInput.value.trim();
      const details = detailsInput ? detailsInput.value.trim() : "";
      const lines = [
        "Hola GODER JS! Quiero pedir un presupuesto.",
        `Nombre: ${name}`,
        `Zona / barrio: ${zone}`,
        `Servicio: ${service}`
      ];

      if (details) {
        lines.push(`Detalle: ${details}`);
      }

      const url = waUrl(lines.join("\n"));
      if (formFallback) {
        formFallback.href = url;
        formFallback.hidden = false;
      }
      setStatus("Listo. Abrimos WhatsApp con tu consulta preparada.", "success");
      window.open(url, "_blank", "noopener,noreferrer");
    });
  }

  const logoCard = byId("logoCard");
  const heroSection = byId("inicio");

  if (logoCard && heroSection && hasHover && !reduceMotion) {
    const resetTilt = () => {
      logoCard.style.transform = "";
      logoCard.style.setProperty("--gx", "50%");
      logoCard.style.setProperty("--gy", "0%");
    };

    heroSection.addEventListener("pointermove", (event) => {
      const rect = logoCard.getBoundingClientRect();
      const relativeX = (event.clientX - rect.left) / rect.width;
      const relativeY = (event.clientY - rect.top) / rect.height;
      const rotateX = clamp((.5 - relativeY) * 10, -6, 6);
      const rotateY = clamp((relativeX - .5) * 12, -8, 8);

      logoCard.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
      logoCard.style.setProperty("--gx", `${(relativeX * 100).toFixed(1)}%`);
      logoCard.style.setProperty("--gy", `${(relativeY * 100).toFixed(1)}%`);
    });

    heroSection.addEventListener("pointerleave", resetTilt);
  }

  const heroCanvas = byId("heroCanvas");

  if (heroCanvas && heroSection && heroCanvas.getContext) {
    const ctx = heroCanvas.getContext("2d");

    if (ctx) {
      const TAU = Math.PI * 2;
      const lite = document.documentElement.classList.contains("is-lite");
      let canvasWidth = 1;
      let canvasHeight = 1;
      let flakes = [];
      let sparks = [];
      let bolts = [];
      let elapsed = 0;
      let lastFrame = 0;
      let frameId = 0;
      let running = false;
      let resizeId = 0;
      let spawnTimer = .7;
      let sceneVisible = true;

      const newFlake = (initial) => {
        const depth = rand(.28, 1);
        return {
          x: rand(-28, canvasWidth * .58),
          y: initial ? rand(-canvasHeight * .18, canvasHeight) : rand(-canvasHeight * .12, -18),
          radius: 5 + depth * 13,
          depth,
          vy: 12 + depth * 33,
          vx: rand(-11, 11),
          rotation: rand(0, TAU),
          spin: rand(-.55, .55),
          phase: rand(0, TAU),
          alpha: .16 + depth * .5
        };
      };

      const newSpark = (initial) => ({
        x: rand(canvasWidth * .53, canvasWidth * .99),
        y: initial ? rand(0, canvasHeight) : rand(canvasHeight * .8, canvasHeight + 24),
        vx: rand(-9, 9),
        vy: rand(-34, -12),
        size: rand(.9, 2.4),
        phase: rand(0, TAU),
        speed: rand(.6, 1.6),
        hue: Math.random() < .52 ? "123, 227, 255" : "154, 240, 113"
      });

      const makeJitter = (x1, y1, x2, y2, amount, depth) => {
        if (depth <= 0) {
          return [{ x: x2, y: y2 }];
        }

        const midX = (x1 + x2) / 2 + rand(-amount, amount);
        const midY = (y1 + y2) / 2 + rand(-amount * .22, amount * .22);

        return makeJitter(x1, y1, midX, midY, amount * .55, depth - 1)
          .concat(makeJitter(midX, midY, x2, y2, amount * .55, depth - 1));
      };

      const createBolt = () => {
        const startX = rand(canvasWidth * .53, canvasWidth * .94);
        const startY = rand(-20, canvasHeight * .18);
        const endX = clamp(startX + rand(-canvasWidth * .1, canvasWidth * .1), canvasWidth * .5, canvasWidth * .985);
        const endY = rand(canvasHeight * .36, canvasHeight * .92);
        const points = [{ x: startX, y: startY }].concat(
          makeJitter(startX, startY, endX, endY, Math.min(78, canvasWidth * .055), lite ? 5 : 6)
        );
        const branches = [];

        if (Math.random() < .76) {
          const branchIndex = Math.floor(rand(points.length * .3, points.length * .68));
          const origin = points[Math.max(1, Math.min(branchIndex, points.length - 2))];
          const direction = Math.random() < .5 ? -1 : 1;
          const branchX = clamp(origin.x + direction * rand(canvasWidth * .05, canvasWidth * .12), 8, canvasWidth - 8);
          const branchY = origin.y + rand(canvasHeight * .06, canvasHeight * .2);

          branches.push(
            [{ x: origin.x, y: origin.y }].concat(
              makeJitter(origin.x, origin.y, branchX, branchY, Math.min(44, canvasWidth * .035), 4)
            )
          );
        }

        return {
          points,
          branches,
          age: 0,
          life: rand(.18, .4),
          alpha: rand(.55, .95),
          color: Math.random() < .5 ? "135, 230, 255" : "171, 248, 133"
        };
      };

      const buildScene = () => {
        const flakeCount = lite ? clamp(Math.round(canvasWidth / 60), 8, 16) : clamp(Math.round(canvasWidth / 32), 16, 46);
        const sparkCount = lite ? clamp(Math.round(canvasWidth / 90), 5, 10) : clamp(Math.round(canvasWidth / 46), 10, 28);

        flakes = Array.from({ length: flakeCount }, () => newFlake(true));
        sparks = Array.from({ length: sparkCount }, () => newSpark(true));
        bolts = [];
        spawnTimer = rand(.25, 1.1);
      };

      const setCanvasSize = () => {
        const rect = heroSection.getBoundingClientRect();
        canvasWidth = Math.max(1, rect.width);
        canvasHeight = Math.max(1, rect.height);
        const pixelRatio = lite ? 1 : Math.min(window.devicePixelRatio || 1, 2);

        heroCanvas.width = Math.round(canvasWidth * pixelRatio);
        heroCanvas.height = Math.round(canvasHeight * pixelRatio);
        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      };

      const drawEnergyField = (time) => {
        ctx.save();
        ctx.lineWidth = 1;

        for (let index = 0; index < 4; index += 1) {
          const baseX = canvasWidth * (.57 + index * .1);
          const amplitude = 14 + index * 5;
          const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);

          gradient.addColorStop(0, "rgba(125, 225, 255, 0)");
          gradient.addColorStop(.5, index % 2 === 0 ? "rgba(103, 199, 255, .07)" : "rgba(159, 240, 118, .075)");
          gradient.addColorStop(1, "rgba(125, 225, 255, 0)");
          ctx.strokeStyle = gradient;
          ctx.beginPath();

          const step = lite ? 30 : 18;

          for (let y = 0; y <= canvasHeight + step; y += step) {
            const x = baseX
              + Math.sin(y * .011 + time * .55 + index * 1.7) * amplitude
              + Math.sin(y * .031 - time * .4 + index) * 4;

            if (y === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }

          ctx.stroke();
        }

        ctx.restore();
      };

      const tracePath = (points) => {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let index = 1; index < points.length; index += 1) {
          ctx.lineTo(points[index].x, points[index].y);
        }
      };

      const drawBolt = (bolt) => {
        const progress = clamp(bolt.age / bolt.life, 0, 1);
        const fade = Math.min(1, progress * 9) * (1 - progress);
        const flicker = .62 + Math.random() * .38;
        const alpha = Math.max(.16, bolt.alpha * fade * flicker);

        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        tracePath(bolt.points);

        const layers = [
          [9, .06],
          [4.5, .14],
          [1.8, .48],
          [.85, .95]
        ];

        layers.forEach(([lineWidth, strength]) => {
          ctx.lineWidth = lineWidth;
          ctx.shadowBlur = !lite && lineWidth > 4 ? 22 : 0;
          ctx.shadowColor = `rgba(${bolt.color}, .5)`;
          ctx.strokeStyle = `rgba(${bolt.color}, ${(alpha * strength).toFixed(3)})`;
          ctx.stroke();
        });

        ctx.shadowBlur = 0;
        ctx.lineWidth = .9;
        ctx.strokeStyle = `rgba(240, 255, 255, ${(alpha * .9).toFixed(3)})`;
        ctx.stroke();

        bolt.branches.forEach((branch) => {
          tracePath(branch);
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = `rgba(${bolt.color}, ${(alpha * .58).toFixed(3)})`;
          ctx.stroke();
        });

        ctx.restore();
      };

      const drawFlake = (flake) => {
        const flatten = .3 + .7 * Math.abs(Math.sin(flake.phase));
        const radius = flake.radius;

        ctx.save();
        ctx.translate(flake.x, flake.y);
        ctx.rotate(flake.rotation);
        ctx.scale(1, flatten);
        ctx.beginPath();

        for (let arm = 0; arm < 6; arm += 1) {
          ctx.save();
          ctx.rotate(arm * Math.PI / 3);
          ctx.moveTo(0, -radius * .12);
          ctx.lineTo(0, -radius);
          ctx.moveTo(0, -radius * .52);
          ctx.lineTo(-radius * .21, -radius * .72);
          ctx.moveTo(0, -radius * .52);
          ctx.lineTo(radius * .21, -radius * .72);
          ctx.moveTo(0, -radius * .78);
          ctx.lineTo(-radius * .15, -radius * .92);
          ctx.moveTo(0, -radius * .78);
          ctx.lineTo(radius * .15, -radius * .92);
          ctx.restore();
        }

        ctx.strokeStyle = `rgba(196, 237, 255, ${(flake.alpha * .22).toFixed(3)})`;
        ctx.lineWidth = 3 + flake.depth * 1.6;
        ctx.stroke();
        ctx.strokeStyle = `rgba(238, 252, 255, ${flake.alpha.toFixed(3)})`;
        ctx.lineWidth = .75 + flake.depth * .8;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, Math.max(.7, radius * .045), 0, TAU);
        ctx.fillStyle = `rgba(235, 251, 255, ${flake.alpha.toFixed(3)})`;
        ctx.fill();
        ctx.restore();
      };

      const drawSpark = (spark, time) => {
        const flicker = .55 + .45 * Math.sin(time * spark.speed * 2 + spark.phase);
        const alpha = clamp(.3 + flicker * .45, 0, .9);

        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = `rgba(${spark.hue}, ${(alpha * .16).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, spark.size * 3.5, 0, TAU);
        ctx.fill();
        ctx.fillStyle = `rgba(${spark.hue}, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, spark.size, 0, TAU);
        ctx.fill();
        ctx.restore();
      };

      const paint = (time) => {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        drawEnergyField(time);
        bolts.forEach((bolt) => drawBolt(bolt));
        flakes.forEach((flake) => drawFlake(flake));
        sparks.forEach((spark) => drawSpark(spark, time));
      };

      const update = (delta) => {
        flakes.forEach((flake, index) => {
          flake.phase += delta * (.7 + flake.depth);
          flake.rotation += flake.spin * delta;
          flake.x += (flake.vx + Math.sin(flake.phase) * 5) * delta;
          flake.y += flake.vy * delta;

          if (flake.y > canvasHeight + 45 || flake.x < -70 || flake.x > canvasWidth * .68 + 60) {
            flakes[index] = newFlake(false);
          }
        });

        sparks.forEach((spark, index) => {
          spark.phase += delta * spark.speed;
          spark.x += (spark.vx + Math.sin(spark.phase) * 4) * delta;
          spark.y += spark.vy * delta;

          if (spark.y < -24 || spark.x < canvasWidth * .48 || spark.x > canvasWidth + 24) {
            sparks[index] = newSpark(false);
          }
        });

        bolts.forEach((bolt) => {
          bolt.age += delta;
        });

        spawnTimer -= delta;
        if (spawnTimer <= 0 && bolts.length < (lite ? 1 : 3)) {
          bolts.push(createBolt());
          if (!lite && Math.random() < .2) {
            bolts.push(createBolt());
          }
          spawnTimer = rand(1.65, 3.9);
        }

        bolts = bolts.filter((bolt) => bolt.age < bolt.life);
      };

      const frame = (now) => {
        if (!running) {
          return;
        }

        if (!lastFrame) {
          lastFrame = now;
        }

        if (lite && now - lastFrame < 32) {
          frameId = window.requestAnimationFrame(frame);
          return;
        }

        const delta = Math.min((now - lastFrame) / 1000, .05);
        lastFrame = now;
        elapsed += delta;
        update(delta);
        paint(elapsed);
        frameId = window.requestAnimationFrame(frame);
      };

      const start = () => {
        if (running || reduceMotion) {
          return;
        }
        running = true;
        lastFrame = 0;
        frameId = window.requestAnimationFrame(frame);
      };

      const stop = () => {
        running = false;
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      };

      const drawStatic = () => {
        if (!bolts.length) {
          const bolt = createBolt();
          bolt.age = bolt.life * .32;
          bolts.push(bolt);
        }
        paint(1.2);
      };

      const resize = () => {
        setCanvasSize();
        buildScene();

        if (reduceMotion) {
          drawStatic();
          return;
        }

        paint(elapsed);
        if (sceneVisible) {
          start();
        }
      };

      const scheduleResize = () => {
        window.cancelAnimationFrame(resizeId);
        resizeId = window.requestAnimationFrame(resize);
      };

      resize();

      if ("IntersectionObserver" in window) {
        const canvasObserver = new IntersectionObserver((entries) => {
          const entry = entries[0];
          sceneVisible = entry.isIntersecting;

          if (sceneVisible) {
            start();
          } else {
            stop();
          }
        }, { threshold: .02 });

        canvasObserver.observe(heroSection);
      }

      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          stop();
        } else if (sceneVisible) {
          start();
        }
      });

      if ("ResizeObserver" in window) {
        const heroResizeObserver = new ResizeObserver(scheduleResize);
        heroResizeObserver.observe(heroSection);
      } else {
        window.addEventListener("resize", scheduleResize);
      }
    }
  }
})();
