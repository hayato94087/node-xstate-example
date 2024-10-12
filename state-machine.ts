import { assign, setup } from "xstate";

export const toggleMachine = setup({
  types: {
    // 型定義
    context: {} as {
      count: number; // カウンター
      maxCount: number; // カウンターの最大値
    },
    input: {} as {
      initialCount?: number; // カウンターの初期値
      maxCount: number; // カウンターの最大値
    },
  },
}).createMachine({
  id: "toggle", // ステートマシンの ID
  initial: "Inactive", // Inactive 状態を初期状態とする
  context: ({ input }) => ({
    count: input.initialCount ?? 0, // カウンター
    maxCount: input.maxCount, // カウンターの最大値
  }),
  states: {
    // Inactive 状態
    Inactive: {
      on: {
        toggle: {
          // カウンターがmaxCount未満の場合にのみtoggle遷移をトリガーする
          guard: ({ context }) => context.count < context.maxCount, 
          // toggleイベントを受け取ったら Active 状態に遷移
          target: "Active",
        },
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
