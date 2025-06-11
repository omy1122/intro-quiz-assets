// 初期設定（既存）
const audio = document.getElementById("introAudio");
const startBtn = document.getElementById("startBtn");
const answerBtn = document.getElementById("answerBtn");
const result = document.getElementById("result");
const nicknameInput = document.getElementById("nickname");

let hasAnswered = false;

// ✅ 【2-5】誰が回答したかをリアルタイムで監視（ここに追加）
firebase.database().ref("quiz/answeredBy").on("value", (snapshot) => {
  const name = snapshot.val();
  if (name) {
    result.textContent = `回答者: ${name}`;
    audio.pause(); // 誰かが押したら自分も停止
    hasAnswered = true;
  }
});

// ✅ 回答ボタンを押したときの処理
answerBtn.onclick = () => {
  if (!hasAnswered) {
    const nickname = nicknameInput.value || "匿名";
    
    const answerRef = firebase.database().ref("quiz/answeredBy");
    answerRef.get().then((snapshot) => {
      if (!snapshot.exists()) {
        answerRef.set(nickname); // 最初の回答者だけ記録
      }
    });

    audio.pause(); // 念のため自分でも止める
    hasAnswered = true;
  }
};

// ✅ 再生ボタン（START）の処理
startBtn.onclick = () => {
  audio.currentTime = 0;
  audio.play();
  result.textContent = "";
  hasAnswered = false;

  // ✅ 【2-6】再生時に回答情報をリセット（ホストだけが使う想定）
  firebase.database().ref("quiz/answeredBy").remove();
};

const audioUrlInput = document.getElementById("audioUrlInput");
const setUrlBtn = document.getElementById("setUrlBtn");

setUrlBtn.addEventListener("click", async () => {
  const url = audioUrlInput.value;
  if (url && url.startsWith("http")) {
    await firebase.database().ref("quiz/audioUrl").set(url);
    alert("音源URLをセットしました！");
  } else {
    alert("正しいURLを入力してください。");
  }
});

// 🔽 Firebaseから音源URLを取得してaudioにセット
firebase.database().ref("quiz/audioUrl").on("value", (snapshot) => {
  const url = snapshot.val();
  if (url) {
    audio.src = url;
    console.log("音源URLを取得しました:", url);
  }
});
