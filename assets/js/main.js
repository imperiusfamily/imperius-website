const API_URL = "https://imperius-api.kursatcoskunerr.workers.dev";

const navbar = document.getElementById("navbar");
const mobileMenu = document.getElementById("mobileMenu");
const navMenu = document.getElementById("navMenu");
const search = document.getElementById("commandSearch");


// ======================================================
// NAVBAR
// ======================================================

window.addEventListener("scroll", () => {
  if (navbar) {
    navbar.classList.toggle("scrolled", window.scrollY > 40);
  }
});

mobileMenu?.addEventListener("click", () => {
  navMenu?.classList.toggle("open");
});

document.querySelectorAll("#navMenu a").forEach(link => {
  link.addEventListener("click", () => {
    navMenu?.classList.remove("open");
  });
});


// ======================================================
// REVEAL ANIMATIONS
// ======================================================

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12
  }
);

document.querySelectorAll(".reveal").forEach(element => {
  observer.observe(element);
});


// ======================================================
// COMMAND SEARCH
// ======================================================

search?.addEventListener("input", event => {
  const value = event.target.value
    .toLocaleLowerCase("tr-TR")
    .trim();

  document.querySelectorAll(".command-card").forEach(card => {
    const keywords = (card.dataset.command || "")
      .toLocaleLowerCase("tr-TR");

    const text = card.innerText
      .toLocaleLowerCase("tr-TR");

    card.style.display =
      keywords.includes(value) || text.includes(value)
        ? ""
        : "none";
  });
});


// ======================================================
// DISCORD LOGIN
// ======================================================

function loginWithDiscord() {
  window.location.href = `${API_URL}/auth/discord`;
}

document
  .getElementById("loginButton")
  ?.addEventListener("click", loginWithDiscord);

document
  .getElementById("dashboardLogin")
  ?.addEventListener("click", loginWithDiscord);


// ======================================================
// CHECK SESSION
// ======================================================

async function checkDiscordSession() {
  try {
    const response = await fetch(`${API_URL}/api/me`, {
      method: "GET",

      credentials: "include",

      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      setLoggedOutState();
      return;
    }

    const data = await response.json();

    if (!data.authenticated || !data.user) {
      setLoggedOutState();
      return;
    }

    setLoggedInState(data.user);

  } catch (error) {
    console.error("Imperius API bağlantı hatası:", error);

    setLoggedOutState();
  }
}


// ======================================================
// LOGGED-IN UI
// ======================================================

function setLoggedInState(user) {
  const loginButton =
    document.getElementById("loginButton");

  const dashboardLogin =
    document.getElementById("dashboardLogin");


  if (loginButton) {
    loginButton.textContent = user.username || "Discord";
    loginButton.onclick = null;

    loginButton.addEventListener(
      "click",
      scrollToDashboard,
      { once: true }
    );
  }


  if (dashboardLogin) {
    dashboardLogin.textContent = "Çıkış Yap";

    dashboardLogin.onclick = null;

    dashboardLogin.replaceWith(
      dashboardLogin.cloneNode(true)
    );

    const newLogoutButton =
      document.getElementById("dashboardLogin");

    newLogoutButton?.addEventListener(
      "click",
      logout
    );
  }


  createDiscordProfile(user);
}


// ======================================================
// DISCORD PROFILE
// ======================================================

function createDiscordProfile(user) {
  const dashboard =
    document.getElementById("dashboard");

  if (!dashboard) {
    return;
  }


  let profile =
    document.getElementById("discordProfile");


  if (!profile) {
    profile = document.createElement("div");

    profile.id = "discordProfile";

    profile.style.cssText = `
      display:flex;
      align-items:center;
      gap:16px;
      margin:0 auto 30px;
      max-width:740px;
      padding:18px 20px;
      border:1px solid rgba(190,150,55,.35);
      background:rgba(10,7,8,.85);
      box-sizing:border-box;
    `;


    const dashboardInner =
      dashboard.querySelector(".container") ||
      dashboard;


    const firstSuitableElement =
      dashboardInner.querySelector(
        ".dashboard-grid, .dashboard-card, .section-title"
      );


    if (firstSuitableElement) {
      firstSuitableElement.parentNode.insertBefore(
        profile,
        firstSuitableElement
      );
    } else {
      dashboardInner.prepend(profile);
    }
  }


  profile.innerHTML = "";


  const avatar = document.createElement("img");

  avatar.alt = "Discord Avatarı";

  avatar.style.cssText = `
    width:64px;
    height:64px;
    border-radius:50%;
    object-fit:cover;
    border:2px solid #b89a45;
    flex-shrink:0;
  `;


  if (user.avatar) {
    avatar.src = user.avatar;
  } else {
    avatar.src =
      "https://cdn.discordapp.com/embed/avatars/0.png";
  }


  const information =
    document.createElement("div");


  const title =
    document.createElement("strong");

  title.textContent =
    user.username || "Imperius Üyesi";

  title.style.cssText = `
    display:block;
    color:#d4b75e;
    font-size:20px;
    margin-bottom:5px;
  `;


  const username =
    document.createElement("span");

  username.textContent =
    user.discordUsername
      ? `@${user.discordUsername}`
      : "Discord hesabı bağlı";

  username.style.cssText = `
    color:#aaa;
    font-size:14px;
  `;


  information.appendChild(title);
  information.appendChild(username);

  profile.appendChild(avatar);
  profile.appendChild(information);
}


// ======================================================
// LOGGED-OUT UI
// ======================================================

function setLoggedOutState() {
  document
    .getElementById("discordProfile")
    ?.remove();


  const loginButton =
    document.getElementById("loginButton");

  const dashboardLogin =
    document.getElementById("dashboardLogin");


  if (loginButton) {
    loginButton.textContent = "Discord ile Giriş";

    loginButton.onclick = loginWithDiscord;
  }


  if (dashboardLogin) {
    dashboardLogin.textContent =
      "Discord ile Giriş Yap";

    dashboardLogin.onclick =
      loginWithDiscord;
  }
}


// ======================================================
// LOGOUT
// ======================================================

function logout() {
  window.location.href =
    `${API_URL}/auth/logout`;
}


// ======================================================
// DASHBOARD
// ======================================================

function scrollToDashboard() {
  document
    .getElementById("dashboard")
    ?.scrollIntoView({
      behavior: "smooth"
    });
}


// ======================================================
// START
// ======================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {
    checkDiscordSession();
  }
);
