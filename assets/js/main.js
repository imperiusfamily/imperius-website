const API_URL =
  "https://imperius-api.kursatcoskunerr.workers.dev";

const SESSION_KEY =
  "imperius_session";


// ======================================================
// ELEMENTS
// ======================================================

const navbar =
  document.getElementById("navbar");

const mobileMenu =
  document.getElementById("mobileMenu");

const navMenu =
  document.getElementById("navMenu");

const search =
  document.getElementById("commandSearch");


// ======================================================
// NAVBAR
// ======================================================

window.addEventListener(
  "scroll",
  () => {
    navbar?.classList.toggle(
      "scrolled",
      window.scrollY > 40
    );
  }
);


mobileMenu?.addEventListener(
  "click",
  () => {
    navMenu?.classList.toggle(
      "open"
    );
  }
);


document
  .querySelectorAll("#navMenu a")
  .forEach(link => {

    link.addEventListener(
      "click",
      () => {
        navMenu?.classList.remove(
          "open"
        );
      }
    );

  });


// ======================================================
// ANIMATIONS
// ======================================================

const observer =
  new IntersectionObserver(
    entries => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          entry.target.classList.add(
            "visible"
          );

          observer.unobserve(
            entry.target
          );
        }

      });

    },
    {
      threshold: 0.12
    }
  );


document
  .querySelectorAll(".reveal")
  .forEach(element => {

    observer.observe(
      element
    );

  });


// ======================================================
// COMMAND SEARCH
// ======================================================

search?.addEventListener(
  "input",
  event => {

    const value =
      event.target.value
        .toLocaleLowerCase("tr-TR")
        .trim();


    document
      .querySelectorAll(".command-card")
      .forEach(card => {

        const keywords =
          (card.dataset.command || "")
            .toLocaleLowerCase("tr-TR");

        const text =
          card.innerText
            .toLocaleLowerCase("tr-TR");


        card.style.display =
          keywords.includes(value) ||
          text.includes(value)
            ? ""
            : "none";

      });

  });


// ======================================================
// LOGIN
// ======================================================

function loginWithDiscord() {

  window.location.href =
    `${API_URL}/auth/discord`;

}


// ======================================================
// RECEIVE SESSION FROM OAUTH
// ======================================================

function receiveOAuthSession() {

  const hash =
    window.location.hash;


  if (
    !hash.startsWith(
      "#imperius_session="
    )
  ) {
    return false;
  }


  try {

    const encodedToken =
      hash.substring(
        "#imperius_session=".length
      );


    const token =
      decodeURIComponent(
        encodedToken
      );


    if (!token) {
      return false;
    }


    /*
     * sessionStorage:
     *
     * - sekmeye özel
     * - tarayıcı kapatılınca gider
     * - localStorage kullanılmıyor
     */

    sessionStorage.setItem(
      SESSION_KEY,
      token
    );


    /*
     * Tokenı hemen adres çubuğundan
     * kaldır.
     */

    history.replaceState(
      null,
      document.title,
      window.location.pathname +
      window.location.search
    );


    return true;

  } catch (error) {

    console.error(
      "OAuth session error:",
      error
    );

    return false;
  }

}


// ======================================================
// SESSION
// ======================================================

function getSessionToken() {

  return sessionStorage.getItem(
    SESSION_KEY
  );

}


// ======================================================
// CHECK USER
// ======================================================

async function checkDiscordSession() {

  const token =
    getSessionToken();


  if (!token) {

    setLoggedOutState();

    return;
  }


  try {

    const response =
      await fetch(
        `${API_URL}/api/me`,
        {
          method: "GET",

          headers: {
            Accept:
              "application/json",

            Authorization:
              `Bearer ${token}`
          }
        }
      );


    if (!response.ok) {

      sessionStorage.removeItem(
        SESSION_KEY
      );

      setLoggedOutState();

      return;
    }


    const data =
      await response.json();


    if (
      !data.authenticated ||
      !data.user
    ) {

      sessionStorage.removeItem(
        SESSION_KEY
      );

      setLoggedOutState();

      return;
    }


    setLoggedInState(
      data.user
    );


  } catch (error) {

    console.error(
      "Imperius API error:",
      error
    );

    setLoggedOutState();

  }

}


// ======================================================
// LOGGED IN
// ======================================================

function setLoggedInState(user) {

  const loginButton =
    document.getElementById(
      "loginButton"
    );

  const dashboardLogin =
    document.getElementById(
      "dashboardLogin"
    );


  if (loginButton) {

    const replacement =
      loginButton.cloneNode(true);

    replacement.textContent =
      user.username ||
      "Hesabım";

    loginButton.replaceWith(
      replacement
    );


    replacement.addEventListener(
      "click",
      () => {

        document
          .getElementById("dashboard")
          ?.scrollIntoView({
            behavior: "smooth"
          });

      }
    );

  }


  if (dashboardLogin) {

    const replacement =
      dashboardLogin.cloneNode(true);

    replacement.textContent =
      "Çıkış Yap";

    dashboardLogin.replaceWith(
      replacement
    );


    replacement.addEventListener(
      "click",
      logout
    );

  }


  renderDiscordProfile(
    user
  );

}


// ======================================================
// PROFILE
// ======================================================

function renderDiscordProfile(user) {

  const dashboard =
    document.getElementById(
      "dashboard"
    );


  if (!dashboard) {
    return;
  }


  let profile =
    document.getElementById(
      "discordProfile"
    );


  if (!profile) {

    profile =
      document.createElement(
        "div"
      );

    profile.id =
      "discordProfile";


    profile.style.cssText = `
      display:flex;
      align-items:center;
      gap:16px;

      width:100%;
      max-width:760px;

      margin:0 auto 30px;
      padding:20px;

      box-sizing:border-box;

      border:
        1px solid
        rgba(212,175,55,.35);

      background:
        rgba(10,7,8,.92);

      box-shadow:
        0 20px 60px
        rgba(0,0,0,.25);
    `;


    const container =
      dashboard.querySelector(
        ".container"
      ) || dashboard;


    const grid =
      container.querySelector(
        ".dashboard-grid"
      );


    if (grid) {

      grid.parentNode.insertBefore(
        profile,
        grid
      );

    } else {

      container.appendChild(
        profile
      );

    }

  }


  profile.innerHTML = "";


  // AVATAR

  const avatar =
    document.createElement(
      "img"
    );


  avatar.src =
    user.avatar ||
    "https://cdn.discordapp.com/embed/avatars/0.png";


  avatar.alt =
    "Discord Avatarı";


  avatar.style.cssText = `
    width:68px;
    height:68px;

    border-radius:50%;

    object-fit:cover;

    border:
      2px solid
      #c2a24d;

    flex-shrink:0;
  `;


  // INFO

  const info =
    document.createElement(
      "div"
    );


  const name =
    document.createElement(
      "strong"
    );


  name.textContent =
    user.username ||
    "Imperius Üyesi";


  name.style.cssText = `
    display:block;

    margin-bottom:6px;

    color:#d4b75e;

    font-size:20px;
  `;


  const username =
    document.createElement(
      "div"
    );


  username.textContent =
    user.discordUsername
      ? `@${user.discordUsername}`
      : "Discord hesabı bağlı";


  username.style.cssText = `
    color:#aaa;
    font-size:14px;
  `;


  const status =
    document.createElement(
      "div"
    );


  status.textContent =
    "Discord ile doğrulandı";


  status.style.cssText = `
    margin-top:6px;

    color:#8fa98c;

    font-size:12px;

    text-transform:uppercase;

    letter-spacing:1px;
  `;


  info.appendChild(
    name
  );

  info.appendChild(
    username
  );

  info.appendChild(
    status
  );


  profile.appendChild(
    avatar
  );

  profile.appendChild(
    info
  );

}


// ======================================================
// LOGGED OUT
// ======================================================

function setLoggedOutState() {

  document
    .getElementById(
      "discordProfile"
    )
    ?.remove();


  setupLoginButton(
    "loginButton",
    "Discord ile Giriş"
  );


  setupLoginButton(
    "dashboardLogin",
    "Discord ile Giriş Yap"
  );

}


// ======================================================
// LOGIN BUTTON
// ======================================================

function setupLoginButton(
  id,
  text
) {

  const button =
    document.getElementById(
      id
    );


  if (!button) {
    return;
  }


  const replacement =
    button.cloneNode(true);


  replacement.textContent =
    text;


  button.replaceWith(
    replacement
  );


  replacement.addEventListener(
    "click",
    loginWithDiscord
  );

}


// ======================================================
// LOGOUT
// ======================================================

function logout() {

  sessionStorage.removeItem(
    SESSION_KEY
  );


  setLoggedOutState();


  window.location.hash = "";


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


// ======================================================
// START
// ======================================================

async function startImperius() {

  /*
   * Önce OAuth dönüşünde token varsa
   * sessionStorage'a al.
   */

  receiveOAuthSession();


  /*
   * Sonra kullanıcıyı doğrula.
   */

  await checkDiscordSession();

}


if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    startImperius
  );

} else {

  startImperius();

}
