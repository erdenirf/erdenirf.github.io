let final_transcript = "";
let recognizing = false;
let HOST = 'https://83.220.174.161:5005'

const speechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new speechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.maxAlternatives = 3;
recognition.lang = "ru-RU";

recognition.onstart = () => {
  console.log("Распознавание голоса запущено");
};
recognition.onerror = ({ error }) => {
  console.error(error);
};
recognition.onend = () => {
  console.log("Распознавание голоса закончено");
  if (!recognizing) return;
  recognition.start();
};
recognition.onresult = (e) => {
  let interim_transcript = "";
  for (let i = e.resultIndex; i < e.results.length; i++) {
    if (e.results[i].isFinal) {
      const result = editInterim(e.results[i][0].transcript);
      final_transcript += result;
    } else {
      interim_transcript += e.results[i][0].transcript;
    }
  }
  final_transcript = editFinal(final_transcript);
  final_text.value = final_transcript;
  interim_text.value = interim_transcript;
  if (interim_transcript.trim()!='') {
    API_wrapper(interim_transcript.trim());
  }
};

function API_wrapper(texts) {
  axios.post(HOST + '/text/', {
    text: texts
  })
  .then(function (response) {
      console.log(response);
      // Paragraph
      let text_paragraph = "";
      var element = document.getElementById("messagePanel");
      var array = response.data.annotations;
      array.forEach((sent) => {
        if (typeof sent === 'string') {
          text_paragraph += sent+' ';
          element.appendChild(document.createTextNode(text_paragraph));
          text_paragraph = " ";
        }
        else {
          var span_parent = document.createElement("span");
          span_parent.classList.add('annotation');
          var span_annotation = document.createElement("span");
          var span_text = document.createElement("span");
          span_text.appendChild(document.createTextNode(sent[0]));
          span_text.classList.add('annotation-symbol');
          span_annotation.appendChild(document.createTextNode(sent[1]));
          span_annotation.classList.add('annotation-text');
          span_parent.appendChild(span_annotation);
          span_parent.appendChild(span_text);
          element.appendChild(span_parent);
        }
      });
      // Player
      var player = videojs(document.querySelector('.video-js'));
      player.src({
          src: HOST + response.data.src,
          type: 'video/mp4'/*video type*/
      });
      player.play();
  })
  .catch(function (error) {
    console.log(error);
  });
}

const DICTIONARY = {
  точка: ".",
  запятая: ",",
  вопрос: "?",
  восклицание: "!",
  двоеточие: ":",
  тире: "-",
  абзац: "\n",
  отступ: "\t"
};

function editInterim(s) {
  return s
    .split(" ")
    .map((word) => {
      word = word.trim();
      return DICTIONARY[word] ? DICTIONARY[word] : word;
    })
    .join(" ");
}

function editFinal(s) {
  return s.replace(/\s([\.+,?!:-])/g, "$1");
}

buttons.onclick = ({ target }) => {
  switch (target.className) {
    case "button_fromtext":
      final_text.value += ' '+interim_text.value;
      interim_text.value = "";
      let textValue = final_text.value.trim();
      if (textValue!='') {
        API_wrapper(textValue);
      }
      break;
    case "start":
      final_transcript = "";
      recognition.start();
      recognizing = true;
      final_text.value = "";
      interim_text.value = "";
      document.getElementById("start_button").classList.add('button_holded');   //кнопка серая
      break;
    case "stop":
      recognition.stop();
      recognizing = false;
      document.getElementById("start_button").classList.remove('button_holded');   //кнопка серая
      break;
    case "abort":
      recognition.abort();
      recognizing = false;
      break;
    case "copy":
      navigator.clipboard.writeText(final_text.value);
      target.textContent = "Готово";
      const timerId = setTimeout(() => {
        target.textContent = "Копия";
        clearTimeout(timerId);
      }, 3000);
      break;
    case "clear":
      final_text.value = "";
      document.getElementById("messagePanel").innerHTML = "";
      break;
    default:
      break;
  }
};

/*
SpeechRecognitionEvent
  bubbles: false
  cancelBubble: false
  cancelable: false
  composed: false
  currentTarget: SpeechRecognition {grammars: SpeechGrammarList, lang: "ru-RU", continuous: true, interimResults: true, maxAlternatives: 3, …}
  defaultPrevented: false
  emma: null
  eventPhase: 0
  interpretation: null
  isTrusted: true
  path: []
  resultIndex: 1
  // здесь нас интересуют только результаты
  results: SpeechRecognitionResultList {0: SpeechRecognitionResult, 1: SpeechRecognitionResult, length: 2}
  returnValue: true
  srcElement: SpeechRecognition {grammars: SpeechGrammarList, lang: "ru-RU", continuous: true, interimResults: true, maxAlternatives: 3, …}
  target: SpeechRecognition {grammars: SpeechGrammarList, lang: "ru-RU", continuous: true, interimResults: true, maxAlternatives: 3, …}
  timeStamp: 59862.61999979615
  type: "result"
*/

/*
results: SpeechRecognitionResultList
  0: SpeechRecognitionResult
    0: SpeechRecognitionAlternative
      confidence: 0.7990190982818604
      transcript: "привет"
    isFinal: true
    length: 1
  length: 1
*/
