const audio = document.getElementById("introAudio");
const startBtn = document.getElementById("startBtn");
const answerBtn = document.getElementById("answerBtn");
const result = document.getElementById("result");
const nicknameInput = document.getElementById("nickname");
const audioUrlInput = document.getElementById("audioUrlInput");
const setUrlBtn = document.getElementById("setUrlBtn");

let hasAnswered = false;

// ✅ 再生リクエストを送信（ホストが使用）
startBtn.onclick = async () => {
  hasAnswered = false;
  result.textContent = "";

  // 回答記録をリセット
  await firebase.database().ref("quiz/answers").remove();

  // 再生フラグを true にセット（これで全員再生される）
  await firebase.database().ref("quiz/control").set({
    play: true,
    timestamp: Date.now()
  });
};

// ✅ 回答ボタン：回答を記録＆再生停止フラグ
answerBtn.onclick = async () => {
  if (hasAnswered) return;

  const nickname = nicknameInput.value.trim() || "匿名";
  const ref = firebase.database().ref("quiz/answers");

  // 回答順に記録
  await ref.push({
    name: nickname,
    timestamp: Date.now()
  });

  // 停止フラグを送る（これで全員停止する）
  await firebase.database().ref("quiz/control").update({
    play: false
  });

  hasAnswered = true;
};

// ✅ 音源URLをセット（ホスト用）
setUrlBtn.addEventListener("click", async () => {
  const url = audioUrlInput.value;
  if (url && url.startsWith("http")) {
    await firebase.database().ref("quiz/audioUrl").set(url);
    alert("音源URLをセットしました！");
  } else {
    alert("正しいURLを入力してください。");
  }
});

// ✅ 音源URLを監視 → 自動セット
firebase.database().ref("quiz/audioUrl").on("value", (snapshot) => {
  const url = snapshot.val();
  if (url) {
    audio.src = url;
  }
});

// ✅ 再生/停止フラグを監視 → 全員反映
firebase.database().ref("quiz/control").on("value", (snapshot) => {
  const control = snapshot.val();
  if (!control) return;

  if (control.play) {
    audio.currentTime = 0;
    audio.play();
  } else {
    audio.pause();
  }
});

// ✅ 回答リストをリアルタイムに表示
firebase.database().ref("quiz/answers").on("value", (snapshot) => {
  const answers = snapshot.val();
  if (answers) {
    const sorted = Object.values(answers).sort((a, b) => a.timestamp - b.timestamp);
    const lines = sorted.map((entry, i) => `${i + 1}位: ${entry.name}`);
    result.textContent = lines.join(" / ");
  } else {
    result.textContent = "";
  }
});
