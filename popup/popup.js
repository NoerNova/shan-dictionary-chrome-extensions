/* jshint esversion:8 */

// shandictionary api URL
const apiURL = "https://api.shandictionary.com/api/collections/entries/";

let inputText = document.getElementById("search-box");
let defaultElement = document.getElementById("translation").innerHTML;
let dictSelection = document.getElementById("dict-selection");

// Event Listener
document.getElementById("search-button").onclick = translateInput;
document.getElementById("close-button").onclick = resetAll;

// Enter event listenet
inputText.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    document.getElementById("search-button").click();
  }
});

// on dictionary selection change
dictSelection.addEventListener("change", function () {
  let dictEndpoint = document.getElementById("dict-selection").value;
  let placeholder = "";
  document.getElementById("search-box").value = "";

  switch (dictEndpoint) {
    case "eng2shn":
      placeholder = "Search...";
      break;
    case "shn2eng":
      placeholder = "သွၵ်ႈႁႃ...";
      break;
    default:
      placeholder = "Search...";
  }
  document.getElementById("search-box").placeholder = placeholder;
});

// open extension options
document.getElementById("go-to-options").addEventListener("click", function () {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL("options.html"));
  }
});

// load user setting from chrome sync storage
function loadFromStorage() {
  chrome.storage.sync.get("defaultDict", function (items) {
    document.getElementById("dict-selection").value =
      items.defaultDict || "eng2shn";
  });
}

// reset all to default
function resetAll() {
  document.getElementById("translation").innerHTML = defaultElement;
  document.getElementById("search-box").value = "";
  document.getElementById("close-button").style.visibility = "hidden";
}

// clear translation box on new search
function clearTranslations() {
  document.getElementById("translation").innerHTML = defaultElement;
}

// translation from input
function translateInput() {
  clearTranslations();

  // selected dict type
  const dictEndpoint = document.getElementById("dict-selection").value;
  const getInputText = inputText.value.toLowerCase() || "";

  const url = apiURL + dictEndpoint + "/" + "?filter[word]=" + getInputText;

  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (res) {
      if (res.entries.length > 0) {
        var definitionList = "";

        res.entries.map(function (def) {
          definitionList +=
            "<div class='definition-container'/><p class='type'>" +
            "[" + def.type + "]." +
            "</p> <p class='definition'>" +
            def.definition +
            "</p></div>";
        });

        document.getElementById("translation").innerHTML =
          "<div class='translation'><p>Word</p><h2> " +
          "<button id='speak-button' class='speak-button'><i class='fa fa-volume-up fa-lg'></i></button> " +
          getInputText +
          "</h2><p>Definition</p><div class='definition-area-container'>" +
          definitionList +
          "</div>";

        document.getElementById("speak-button").onclick = speakMe.bind(
          null,
          getInputText,
          dictEndpoint
        );
        document.getElementById("close-button").style.visibility = "visible";
      } else {
        document.getElementById("translation").innerHTML =
          "<div class='translation'><p>Word</p><h2> " +
          getInputText +
          "</h2><p>Definition</p><h2> " +
          getInputText +
          "</h2></div>";

        document.getElementById("close-button").style.visibility = "visible";
      }
    });
}

loadFromStorage();
