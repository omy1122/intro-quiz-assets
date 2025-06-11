const audio = document.getElementById("introAudio");
const startBtn = document.getElementById("startBtn");
const answerBtn = document.getElementById("answerBtn");
const result = document.getElementById("result");
const nicknameInput = document.getElementById("nickname");
const audioUrlInput = document.getElementById("audioUrlInput");
const setUrlBtn = document.getElementById("setUrlBtn");

let hasAnswered = false;

// 音源URLをFirebaseから読み込んでセット
firebase.database().ref("quiz/audioUrl").on("value", (snapshot) => {
  const url = snapshot.val();
  if (url) {
    audio.src = url;
  }
});

// 誰が回答したか監視
firebase.database().ref("quiz/answeredBy").on("value", (snapshot) => {
  const name = snapshot.val();
  if (name) {
    result.textContent = `回答者: ${name}`;
    hasAnswered = true;
  }
});

// 回答ボタン処理
answerBtn.onclick = () => {
  if (!hasAnswered) {
    const nickname = nicknameInput.value || "匿名";
    const answerRef = firebase.database().ref("quiz/answeredBy");

    answerRef.get().then((snapshot) => {
      if (!snapshot.exists()) {
        answerRef.set(nickname);
      }
    });

    hasAnswered = true;
  }
};

// 再生ボタン処理
startBtn.onclick = () => {
  audio.currentTime = 0;
  audio.play();
  result.textContent = "";
  hasAnswered = false;
  firebase.database().ref("quiz/answeredBy").remove();
};

// URLセットボタン処理
setUrlBtn.addEventListener("click", async () => {
  const url = audioUrlInput.value;
  if (url && url.startsWith("http")) {
    await firebase.database().ref("quiz/audioUrl").set(url);
    alert("音源URLをセットしました！");
  } else {
    alert("正しいURLを入力してください。");
  }
});
