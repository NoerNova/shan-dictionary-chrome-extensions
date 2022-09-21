/* jshint esversion: 8 */

const SHN_TTS_API = "https://taitts.cyclic.app/api/?text=";
const BUR_TTS_API = "https://myanmartts.glitch.me/api?text=";

// speak function
function browserSpeak(msg, vox) {
  const sp = new SpeechSynthesisUtterance();
  sp.voice = window.speechSynthesis.getVoices().filter((e) => {
    return vox == e.name;
  })[0];
  sp.text = msg;
  speechSynthesis.speak(sp);
}

async function shanTTSSpeak(msg) {
  try {
    const e = await fetch(SHN_TTS_API + msg);
    const { data } = await e.json();

    if (!data) return;

    const audio = new Audio(`data:audio/wav;base64,${data}`);
    audio.play();
  } catch (err) {}
}

function speakMe(word, endpoint) {
  if (endpoint === "eng2shn") {
    browserSpeak(word, "Google US English");
    return;
  }

  shanTTSSpeak(word);
}
