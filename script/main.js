/* animasi scroll (AOS) */
try {
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: false,
      mirror: true,
      offset: 70,
    });
    document.documentElement.classList.add("aos-on");
  }
} catch (e) {}
