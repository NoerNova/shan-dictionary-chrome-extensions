/*jshint esversion: 8 */

// shandictionary api URL
// V1 const apiURL = "https://api.shandictionary.com/api/collections/entries/";
const apiURL = "https://api2.shandictionary.com/api/content/items/";

// bubbleIcon
let bubbleIcon = document.createElement("div");
bubbleIcon.setAttribute("class", "bubbleIconContainer");
bubbleIcon.onmousedown = translateText;
document.body.appendChild(bubbleIcon);

// add icon imageElement
let iconImage = document.createElement("IMG");
iconImage.setAttribute("src", chrome.runtime.getURL("assets/images/icon.png"));
iconImage.setAttribute("class", "bubbleIcon");

// default state
let loading = false;
let languageEndpoint = "eng2shn";

// load user setting from chrom sync storage
chrome.storage.sync.get("defaultDict", function (items) {
  languageEndpoint = items.defaultDict || "eng2shn";
});

// Lets listen to mouseup DOM events.
document.addEventListener("mouseup", handleSelection, false);

function getPosition(event) {
  let scrollTop;

  if (window.pageYOffset !== undefined) {
    scrollTop = window.pageYOffset;
  } else {
    scrollTop = (
      document.documentElement ||
      document.body.parentNode ||
      document.body
    ).scrollTop;
  }

  // Get cursor position
  const posX = event.clientX - 20;
  const posY = event.clientY + 10 + scrollTop;

  return { posX, posY };
}

function handleSelection(event) {
  const selection = window.getSelection().toString();

  const lengthVSpace = /\s/.test(selection);
  const isContainNum = /\d/.test(selection);

  if (
    !lengthVSpace &&
    !isContainNum &&
    selection.length > 0 &&
    selection.length < 20 &&
    !loading
  ) {
    renderIcon(event);
  } else {
    bubbleIcon.style.visibility = "hidden";
  }
}

function closeBubble() {
  const bubble = document.getElementById("bubble");
  const bubbleContent = document.getElementById("bubbleContent");

  if (bubble && bubbleContent) {
    bubble.remove();
  }

  if (bubbleContent) {
    bubbleContent.remove();
  }
  loading = false;
}

window.onmousedown = function (event) {
  const bubbleArea = document.getElementById("bubbleContent");

  if (bubbleArea) {
    const isClickInside = bubbleArea.contains(event.target);

    if (!isClickInside) {
      closeBubble();
    }
  }
};

function renderIcon(event) {
  const { posX, posY } = getPosition(event);

  bubbleIcon.appendChild(iconImage);
  bubbleIcon.style.top = posY + "px";
  bubbleIcon.style.left = posX + "px";
  bubbleIcon.style.visibility = "visible";
}

function fetchAPI(selection, event) {
  const url =
    apiURL +
    languageEndpoint +
    "?filter={word:{$regex:'" +
    selection.toLowerCase() +
    "'}}";

  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (res) {
      if (res) {
        renderBubble(selection, res, event);
      }
    })
    .catch(function (err) {
      console.log(err);
      closeBubble();
    });
}

function translateText(event) {
  loading = true;
  bubbleIcon.style.visibility = "hidden";

  const selection = window.getSelection().toString();

  if (selection.length > 0) {
    fetchAPI(selection, event);
  } else {
    closeBubble();
  }
}

// Move that bubble to the appropriate location.
function renderBubble(selectionText, translation, event) {
  // Add bubble to the top of the page.
  let bubble = document.createElement("div");
  bubble.setAttribute("id", "bubble");
  bubble.setAttribute("class", "bubble");
  document.body.appendChild(bubble);

  let bubbleContent = document.createElement("div");
  bubbleContent.setAttribute("id", "bubbleContent");
  bubbleContent.setAttribute("class", "bubbleContent");
  bubble.appendChild(bubbleContent);

  let definitionList = "";

  if (translation.length > 0) {
    translation.map(function (def) {
      if (def.type !== null && def.type !== "null") {
        definitionList +=
          "<div class='definition-container'/><p class='type'>" +
          "[" +
          def.type +
          "]." +
          "</p> <p class='definition'>" +
          def.definition +
          "</p></div>";
      } else {
        definitionList +=
          "<div class='definition-container'/><p class='definition'>" +
          def.definition +
          "</p></div>";
      }
    });
  } else {
    definitionList +=
      "<div class='definition-container'/><p class='definition'>" +
      selectionText +
      "</p></div>";
  }

  const innerBubbleContent =
    "<div class='bubbleContentContainer'>" +
    "<select name='dict' id='dict-selection' class='dict-selection'>" +
    "<option value='bur2shn'>Burmese - Shan</option>" +
    "<option value='zh2shn'>Chinese - Shan</option>" +
    "<option value='eng2shn'>Engish - Shan</option>" +
    "<option value='pli2shn'>Pali - Shan</option>" +
    "<option value='shn2bur'>Shan - Burmese</option>" +
    "<option value='shn2eng'>Shan - English</option>" +
    "<option value='shn2shn'>Shan - Shan</option>" +
    "<option value='tha2shn'>Thai - Shan</option>" +
    "</select>" +
    "<span id='closeButton' class='closeButton'>&times;</span>" +
    "<p class='langText' id='selection-word'>English:</p><p class='translatedText'> " +
    "<button id='speak-button' class='speak-button'><i class='fa fa-volume-up fa-lg'></i></button> " +
    selectionText +
    "</p><p class='langText' id='translation-word'>Shan:</p><p class='translatedText'> " +
    definitionList +
    "</p><div><a class='websiteLink' href='https://shandictionary.com' target='_blank' rel='noopener '>shandictionary.com</a></div></div>";

  const parser = new DOMParser();
  const parsed = parser.parseFromString(innerBubbleContent, `text/html`);
  const tags = parsed.getElementsByTagName(`body`);

  bubbleContent.innerHTML = ``;
  for (const tag of tags) {
    bubbleContent.appendChild(tag);
  }
  const { posX, posY } = getPosition(event);
  bubbleContent.style.top = posY + "px";
  bubbleContent.style.left = posX + "px";

  bubble.style.visibility = "visible";

  document.getElementById("dict-selection").value = languageEndpoint;

  switch (languageEndpoint) {
    case "shn2eng":
      document.getElementById("selection-word").innerHTML = "Shan:";
      document.getElementById("translation-word").innerHTML = "English:";
      break;
    case "shn2bur":
      document.getElementById("selection-word").innerHTML = "Shan:";
      document.getElementById("translation-word").innerHTML = "Burmese:";
      break;
    case "bur2shn":
      document.getElementById("selection-word").innerHTML = "Burmese:";
      document.getElementById("translation-word").innerHTML = "Shan:";
      break;
    case "tha2shn":
      document.getElementById("selection-word").innerHTML = "Thai:";
      document.getElementById("translation-word").innerHTML = "Shan:";
      break;
    case "shn2shn":
      document.getElementById("selection-word").innerHTML = "Shan:";
      document.getElementById("translation-word").innerHTML = "Shan:";
      break;
    case "pli2shn":
      document.getElementById("selection-word").innerHTML = "Pali:";
      document.getElementById("translation-word").innerHTML = "Shan:";
      break;
    case "zh2shn":
      document.getElementById("selection-word").innerHTML = "Chinese:";
      document.getElementById("translation-word").innerHTML = "Shan:";
      break;
    default:
      document.getElementById("selection-word").innerHTML = "English:";
      document.getElementById("translation-word").innerHTML = "Shan:";
      break;
  }

  // handle dict-selection change
  document
    .getElementById("dict-selection")
    .addEventListener("change", function () {
      languageEndpoint = document.getElementById("dict-selection").value;
      closeBubble();
      translateText(event);
    });

  if (languageEndpoint !== "eng2shn" && languageEndpoint !== "shn2eng") {
    document.getElementById("speak-button").style.display = "none";
  }

  document.getElementById("speak-button").onclick = speakMe.bind(
    null,
    selectionText,
    languageEndpoint
  );

  document.getElementById("closeButton").addEventListener("click", closeBubble);
}
