import { assign, setup } from "xstate";

export const toggleMachine = setup({
  types: {
    // 型定義
    context: {} as {
      count: number; // カウンター
    },
  },
}).createMachine({
  id: "toggle", // ステートマシンの ID
  initial: "Inactive", // Inactive 状態を初期状態とする
  context: { count: 0 }, // カウンターを定義し初期化
  states: {
    // Inactive 状態
    Inactive: {
      on: {
        // toggleイベントを受け取ったら Active 状態に遷移
        toggle: "Active",
      },
    },
    // Active 状態
    Active: {
      // entry で定義した関数を遷移時に実行されます
      entry: assign({
        count: ({ context }) => context.count + 1, // カウンターに1つ追加
      }),
      // toggleイベントを受け取ったら Inactive 状態に遷移
      on: { toggle: "Inactive" },
      after: { 2000: "Inactive" }, // 2秒後に遷移
    },
  },
});
