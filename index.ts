import { createActor, SnapshotFrom } from "xstate";
import { toggleMachine } from "./state-machine";

// Actor を作成し、イベントを送信できるようにします。
// 注意: Actor はまだ開始されていません！
const actor = createActor(toggleMachine);

// Actor からのスナップショット (送信された状態変化) を購読します。
// 実装は、Actor の開始時、ステートマシンの状態が変化するたびに呼び出されます。
//
// 実装方法1
// actor.subscribe((snapshot) => {
//   // コードを記載
// });
//
// 実装方法2
// 以下のように実装することで、エラーをキャッチできます。
actor.subscribe({
  next: (snapshot: SnapshotFrom<typeof actor>) => {
    const now = new Date();
    const japanTime = now.toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    console.log(`ステート:${snapshot.value}, \t現在時間:${japanTime}, `);
  },
  error: (err: unknown) => {
    // エラーが発生した場合の処理
    console.error(err);
  },
});

// アクターを開始します
actor.start(); // "Inactive" 状態

// イベントを送信します
actor.send({ type: "toggle" }); // "Active"へ遷移

// 5秒間スリープ。スリープ中にInactiveに遷移します。
await new Promise(resolve => setTimeout(resolve, 5000)); // スリープ中に "Inactive" へ遷移

// イベントを送信します
actor.send({ type: 'toggle' }); // "Active" へ遷移

// アクターを停止します
actor.stop();
