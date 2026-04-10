function createElement(tag, text) {
  const element = document.createElement(tag);
  if (typeof text === "string") {
    element.textContent = text;
  }
  return element;
}

function createContactItem(item) {
  const li = document.createElement("li");

  if (item.type === "email") {
    const a = createElement("a", item.label);
    a.href = `mailto:${item.value}`;
    li.appendChild(a);
    return li;
  }

  if (item.type === "phone") {
    const a = createElement("a", item.label);
    a.href = `tel:${item.value}`;
    li.appendChild(a);
    return li;
  }

  if (item.type === "link") {
    const a = createElement("a", item.label);
    a.href = item.value;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    li.appendChild(a);
    return li;
  }

  li.textContent = item.label;
  return li;
}

function renderArticle({ title, subtitle, period, points, paragraph, link }) {
  const article = document.createElement("article");
  article.className = "item";

  const head = document.createElement("div");
  head.className = "item-head";

  const h3 = createElement("h3", title);
  head.appendChild(h3);

  if (period) {
    head.appendChild(createElement("p", period));
  }

  if (link && link.url) {
    const a = createElement("a", link.text || "Ver proyecto");
    a.href = link.url;
    if (link.url.startsWith("http")) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    if (link.ariaLabel) {
      a.setAttribute("aria-label", link.ariaLabel);
    }
    head.appendChild(a);
  }

  article.appendChild(head);

  if (subtitle) {
    const subtitleEl = createElement("p", subtitle);
    article.appendChild(subtitleEl);
  }

  if (Array.isArray(points) && points.length > 0) {
    const ul = document.createElement("ul");
    points.forEach((point) => ul.appendChild(createElement("li", point)));
    article.appendChild(ul);
  }

  if (paragraph) {
    article.appendChild(createElement("p", paragraph));
  }

  return article;
}

async function loadCvData() {
  const response = await fetch("cv-data.json");
  if (!response.ok) {
    throw new Error("No se pudo cargar cv-data.json");
  }
  return response.json();
}

function renderCv(data) {
  const meta = document.querySelector('meta[name="description"]');
  if (meta && data.site.metaDescription) {
    meta.content = data.site.metaDescription;
  }

  document.title = `${data.site.name} | CV`;
  document.getElementById("hero-kicker").textContent = data.site.kicker;
  document.getElementById("hero-name").textContent = data.site.name;
  document.getElementById("hero-subtitle").textContent = data.site.role;
  document.getElementById("profile-text").textContent = data.profile;
  document.getElementById("availability-text").textContent = data.site.availability;
  document.getElementById("footer-name").textContent = data.site.name;
  document.getElementById("year").textContent = new Date().getFullYear();

  const contactList = document.getElementById("contact-list");
  data.contact.forEach((item) => contactList.appendChild(createContactItem(item)));

  const experienceSection = document.getElementById("experience-section");
  data.experience.forEach((job) => {
    const title = `${job.title} · ${job.company}`;
    experienceSection.appendChild(
      renderArticle({
        title,
        period: job.period,
        points: job.highlights
      })
    );
  });

  const educationSection = document.getElementById("education-section");
  data.education.forEach((edu) => {
    const title = `${edu.degree} · ${edu.institution}`;
    educationSection.appendChild(
      renderArticle({
        title,
        period: edu.period
      })
    );
  });

  const skillsList = document.getElementById("skills-list");
  data.skills.forEach((skill) => skillsList.appendChild(createElement("li", skill)));

  const languagesList = document.getElementById("languages-list");
  data.languages.forEach((language) => languagesList.appendChild(createElement("li", language)));

  const projectsSection = document.getElementById("projects-section");
  data.projects.forEach((project) => {
    projectsSection.appendChild(
      renderArticle({
        title: project.name,
        paragraph: project.description,
        link: {
          text: "Ver proyecto",
          url: project.url,
          ariaLabel: `Abrir proyecto ${project.name}`
        }
      })
    );
  });
}

(async function init() {
  try {
    const data = await loadCvData();
    renderCv(data);
  } catch (error) {
    console.error(error);
    const wrapper = document.getElementById("cv-wrapper");
    const fallback = createElement(
      "p",
      "No se pudo cargar el CV. Verifica que cv-data.json exista y se publique junto al sitio."
    );
    wrapper.prepend(fallback);
  }
})();
