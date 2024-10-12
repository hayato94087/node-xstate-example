import { createMachine } from "xstate";

export const toggleMachine = createMachine({
  id: "toggle", // ステートマシンの ID
  initial: "Inactive", // Inactive 状態を初期状態とする
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
      // toggleイベントを受け取ったら Inactive 状態に遷移
      on: { toggle: "Inactive" },
    },
  },
});
