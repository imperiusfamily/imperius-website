"use strict";

/* =========================================================
   IMPERIUS WEBSITE - MAIN.JS
   FINAL AUTH / PROFILE VERSION
========================================================= */

var API_URL = "https://imperius-api.kursatcoskunerr.workers.dev";
var SESSION_KEY = "imperius_session";

var currentUser = null;
var memorySessionToken = null;


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
      var commandData =
        cards[i].getAttribute("data-command") || "";

      var searchable =
        (
          commandData +
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
   LOGIN
========================================================= */

function loginWithDiscord() {
  window.location.href =
    API_URL + "/auth/discord";
}


/* =========================================================
   SESSION STORAGE
========================================================= */

function saveSession(token) {
  if (!token) {
    return;
  }

  memorySessionToken = token;

  try {
    window.sessionStorage.setItem(
      SESSION_KEY,
      token
    );
  } catch (error) {
    console.log(
      "sessionStorage kullanılamadı:",
      error
    );
  }
}


function getStoredSession() {
  /*
   * Önce mevcut sayfadaki token.
   */
  if (memorySessionToken) {
    return memorySessionToken;
  }

  /*
   * Sonra Safari sessionStorage.
   */
  try {
    var token =
      window.sessionStorage.getItem(
        SESSION_KEY
      );

    if (token) {
      memorySessionToken = token;
      return token;
    }
  } catch (error) {
    console.log(
      "sessionStorage okunamadı:",
      error
    );
  }

  return null;
}


function clearSession() {
  memorySessionToken = null;

  try {
    window.sessionStorage.removeItem(
      SESSION_KEY
    );
  } catch (error) {
    console.log(
      "Session silinemedi:",
      error
    );
  }
}


/* =========================================================
   OAUTH RETURN
========================================================= */

function receiveOAuthSession() {
  var hash = window.location.hash || "";
  var prefix = "#imperius_session=";

  if (hash.indexOf(prefix) !== 0) {
    return null;
  }

  var token =
    hash.substring(prefix.length);

  try {
    token = decodeURIComponent(token);
  } catch (error) {
    console.log(
      "Token decode hatası:",
      error
    );
  }

  /*
   * ÖNEMLİ:
   * Tokenı önce belleğe + sessionStorage'a alıyoruz.
   */
  saveSession(token);

  /*
   * Sonra adres çubuğundan kaldırıyoruz.
   */
  try {
    window.history.replaceState(
      null,
      document.title,
      window.location.pathname +
        window.location.search
    );
  } catch (error) {
    console.log(
      "URL temizleme hatası:",
      error
    );
  }

  return token;
}


/* =========================================================
   DISCORD USER HELPERS
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


function getUsername(user) {
  if (!user) {
    return "";
  }

  return user.username || "";
}


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
   REMOVE OLD DUPLICATE PROFILE
========================================================= */

function removeOldDiscordProfile() {
  var oldProfile =
    getElement("discordProfile");

  if (
    oldProfile &&
    oldProfile.parentNode
  ) {
    oldProfile.parentNode.removeChild(
      oldProfile
    );
  }
}


/* =========================================================
   RENDER LOGGED-IN PROFILE
========================================================= */

function renderDiscordProfile(user) {
  removeOldDiscordProfile();

  var dashboard =
    getElement("dashboard");

  if (!dashboard) {
    return;
  }

  var profileDemo =
    dashboard.querySelector(
      ".profile-demo"
    );

  if (!profileDemo) {
    return;
  }

  var avatarPlaceholder =
    profileDemo.querySelector(
      ".avatar-placeholder"
    );

  var infoContainer =
    profileDemo.querySelector(
      ".profile-info"
    );

  /*
   * Eski index.html sürümünde
   * profile-info classı yoksa ikinci divi kullan.
   */
  if (!infoContainer) {
    var children =
      profileDemo.children;

    if (children.length > 1) {
      infoContainer = children[1];
    }
  }

  var displayName =
    getDisplayName(user);

  var username =
    getUsername(user);

  var avatarURL =
    getDiscordAvatarURL(user);


  /* AVATAR */

  if (avatarPlaceholder) {
    avatarPlaceholder.innerHTML = "";

    if (avatarURL) {
      var avatar =
        document.createElement("img");

      avatar.src = avatarURL;
      avatar.alt = displayName;

      avatar.style.width = "100%";
      avatar.style.height = "100%";
      avatar.style.objectFit = "cover";
      avatar.style.borderRadius = "50%";

      avatarPlaceholder.appendChild(
        avatar
      );
    } else {
      avatarPlaceholder.textContent =
        displayName
          .charAt(0)
          .toUpperCase();
    }
  }


  /* USER INFO */

  if (infoContainer) {
    var small =
      infoContainer.querySelector(
        "small"
      );

    var title =
      infoContainer.querySelector(
        "h3"
      );

    var paragraph =
      infoContainer.querySelector(
        "p"
      );

    if (small) {
      small.textContent =
        "IMPERIUS YURTTAŞI";
    }

    if (title) {
      title.textContent =
        displayName;
    }

    if (paragraph) {
      paragraph.innerHTML = "";

      if (username) {
        var usernameLine =
          document.createElement("span");

        usernameLine.textContent =
          "@" + username;

        paragraph.appendChild(
          usernameLine
        );

        paragraph.appendChild(
          document.createElement("br")
        );
      }

      var verified =
        document.createElement("span");

      verified.className =
        "verified-text";

      verified.textContent =
        "DISCORD İLE DOĞRULANDI";

      paragraph.appendChild(
        verified
      );
    }
  }
}


/* =========================================================
   RESET PROFILE
========================================================= */

function resetDiscordProfile() {
  removeOldDiscordProfile();

  var dashboard =
    getElement("dashboard");

  if (!dashboard) {
    return;
  }

  var profileDemo =
    dashboard.querySelector(
      ".profile-demo"
    );

  if (!profileDemo) {
    return;
  }

  var avatarPlaceholder =
    profileDemo.querySelector(
      ".avatar-placeholder"
    );

  var infoContainer =
    profileDemo.querySelector(
      ".profile-info"
    );

  if (!infoContainer) {
    var children =
      profileDemo.children;

    if (children.length > 1) {
      infoContainer = children[1];
    }
  }

  if (avatarPlaceholder) {
    avatarPlaceholder.innerHTML = "";
    avatarPlaceholder.textContent = "I";
  }

  if (infoContainer) {
    var small =
      infoContainer.querySelector(
        "small"
      );

    var title =
      infoContainer.querySelector(
        "h3"
      );

    var paragraph =
      infoContainer.querySelector(
        "p"
      );

    if (small) {
      small.textContent =
        "IMPERIUS YURTTAŞI";
    }

    if (title) {
      title.textContent =
        "DISCORD İLE GİRİŞ YAP";
    }

    if (paragraph) {
      paragraph.textContent =
        "Profil bilgilerin giriş yaptıktan sonra burada görüntülenecek.";
    }
  }
}


/* =========================================================
   LOGGED IN UI
========================================================= */

function setLoggedInState(user) {
  currentUser = user;

  renderDiscordProfile(user);

  var loginButton =
    getElement("loginButton");

  var dashboardLogin =
    getElement("dashboardLogin");

  var displayName =
    getDisplayName(user);


  if (loginButton) {
    loginButton.textContent =
      displayName;

    loginButton.onclick =
      function () {
        var dashboard =
          getElement("dashboard");

        if (dashboard) {
          dashboard.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      };
  }


  if (dashboardLogin) {
    dashboardLogin.textContent =
      "Çıkış Yap";

    dashboardLogin.onclick =
      function () {
        logout();
      };
  }
}


/* =========================================================
   LOGGED OUT UI
========================================================= */

function setLoggedOutState() {
  currentUser = null;

  resetDiscordProfile();

  var loginButton =
    getElement("loginButton");

  var dashboardLogin =
    getElement("dashboardLogin");


  if (loginButton) {
    loginButton.textContent =
      "Discord ile Giriş";

    loginButton.onclick =
      loginWithDiscord;
  }


  if (dashboardLogin) {
    dashboardLogin.textContent =
      "Discord ile Giriş Yap";

    dashboardLogin.onclick =
      loginWithDiscord;
  }
}


/* =========================================================
   CHECK SESSION
========================================================= */

function checkDiscordSession(
  tokenFromOAuth
) {
  var token =
    tokenFromOAuth ||
    getStoredSession();

  if (!token) {
    setLoggedOutState();
    return;
  }

  /*
   * Token varsa API'den kullanıcıyı çek.
   */

  fetch(
    API_URL + "/api/me",
    {
      method: "GET",

      headers: {
        Accept: "application/json",
        Authorization:
          "Bearer " + token
      },

      cache: "no-store"
    }
  )
    .then(function (response) {

      /*
       * 401 / 403 gerçekten geçersiz
       * session anlamına gelir.
       */
      if (
        response.status === 401 ||
        response.status === 403
      ) {
        var authError =
          new Error(
            "AUTH_INVALID"
          );

        authError.authInvalid = true;

        throw authError;
      }

      if (!response.ok) {
        throw new Error(
          "API_ERROR_" +
          response.status
        );
      }

      return response.json();
    })

    .then(function (data) {

      if (
        !data ||
        !data.success ||
        !data.user
      ) {
        throw new Error(
          "USER_DATA_MISSING"
        );
      }

      /*
       * Session geçerli.
       */
      saveSession(token);

      setLoggedInState(
        data.user
      );
    })

    .catch(function (error) {

      console.log(
        "Discord session kontrolü:",
        error
      );

      /*
       * SADECE Worker açıkça
       * 401/403 döndürürse tokenı siliyoruz.
       *
       * Ağ/CORS/Safari gibi geçici
       * hatalarda session artık silinmiyor.
       */
      if (error.authInvalid) {
        clearSession();
        setLoggedOutState();
        return;
      }

      /*
       * Tokenı koru.
       * Kullanıcıyı zorla logout yapma.
       */
      saveSession(token);

      /*
       * Henüz kullanıcı verimiz yoksa
       * arayüzü olduğu gibi bırakıyoruz.
       */
      if (currentUser) {
        setLoggedInState(
          currentUser
        );
      }
    });
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
      window.location.pathname +
        window.location.search
    );
  } catch (error) {
    console.log(
      "Logout URL cleanup:",
      error
    );
  }

  setLoggedOutState();
}


/* =========================================================
   INITIAL LOGIN BUTTONS
========================================================= */

function setupLoginButtons() {
  var loginButton =
    getElement("loginButton");

  var dashboardLogin =
    getElement("dashboardLogin");


  if (loginButton) {
    loginButton.onclick =
      loginWithDiscord;
  }


  if (dashboardLogin) {
    dashboardLogin.onclick =
      loginWithDiscord;
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
   * OAuth'tan yeni token geldiyse
   * doğrudan burada yakalanır.
   */
  var oauthToken =
    receiveOAuthSession();

  /*
   * Token kontrolü.
   */
  checkDiscordSession(
    oauthToken
  );
}


/* =========================================================
   DOM READY
========================================================= */

if (
  document.readyState === "loading"
) {
  document.addEventListener(
    "DOMContentLoaded",
    startImperiusWebsite
  );
} else {
  startImperiusWebsite();
}
