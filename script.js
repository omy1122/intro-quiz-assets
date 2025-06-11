const audio = document.getElementById("introAudio");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const answerBtn = document.getElementById("answerBtn");
const result = document.getElementById("result");
const nicknameInput = document.getElementById("nickname");
const audioUrlInput = document.getElementById("audioUrlInput");
const setUrlBtn = document.getElementById("setUrlBtn");
const answerOrder = document.getElementById("answerOrder");

let hasAnswered = false;

// ✅ 回答者（1人目）をリアルタイムで表示
firebase.database().ref("quiz/answeredBy").on("value", (snapshot) => {
  const name = snapshot.val();
  if (name) {
    result.textContent = `最初の回答者: ${name}`;
    hasAnswered = true;
  }
});

// ✅ 回答順リストをリアルタイム表示
firebase.database().ref("quiz/answerOrder").on("value", (snapshot) => {
  const data = snapshot.val();
  answerOrder.innerHTML = "";
  if (data) {
    const sorted = Object.entries(data).sort(([a], [b]) => a - b);
    sorted.forEach(([_, name], index) => {
      const li = document.createElement("li");
      li.textContent = `${index + 1}位: ${name}`;
      answerOrder.appendChild(li);
    });
  }
});

// ✅ 音源URLをセットして保存
setUrlBtn.addEventListener("click", async () => {
  const url = audioUrlInput.value;
  if (url && url.startsWith("http")) {
    await firebase.database().ref("quiz/audioUrl").set(url);
    alert("音源URLをセットしました！");
  } else {
    alert("正しいURLを入力してください。");
  }
});

// ✅ 音源URLをリアルタイム取得
firebase.database().ref("quiz/audioUrl").on("value", (snapshot) => {
  const url = snapshot.val();
  if (url) {
    audio.src = url;
  }
});

// ✅ 回答ボタン
answerBtn.onclick = () => {
  if (!hasAnswered) {
    const nickname = nicknameInput.value || "匿名";

    firebase.database().ref("quiz/answeredBy").get().then((snapshot) => {
      if (!snapshot.exists()) {
        firebase.database().ref("quiz/answeredBy").set(nickname);
      }
    });

    const timestamp = Date.now();
    firebase.database().ref("quiz/answerOrder/" + timestamp).set(nickname);

    hasAnswered = true;
  }
};

// ✅ 再生ボタン
startBtn.onclick = () => {
  audio.currentTime = 0;
  audio.play();
  result.textContent = "";
  hasAnswered = false;
  firebase.database().ref("quiz/answeredBy").remove();
  firebase.database().ref("quiz/answerOrder").remove();
};

// ✅ 停止ボタン
stopBtn.onclick = () => {
  audio.pause();
};
