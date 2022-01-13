const Keyboard = {
  elements: {
    main: null,
    keysContainer: null,
    keys: []
  },

  eventHandlers: {
    oninput: null,
    onclose: null
  },

  lang: {
    keyLayoutNumbersEn: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "[", "]", ";", "'", ",", ".", "?"],
    keyLayoutNumbersRu: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "."],
    keyLayoutSpecialSymbolsEn: ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "{", "}", ":", '"', "<", ">", "/"],
    keyLayoutSpecialSymbolsRu: ["!", '"', "№", "%", ":", ",", ".", ";", "(", ")", ","],
    keyLayoutEn: [
      "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "backspace",
      "caps", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]",
      "shift", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "enter",
      "z", "x", "c", "v", "b", "n", "m", ",", ".", "?",
      "sound", "done", "en", "space", "<", ">", "voice",
    ],
    keyLayoutRu: [
      "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "backspace",
      "caps", "й", "ц", "у", "к", "е", "н", "г", "ш", "щ", "з", "х", "ъ",
      "shift", "ф", "ы", "в", "а", "п", "р", "о", "л", "д", "ж", "э", "enter",
      "я", "ч", "с", "м", "и", "т", "ь", "б", "ю", ".",
      "sound", "done", "en", "space", "<", ">", "voice",
    ]
  },

  properties: {
    value: "",
    capsLock: false,
    shift: false,
    lang: "en",
    selectionEnd: 0,
    soundOn: true,
    voiceRecord: false
  },

  init() {
    // Create main elements
    this.elements.main = document.createElement("div");
    this.elements.keysContainer = document.createElement("div");

    // Setup main elements
    this.elements.main.classList.add("keyboard", "keyboard--hidden");
    this.elements.keysContainer.classList.add("keyboard__keys");
    this.elements.keysContainer.appendChild(this._createKeys());

    this.elements.keys = this.elements.keysContainer.querySelectorAll(".keyboard__key");

    // Add to DOM
    this.elements.main.appendChild(this.elements.keysContainer);
    document.body.appendChild(this.elements.main);

    // Automatically use keyboard for elements with .use-keyboard-input
    document.querySelectorAll(".use-keyboard-input").forEach(element => {
      element.addEventListener("blur", () => {
        element.focus();
      });
      element.addEventListener("focus", () => {
        this.open(element.value, currentValue => {
          element.value = currentValue;
          if (this.properties.selectionEnd < 0) {
            this.properties.selectionEnd = 0
          } else if (this.properties.selectionEnd > currentValue.length) {
            this.properties.selectionEnd = currentValue.length;
          }
          element.selectionEnd = this.properties.selectionEnd;
          element.selectionStart = this.properties.selectionEnd;
        });
      });
      element.addEventListener("click", () => {
        this.properties.selectionEnd = element.selectionEnd;
        this.open(element.value, currentValue => {
          element.value = currentValue;
          if (this.properties.selectionEnd < 0) {
            this.properties.selectionEnd = 0
          } else if (this.properties.selectionEnd > currentValue.length) {
            this.properties.selectionEnd = currentValue.length;
          }
          element.selectionEnd = this.properties.selectionEnd;
          element.selectionStart = this.properties.selectionEnd;
        });
      })
      element.addEventListener("keyup", () => {
        this.properties.selectionEnd = element.selectionEnd;
      })
    });
  },

  _createKeys() {
    const fragment = document.createDocumentFragment();
    const keyLayout = this.lang.keyLayoutEn;

    // Creates HTML for an icon
    const createIconHTML = (icon_name) => {
      return `<i class="material-icons">${icon_name}</i>`;
    };

    keyLayout.forEach(key => {
      const keyElement = document.createElement("button");
      const insertLineBreak = ["backspace", "]", "enter", "?"].indexOf(key) !== -1;

      // Add attributes/classes
      keyElement.setAttribute("type", "button");
      keyElement.classList.add("keyboard__key");
      window.addEventListener("keydown", (event) => {
        if (keyElement.textContent == event.key || keyElement.id == event.code) {
          keyElement.classList.add("keyboard-shadow")
          if (event.code == "ShiftLeft") {
            this._toggleShift();
            keyElement.classList.toggle("keyboard__key--active", this.properties.shift);
          } else if (event.code == "CapsLock") {
            setTimeout(() => {
              keyElement.classList.remove("keyboard-shadow")
            }, 100)
            this._toggleCapsLock();
            keyElement.classList.toggle("keyboard__key--active", this.properties.capsLock);
          }
        }
      })
      window.addEventListener("keyup", (event) => {
        if (keyElement.textContent == event.key || keyElement.id == event.code) {
          keyElement.classList.remove("keyboard-shadow")
          if (event.code == "CapsLock") {
            keyElement.classList.add("keyboard-shadow")
            setTimeout(() => {
              keyElement.classList.remove("keyboard-shadow")
            }, 100)
            this._toggleCapsLock();
            keyElement.classList.toggle("keyboard__key--active", this.properties.capsLock);
          }
        }
      })

      switch (key) {
        case "backspace":
          keyElement.classList.add("keyboard__key--wide");
          keyElement.innerHTML = createIconHTML("backspace");
          keyElement.id = "Backspace"

          keyElement.addEventListener("click", () => {
            this._soundOn(keyElement);
            if (this.properties.selectionEnd > 0) {
              this.properties.value = this.properties.value.slice(0, this.properties.selectionEnd - 1) + this.properties.value.slice(this.properties.selectionEnd);
              this.properties.selectionEnd--
              this._triggerEvent("oninput");
            }
          });

          break;

        case "voice":
          keyElement.classList.add("keyboard__key--wide", "keyboard__key--activatable");
          keyElement.innerHTML = createIconHTML("keyboard_voice");
          keyElement.id = "voice";
          keyElement.addEventListener("click", () => {
            keyElement.classList.toggle("keyboard__key--active");
            this.properties.voiceRecord = !this.properties.voiceRecord;
            if (this.properties.voiceRecord) {
              recognitionStart(recognition);
            } else {
              recognitionStop(recognition);
            }
          })

          break;

        case "caps":
          keyElement.classList.add("keyboard__key--wide", "keyboard__key--activatable");
          keyElement.innerHTML = createIconHTML("keyboard_capslock");
          keyElement.id = "CapsLock";
          keyElement.addEventListener("click", () => {
            this._soundOn(keyElement);
            this._toggleCapsLock();
            keyElement.classList.toggle("keyboard__key--active", this.properties.capsLock);
          });

          break;

        case "shift":
          keyElement.classList.add("keyboard__key--wide", "keyboard__key--activatable");
          keyElement.innerHTML = "Shift";
          keyElement.id = "ShiftLeft";
          keyElement.addEventListener("click", () => {
            this._soundOn(keyElement);
            this._toggleShift();
            keyElement.classList.toggle("keyboard__key--active", this.properties.shift);
          });
          break;

        case "enter":
          keyElement.classList.add("keyboard__key--wide");
          keyElement.innerHTML = createIconHTML("keyboard_return");
          keyElement.id = "Enter"

          keyElement.addEventListener("click", () => {
            this._soundOn(keyElement);
            this.properties.value = this.properties.value.slice(0, this.properties.selectionEnd) + "\n" + this.properties.value.slice(this.properties.selectionEnd);
            this.properties.selectionEnd++
            this._triggerEvent("oninput");
          });

          break;

        case "en":
          keyElement.innerHTML = "en";
          keyElement.addEventListener("click", () => {
            this._soundOn(keyElement);
            this._changeLang(keyElement);
            recognition = createRecognition(Keyboard.properties.lang);
          });
          break;

        case "space":
          keyElement.classList.add("keyboard__key--extra-wide");
          keyElement.innerHTML = createIconHTML("space_bar");
          keyElement.id = "Space"

          keyElement.addEventListener("click", () => {
            this._soundOn(keyElement);
            this.properties.value += " ";
            this.properties.selectionEnd++
            this._triggerEvent("oninput");
          });

          break;

        case "sound":
          keyElement.classList.add("keyboard__key--wide", "keyboard__key--activatable", "keyboard__key--active");
          keyElement.innerHTML = "Sound";

          keyElement.addEventListener("click", () => {
            keyElement.classList.toggle("keyboard__key--active");
            this.properties.soundOn = !this.properties.soundOn;
          });

          break;

        case "done":
          keyElement.classList.add("keyboard__key--wide", "keyboard__key--dark");
          keyElement.innerHTML = createIconHTML("check_circle");

          keyElement.addEventListener("click", () => {
            this.close();
            this._triggerEvent("onclose");
          });

          break;

        case "<":
          keyElement.innerHTML = "<";
          keyElement.id = "ArrowLeft";
          keyElement.addEventListener("click", () => {
            this._soundOn(keyElement);
            this.properties.selectionEnd--
            this._triggerEvent("oninput");
          });
          break;

        case ">":
          keyElement.innerHTML = ">";
          keyElement.id = "ArrowRight";
          keyElement.addEventListener("click", () => {
            this._soundOn(keyElement);
            this.properties.selectionEnd++
            this._triggerEvent("oninput");
          });

          break;

        default:
          keyElement.textContent = key.toLowerCase();
          keyElement.id = `Key${key.toUpperCase()}`

          keyElement.addEventListener("click", () => {
            this._soundOn(keyElement);
            this.properties.value = this.properties.value.slice(0, this.properties.selectionEnd) + keyElement.textContent + this.properties.value.slice(this.properties.selectionEnd);
            this.properties.selectionEnd++
            this._triggerEvent("oninput");
          });
          if (/[A-Za-z]/.test(key)) {
            keyElement.classList.add("letter")
          } else {
            keyElement.classList.add("number")
          }

          break;
      }

      fragment.appendChild(keyElement);

      if (insertLineBreak) {
        fragment.appendChild(document.createElement("br"));
      }
    });

    const audioLayout = ["backspace.wav", "capslock.wav", "enter.wav", "shiftleft.wav", "ru.wav", "eng.wav"]
    audioLayout.forEach(audio => {
      const audioElement = document.createElement("audio");
      audioElement.id = `${audio}`;
      audioElement.src = `assets/${audio}`;
      fragment.appendChild(audioElement)
    })

    return fragment;
  },

  _triggerEvent(handlerName) {
    if (typeof this.eventHandlers[handlerName] == "function") {
      this.eventHandlers[handlerName](this.properties.value);
    }
  },

  _toggleCapsLock() {
    this.properties.capsLock = !this.properties.capsLock;

    for (const key of this.elements.keys) {
      if (key.classList.contains('letter')) {
        key.textContent = ((this.properties.capsLock && !this.properties.shift) ||
            (!this.properties.capsLock && this.properties.shift)) ?
          key.textContent.toUpperCase() : key.textContent.toLowerCase();
      }
    }
  },

  _toggleShift() {
    this.properties.shift = !this.properties.shift;

    for (const key of this.elements.keys) {
      if (key.classList.contains('letter')) {
        key.textContent = ((this.properties.capsLock && !this.properties.shift) ||
            (!this.properties.capsLock && this.properties.shift)) ?
          key.textContent.toUpperCase() : key.textContent.toLowerCase();
      }
    }
    const keyLayoutSpecialSymbols = (this.properties.lang == "en") ? this.lang.keyLayoutSpecialSymbolsEn : this.lang.keyLayoutSpecialSymbolsRu;
    const keyLayoutNumbers = (this.properties.lang == "en") ? this.lang.keyLayoutNumbersEn : this.lang.keyLayoutNumbersRu;
    const keyLayout = this.properties.shift ? keyLayoutSpecialSymbols : keyLayoutNumbers;
    let i = 0;
    for (const key of this.elements.keys) {
      if (key.classList.contains("number")) {
        key.textContent = keyLayout[i];
        i++
      }
    }
  },

  _changeLang(keyElement) {
    this.properties.lang = (this.properties.lang == "en") ? "ru" : "en";
    keyElement.textContent = (this.properties.lang == "en") ? "en" : "ru";
    this.properties.shift = false;
    this.properties.capsLock = false;
    let keyLayout = (this.properties.lang == "en") ? this.lang.keyLayoutEn : this.lang.keyLayoutRu;
    let i = 0;
    for (const key of this.elements.keys) {
      if (key.classList.contains("number") || key.classList.contains("letter")) {
        key.textContent = keyLayout[i];
        if (/[A-Za-zА-Яа-я]/.test(key.textContent)) {
          key.classList.remove("number");
          key.classList.add("letter");
        } else {
          key.classList.remove("letter");
          key.classList.add("number");
        }
      }
      key.classList.remove("keyboard__key--active");
      i++
    }
  },

  _soundOn(key) {
    if (key.id == "Backspace" || key.id == "CapsLock" || key.id == "ShiftLeft" || key.id == "Enter") {
      var audio = document.getElementById(`${key.id.toLowerCase()}.wav`)
    } else if (this.properties.lang == "en") {
      var audio = document.getElementById('eng.wav');
    } else {
      var audio = document.getElementById('ru.wav');
    }
    audio.currentTime = 0;
    if (this.properties.soundOn) {
      audio.play()
    };
  },
  open(initialValue, oninput, onclose) {
    this.properties.value = initialValue || "";
    this.eventHandlers.oninput = oninput;
    this.eventHandlers.onclose = onclose;
    this.elements.main.classList.remove("keyboard--hidden");
  },

  close() {
    this.properties.value = "";
    this.eventHandlers.oninput = oninput;
    this.eventHandlers.onclose = onclose;
    this.elements.main.classList.add("keyboard--hidden");
  }
};
function createRecognition(lang) {
  window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition;
  recognition.interimResults = true;
  recognition.lang = lang;
  let text = '';
  recognition.addEventListener('result', e => {
    const transcript = Array.from(e.results)
      .map(result => result[0])
      .map(result => result.transcript)
    if (e.results[0].isFinal) {
      textArea.value = textArea.value + " " + transcript;
    }
  })
  
  return recognition;
};

function recognitionStart(recognition) {
  recognition.start();
  recognition.addEventListener('end', recognition.start);
};

function recognitionStop(recognition) {
  recognition.removeEventListener('end', recognition.start);
  recognition.stop();
}

const textArea = document.querySelector('.use-keyboard-input');
let recognition = createRecognition(Keyboard.properties.lang);

window.addEventListener("DOMContentLoaded", function () {
  Keyboard.init();
});