/*jshint esversion: 8 */

const apiKey = "NO8p3FC4qMrTzx1RUjRXNXWrqlLa8DkDjmRgt7s9rDE=";

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
let languageEndpoint = "/eng/";

// Lets listen to mouseup DOM events.
document.addEventListener("mouseup", handleSelection, false);

function handleSelection(event) {
  const selection = window.getSelection().toString();
  if (selection.length > 0 && selection.length < 20 && !loading) {
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

    renderIcon(posX, posY);
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

window.onclick = function (event) {
  if (event.target.matches(".bubble")) {
    closeBubble();
  }
};

function renderIcon(mouseX, mouseY) {
  bubbleIcon.appendChild(iconImage);
  bubbleIcon.style.top = mouseY + "px";
  bubbleIcon.style.left = mouseX + "px";
  bubbleIcon.style.visibility = "visible";
}

function translateText(event) {
  loading = true;
  bubbleIcon.style.visibility = "hidden";

  const selection = window.getSelection().toString();

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

  if (selection.length > 0) {
    const url =
      "https://tai-eng-dictionaryapi.herokuapp.com/api/v1/api_key=" +
      apiKey +
      languageEndpoint +
      selection.toLowerCase();
    fetch(url)
      .then(function (response) {
        return response.json();
      })
      .then(function (res) {
        if (!res.data) {
          renderBubble(posX, posY, selection, "Translation not found.");
        } else {
          renderBubble(posX, posY, selection, res.data[0].shan);
        }
      })
      .catch(function (err) {
        console.error("An error ocurred", err);
      });
  }
}

// Move that bubble to the appropriate location.
function renderBubble(posX, posY, englishText, translation) {
  // Add bubble to the top of the page.
  let bubble = document.createElement("div");
  bubble.setAttribute("id", "bubble");
  bubble.setAttribute("class", "bubble");
  document.body.appendChild(bubble);
 // document.querySelector(':root').prepend(bubble);


  let bubbleContent = document.createElement("div");
  bubbleContent.setAttribute("id", "bubbleContent");
  bubbleContent.setAttribute("class", "bubbleContent");
  bubble.appendChild(bubbleContent);

  bubbleContent.innerHTML =
    "<div><span id='closeButton' class='closeButton'>&times;</span>" +
    "<p class='langText'>English:</p><p class='translatedText'> " +
    "<button id='speak-button' class='speak-button'><i class='fa fa-volume-up fa-lg'></i></button> " +
    englishText +
    "</p><p class='langText'>Shan:</p><p class='translatedText'>" +
    translation +
    "</p><div><a class='websiteLink' href='https://shandictionary.com' target='_blank' rel='noopener '>MORE >></a></div></div>";

  document.documentElement.style.position = "relative";
  document.querySelector(':root').style.position = "relative";
  bubbleContent.style.top = posY + "px";
  bubbleContent.style.left = posX + "px";

  bubble.style.visibility = "visible";

  document.getElementById("speak-button").onclick = speakMe.bind(
    null,
    englishText,
    "eng2shn"
  );

  document.getElementById("closeButton").addEventListener("click", closeBubble);
}
