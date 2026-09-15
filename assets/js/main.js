"use strict";

/* =========================================================
   IMPERIUS WEBSITE - MAIN.JS
   Discord OAuth + Dashboard + UI
========================================================= */

var API_URL = "https://imperius-api.kursatcoskunerr.workers.dev";
var SESSION_KEY = "imperius_session";

var currentUser = null;


/* =========================================================
   HELPERS
========================================================= */

function getElement(id) {
  return document.getElementById(id);
}

function escapeHTML(value) {
  var div = document.createElement("div");
  div.textContent = value == null ? "" : String(value);
  return div.innerHTML;
}


/* =========================================================
   NAVBAR
========================================================= */

function setupNavbar() {
  var navbar = getElement("navbar");

  if (!navbar) {
    return;
  }

  function updateNavbar() {
    if (window.scrollY > 30) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }

  updateNavbar();
  window.addEventListener("scroll", updateNavbar);
}


/* =========================================================
   MOBILE MENU
========================================================= */

function setupMobileMenu() {
  var mobileMenu = getElement("mobileMenu");
  var navMenu = getElement("navMenu");

  if (!mobileMenu || !navMenu) {
    return;
  }

  mobileMenu.addEventListener("click", function () {
    navMenu.classList.toggle("active");
  });

  var links = navMenu.getElementsByTagName("a");

  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener("click", function () {
      navMenu.classList.remove("active");
    });
  }
}


/* =========================================================
   REVEAL ANIMATIONS
========================================================= */

function setupRevealAnimations() {
  var elements = document.querySelectorAll(".reveal");

  if (!elements.length) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    for (var i = 0; i < elements.length; i++) {
      elements[i].classList.add("visible");
    }

    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          entries[i].target.classList.add("visible");
          observer.unobserve(entries[i].target);
        }
      }
    },
    {
      threshold: 0.12
    }
  );

  for (var j = 0; j < elements.length; j++) {
    observer.observe(elements[j]);
  }
}


/* =========================================================
   COMMAND SEARCH
========================================================= */

function setupCommandSearch() {
  var search = getElement("commandSearch");

  if (!search) {
    return;
  }

  search.addEventListener("input", function () {
    var query = search.value.toLowerCase().trim();

    var cards = document.querySelectorAll(".command-card");

    for (var i = 0; i < cards.length; i++) {
      var searchable =
        (
          cards[i].getAttribute("data-command") +
          " " +
          cards[i].textContent
        ).toLowerCase();

      if (searchable.indexOf(query) !== -1) {
        cards[i].style.display = "";
      } else {
        cards[i].style.display = "none";
      }
    }
  });
}


/* =========================================================
   DISCORD LOGIN
========================================================= */

function loginWithDiscord() {
  window.location.href = API_URL + "/auth/discord";
}


/* =========================================================
   RECEIVE OAUTH SESSION
========================================================= */

function receiveOAuthSession() {
  var hash = window.location.hash || "";
  var prefix = "#imperius_session=";

  if (hash.indexOf(prefix) !== 0) {
    return null;
  }

  var token = hash.substring(prefix.length);

  try {
    token = decodeURIComponent(token);
  } catch (error) {
    console.log("Session decode error:", error);
  }

  /*
   * URL'deki session bilgisini hemen kaldır.
   * Böylece adres çubuğunda görünmez.
   */
  try {
    window.history.replaceState(
      null,
      document.title,
      window.location.pathname + window.location.search
    );
  } catch (error) {
    console.log("URL cleanup error:", error);
  }

  /*
   * SessionStorage'a kaydet.
   */
  try {
    window.sessionStorage.setItem(SESSION_KEY, token);
  } catch (error) {
    console.log("Session storage error:", error);
  }

  return token;
}


/* =========================================================
   GET STORED SESSION
========================================================= */

function getStoredSession() {
  try {
    return window.sessionStorage.getItem(SESSION_KEY);
  } catch (error) {
    return null;
  }
}


/* =========================================================
   CLEAR SESSION
========================================================= */

function clearSession() {
  try {
    window.sessionStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.log("Session clear error:", error);
  }
}


/* =========================================================
   CHECK DISCORD SESSION
========================================================= */

function checkDiscordSession(tokenFromHash) {
  var token = tokenFromHash || getStoredSession();

  if (!token) {
    setLoggedOutState();
    return;
  }

  fetch(API_URL + "/api/me", {
    method: "GET",

    headers: {
      Accept: "application/json",
      Authorization: "Bearer " + token
    },

    cache: "no-store"
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Session invalid");
      }

      return response.json();
    })

    .then(function (data) {
      if (!data || !data.success || !data.user) {
        throw new Error("User data missing");
      }

      currentUser = data.user;

      setLoggedInState(data.user);
    })

    .catch(function (error) {
      console.log("Discord session error:", error);

      clearSession();
      currentUser = null;

      setLoggedOutState();
    });
}


/* =========================================================
   AVATAR URL
========================================================= */

function getDiscordAvatarURL(user) {
  if (!user) {
    return "";
  }

  if (user.avatar_url) {
    return user.avatar_url;
  }

  if (user.avatarUrl) {
    return user.avatarUrl;
  }

  if (user.avatar && user.id) {
    var extension = "png";

    if (
      typeof user.avatar === "string" &&
      user.avatar.indexOf("a_") === 0
    ) {
      extension = "gif";
    }

    return (
      "https://cdn.discordapp.com/avatars/" +
      encodeURIComponent(user.id) +
      "/" +
      encodeURIComponent(user.avatar) +
      "." +
      extension +
      "?size=256"
    );
  }

  return "";
}


/* =========================================================
   USER DISPLAY NAME
========================================================= */

function getDisplayName(user) {
  if (!user) {
    return "Imperius Yurttaşı";
  }

  return (
    user.display_name ||
    user.displayName ||
    user.global_name ||
    user.globalName ||
    user.username ||
    "Imperius Yurttaşı"
  );
}


/* =========================================================
   USERNAME
========================================================= */

function getUsername(user) {
  if (!user) {
    return "";
  }

  return user.username || "";
}


/* =========================================================
   RENDER DISCORD PROFILE
========================================================= */

function renderDiscordProfile(user) {
  /*
   * Eski JS sürümünün aşağıya eklediği fazladan
   * discordProfile kutusu varsa tamamen kaldır.
   */
  var oldProfile = getElement("discordProfile");

  if (oldProfile && oldProfile.parentNode) {
    oldProfile.parentNode.removeChild(oldProfile);
  }

  var dashboard = getElement("dashboard");

  if (!dashboard) {
    return;
  }

  var profileDemo = dashboard.querySelector(".profile-demo");

  if (!profileDemo) {
    return;
  }

  var avatarPlaceholder =
    profileDemo.querySelector(".avatar-placeholder");

  var infoContainer =
    profileDemo.querySelector(".profile-info");

  if (!infoContainer) {
    var children = profileDemo.children;

    if (children.length > 1) {
      infoContainer = children[1];
    }
  }

  var displayName = getDisplayName(user);
  var username = getUsername(user);
  var avatarURL = getDiscordAvatarURL(user);

  /*
   * Avatar
   */
  if (avatarPlaceholder) {
    if (avatarURL) {
      avatarPlaceholder.innerHTML =
        '<img src="' +
        escapeHTML(avatarURL) +
        '" alt="' +
        escapeHTML(displayName) +
        '" style="' +
        "width:100%;" +
        "height:100%;" +
        "object-fit:cover;" +
        "border-radius:50%;" +
        '">';
    } else {
      avatarPlaceholder.textContent =
        displayName.charAt(0).toUpperCase();
    }
  }

  /*
   * Kullanıcı bilgileri
   */
  if (infoContainer) {
    var small = infoContainer.querySelector("small");
    var title = infoContainer.querySelector("h3");
    var paragraph = infoContainer.querySelector("p");

    if (small) {
      small.textContent = "IMPERIUS YURTTAŞI";
    }

    if (title) {
      title.textContent = displayName;
    }

    if (paragraph) {
      if (username) {
        paragraph.innerHTML =
          "@" +
          escapeHTML(username) +
          '<br><span class="verified-text">' +
          "DISCORD İLE DOĞRULANDI" +
          "</span>";
      } else {
        paragraph.innerHTML =
          '<span class="verified-text">' +
          "DISCORD İLE DOĞRULANDI" +
          "</span>";
      }
    }
  }
}


/* =========================================================
   RESET PROFILE
========================================================= */

function resetDiscordProfile() {
  var oldProfile = getElement("discordProfile");

  if (oldProfile && oldProfile.parentNode) {
    oldProfile.parentNode.removeChild(oldProfile);
  }

  var dashboard = getElement("dashboard");

  if (!dashboard) {
    return;
  }

  var profileDemo = dashboard.querySelector(".profile-demo");

  if (!profileDemo) {
    return;
  }

  var avatarPlaceholder =
    profileDemo.querySelector(".avatar-placeholder");

  var infoContainer =
    profileDemo.querySelector(".profile-info");

  if (!infoContainer) {
    var children = profileDemo.children;

    if (children.length > 1) {
      infoContainer = children[1];
    }
  }

  if (avatarPlaceholder) {
    avatarPlaceholder.innerHTML = "";
    avatarPlaceholder.textContent = "I";
  }

  if (infoContainer) {
    var small = infoContainer.querySelector("small");
    var title = infoContainer.querySelector("h3");
    var paragraph = infoContainer.querySelector("p");

    if (small) {
      small.textContent = "IMPERIUS YURTTAŞI";
    }

    if (title) {
      title.textContent = "DISCORD İLE GİRİŞ YAP";
    }

    if (paragraph) {
      paragraph.textContent =
        "Profil bilgilerin giriş yaptıktan sonra burada görüntülenecek.";
    }
  }
}


/* =========================================================
   LOGGED IN STATE
========================================================= */

function setLoggedInState(user) {
  renderDiscordProfile(user);

  var loginButton = getElement("loginButton");
  var dashboardLogin = getElement("dashboardLogin");

  var displayName = getDisplayName(user);

  /*
   * Navbar butonu
   */
  if (loginButton) {
    loginButton.textContent = displayName;

    loginButton.onclick = function () {
      var dashboard = getElement("dashboard");

      if (dashboard) {
        dashboard.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    };
  }

  /*
   * Dashboard çıkış butonu
   */
  if (dashboardLogin) {
    dashboardLogin.textContent = "Çıkış Yap";

    dashboardLogin.onclick = function () {
      logout();
    };
  }
}


/* =========================================================
   LOGGED OUT STATE
========================================================= */

function setLoggedOutState() {
  resetDiscordProfile();

  var loginButton = getElement("loginButton");
  var dashboardLogin = getElement("dashboardLogin");

  if (loginButton) {
    loginButton.textContent = "Discord ile Giriş";

    loginButton.onclick = function () {
      loginWithDiscord();
    };
  }

  if (dashboardLogin) {
    dashboardLogin.textContent =
      "Discord ile Giriş Yap";

    dashboardLogin.onclick = function () {
      loginWithDiscord();
    };
  }
}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {
  clearSession();

  currentUser = null;

  try {
    window.history.replaceState(
      null,
      document.title,
      window.location.pathname + window.location.search
    );
  } catch (error) {
    console.log("Logout URL cleanup error:", error);
  }

  setLoggedOutState();
}


/* =========================================================
   LOGIN BUTTONS
========================================================= */

function setupLoginButtons() {
  var loginButton = getElement("loginButton");
  var dashboardLogin = getElement("dashboardLogin");

  if (loginButton) {
    loginButton.onclick = function () {
      loginWithDiscord();
    };
  }

  if (dashboardLogin) {
    dashboardLogin.onclick = function () {
      loginWithDiscord();
    };
  }
}


/* =========================================================
   START
========================================================= */

function startImperiusWebsite() {
  setupNavbar();
  setupMobileMenu();
  setupRevealAnimations();
  setupCommandSearch();
  setupLoginButtons();

  /*
   * Discord OAuth dönüşü varsa token burada alınır.
   */
  var oauthToken = receiveOAuthSession();

  /*
   * Discord session kontrol edilir.
   */
  checkDiscordSession(oauthToken);
}


/* =========================================================
   DOM READY
========================================================= */

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    startImperiusWebsite
  );
} else {
  startImperiusWebsite();
}
