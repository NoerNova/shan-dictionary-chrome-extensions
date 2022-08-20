// shandictionary api URL
const apiURL = "https://api.shandictionary.com/api/collections/entries/";
const SHN_TTS_API = "https://shantts.herokuapp.com/api/?text=";

var inputText = document.getElementById("search-box");
var defaultElement = document.getElementById("translation").innerHTML;
var dictSelection = document.getElementById("dict-selection");

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
  var dictEndpoint = document.getElementById("dict-selection").value;
  var placeholder = "";
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

// speak function
function browserSpeak (msg, vox) {
  const sp = new SpeechSynthesisUtterance()
  sp.voice = window.speechSynthesis.getVoices().filter((e) => {
    return vox == e.name
  })[0]
  sp.text = msg
  speechSynthesis.speak(sp)
}

async function shanTTSSpeak (msg) {
  try {
    const e = await fetch(SHN_TTS_API + msg);
    const { data } = await e.json()
    
    if (!data) return
    
    const audio = new Audio(`data:audio/wav;base64,${data}`)
    audio.play()
  } catch (err) {}
}

function speakMe(word, endpoint) {
  if (endpoint === 'eng2shn') {
    browserSpeak(word, 'Google US English')
    return
  }
  shanTTSSpeak(word)
}

// translation from input
function translateInput() {
  clearTranslations();

  // selected dict type
  var dictEndpoint = document.getElementById("dict-selection").value;
  var getInputText = inputText.value.toLowerCase() || "";

  var url = apiURL + dictEndpoint + "/" + "?filter[word]=" + getInputText;

  fetch(url)
    .then(function (response) {
      return response.json();
    })
    .then(function (res) {
      if (res.entries) {
        var definitionList = "";

        res.entries.map(function (def) {
          definitionList +=
            "<div class='definition-container'/><p class='type'>" +
            def.type +
            ".</p> <p class='definition'>" +
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

        document.getElementById("speak-button").onclick = speakMe.bind(null, getInputText, dictEndpoint);
        document.getElementById("close-button").style.visibility = "visible";
      } else {
        document.getElementById("translation").innerHTML =
          "<div class='translation'><p>Word</p><h2> " +
          getInputText +
          "</h2><p>Definition</p><h2> " +
          "</h2></div>";

        document.getElementById("close-button").style.visibility = "visible";
      }

    });
}

loadFromStorage();
