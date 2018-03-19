async function initLinks() {
  let linkKeys = [
    "targetLinks.noopener",
    "targetLinks.noreferrer",
    "externalLinks.noreferrer"
  ];
  let storageVals = await browser.storage.local.get(linkKeys);
  linkKeys.forEach(linkId => {
    let link = document.getElementById(linkId);
    if (linkId in storageVals) {
      setVal(link, storageVals[linkId]);
    }
    link.addEventListener("change", e => {
      browser.storage.local.set({
        [linkId]: getVal(link)
      }); 
    });
  });
}
initLinks();

["services", "network", "websites"].forEach(section => {
  let elements = [...document.querySelectorAll(`#${section} input, #${section} select`)];
  elements.forEach(el => {
    initInput(section, el);
  });
});

async function initInput(section, input) {
  let [key, subKey] = input.id.split(".");
  let response = await browser.privacy[section][key].get({});
  let value = response.value;
  if (subKey) {
    value = response.value[subKey];
  }

  setVal(input, value);

  input.addEventListener("change", e => {
    changeVal(section, e.target);
  });
}

async function setVal(input, value) {
  switch (input.tagName) {
    case "INPUT":
      if (value) {
        input.checked = true;
      }
      break;
    case "SELECT":
      let options = [...input.options];
      options.forEach(option => {
        if (value == option.value) {
          option.selected = true;
        }
      });
      break;
    default:
      throw new Error("unknown el");
  }
}

function getVal(input) {
  let value;
  switch (input.tagName) {
    case "INPUT":
      value = input.checked;
      break;
    case "SELECT":
      value = input.value;
      break;
    default:
      throw new Error("unknown el");
  }
  return value;
}

async function changeVal(section, input) {
  let [key, subKey] = input.id.split(".");
  let value;
  if (subKey) {
    value = (await browser.privacy[section][key].get({})).value;
    value[subKey] = getVal(input);
  } else {
    value = getVal(input);
  }
  return browser.privacy[section][key].set({
    value: value
  });
}
