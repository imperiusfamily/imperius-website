const navbar = document.getElementById("navbar");
const mobileMenu = document.getElementById("mobileMenu");
const navMenu = document.getElementById("navMenu");
const search = document.getElementById("commandSearch");

window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 40);
});

mobileMenu.addEventListener("click", () => {
  navMenu.classList.toggle("open");
});

document.querySelectorAll("#navMenu a").forEach(link => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("open");
  });
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12
});

document.querySelectorAll(".reveal").forEach(element => {
  observer.observe(element);
});

search.addEventListener("input", event => {
  const value = event.target.value.toLocaleLowerCase("tr-TR").trim();

  document.querySelectorAll(".command-card").forEach(card => {
    const keywords = card.dataset.command.toLocaleLowerCase("tr-TR");
    const text = card.innerText.toLocaleLowerCase("tr-TR");

    card.style.display =
      keywords.includes(value) || text.includes(value)
        ? ""
        : "none";
  });
});

/*
 * Discord OAuth sonraki aşamada Cloudflare Worker üzerinden bağlanacak.
 *
 * ÖNEMLİ:
 * Discord Client Secret veya Bot Token buraya ASLA yazılmayacak.
 */
function loginWithDiscord() {
  alert(
    "Discord giriş altyapısı bir sonraki adımda güvenli Imperius API'ye bağlanacak."
  );
}

document
  .getElementById("loginButton")
  ?.addEventListener("click", loginWithDiscord);

document
  .getElementById("dashboardLogin")
  ?.addEventListener("click", loginWithDiscord);
