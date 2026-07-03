(function () {
  if (typeof window === "undefined") {
    return;
  }

  function initTopbar() {
    var toggle = document.getElementById("nnTbToggle");
    var mobile = document.getElementById("nnTbMobile");
    var desktopDrop = document.querySelector(".nn-topbar .nn-tb-drop");
    var mobileDrop = document.querySelector(".nn-topbar .nn-tb-m-drop");

    if (toggle && mobile && toggle.dataset.menuInitialized !== "true") {
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
        if (mobile.hasAttribute("hidden")) { openMenu(); } else { closeMenu(); }
      });
      mobile.addEventListener("click", function (event) {
        if (event.target instanceof Element && event.target.closest("a")) {
          closeMenu();
        }
      });
      window.addEventListener("resize", function () {
        if (window.innerWidth > 1080) { closeMenu(); }
      });
      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
          closeMenu();
          toggle.focus();
        }
      });
      toggle.dataset.menuInitialized = "true";
    }

    // Desktop Cidades dropdown
    if (desktopDrop && desktopDrop.dataset.dropInitialized !== "true") {
      var dt = desktopDrop.querySelector(".nn-tb-drop-toggle");
      var dm = desktopDrop.querySelector(".nn-tb-drop-menu");
      if (dt && dm) {
        var closeDesktop = function () {
          dm.setAttribute("hidden", "");
          dt.setAttribute("aria-expanded", "false");
        };
        var openDesktop = function () {
          dm.removeAttribute("hidden");
          dt.setAttribute("aria-expanded", "true");
        };
        dt.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          if (dm.hasAttribute("hidden")) { openDesktop(); } else { closeDesktop(); }
        });
        document.addEventListener("click", function (e) {
          if (!desktopDrop.contains(e.target)) { closeDesktop(); }
        });
        document.addEventListener("keydown", function (e) {
          if (e.key === "Escape" && dt.getAttribute("aria-expanded") === "true") {
            closeDesktop();
            dt.focus();
          }
        });
      }
      desktopDrop.dataset.dropInitialized = "true";
    }

    // Mobile Cidades sub-dropdown
    if (mobileDrop && mobileDrop.dataset.dropInitialized !== "true") {
      var mt = mobileDrop.querySelector(".nn-tb-m-drop-toggle");
      var mm = mobileDrop.querySelector(".nn-tb-m-drop-menu");
      if (mt && mm) {
        mt.addEventListener("click", function () {
          if (mm.hasAttribute("hidden")) {
            mm.removeAttribute("hidden");
            mt.setAttribute("aria-expanded", "true");
          } else {
            mm.setAttribute("hidden", "");
            mt.setAttribute("aria-expanded", "false");
          }
        });
      }
      mobileDrop.dataset.dropInitialized = "true";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTopbar);
  } else {
    initTopbar();
  }
})();
