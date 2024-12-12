document.addEventListener("DOMContentLoaded", function () {
  const hamb = document.getElementById("hamburger");
  const navLinks = document.getElementById("nav-links");

  hamb.addEventListener("click", function () {
    hamb.classList.toggle("active");
    navLinks.classList.toggle("active");
  });

  document.addEventListener("click", function (e) {
    if (!hamb.contains(e.target) && !navLinks.contains(e.target)) {
      if (navLinks.classList.contains("active")) {
        hamb.classList.remove("active");
        navLinks.classList.remove("active");
      }
    }
  });
});
