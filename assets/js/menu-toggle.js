(function () {
  if (typeof window === "undefined") {
    return;
  }

  function initTopbar() {
    var toggle = document.getElementById("nnTbToggle");
    var mobile = document.getElementById("nnTbMobile");

    if (!toggle || !mobile || toggle.dataset.menuInitialized === "true") {
      return;
    }

    var openMenu = function () {
      mobile.removeAttribute("hidden");
      toggle.setAttribute("aria-expanded", "true");
      toggle.textContent = "✕";
    };

    var closeMenu = function () {
      mobile.setAttribute("hidden", "");
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "☰";
    };

    toggle.addEventListener("click", function () {
      var isHidden = mobile.hasAttribute("hidden");
      if (isHidden) {
        openMenu();
      } else {
        closeMenu();
      }
    });

    mobile.addEventListener("click", function (event) {
      if (event.target instanceof Element && event.target.closest("a")) {
        closeMenu();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 1080) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        closeMenu();
        toggle.focus();
      }
    });

    toggle.dataset.menuInitialized = "true";
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTopbar);
  } else {
    initTopbar();
  }
})();
