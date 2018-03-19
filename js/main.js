async function getStorage() {
  let linkKeys = [
    "targetLinks.noopener",
    "targetLinks.noreferrer",
    "externalLinks.noreferrer"
  ];
  let response = await browser.storage.local.get(linkKeys);
  linkKeys.forEach(k => {
    if (!(k in response)) {
      response[k] = false;
    }
  })
  return response;
}

async function check() {
  const storage = await getStorage();
  const links = [...document.querySelectorAll("a[href]")];
  links.forEach((link) => {
    if (link.hostname == location.hostname) {
      return;
    }
    const hasTarget = link.hasAttribute("target");
    const rel = link.getAttribute("rel").split(" ") || [];

    if (hasTarget) {
      if (storage["targetLinks.noopener"]) {
        rel.push("noopener");
      }
      if (storage["targetLinks.noreferrer"]) {
        rel.push("noreferrer");
      }
    } else {
      if (storage["externalLinks.noreferrer"]) {
        rel.push("noreferrer");
      }
    }

    link.setAttribute("rel", rel.join(" "));
  });
}

check();
window.onload = check;
