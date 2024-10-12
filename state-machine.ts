import { assign, fromPromise, setup } from "xstate";

export async function resetCounter(
  maxCount: number
): Promise<{ count: number }> {
  // 1秒間スリープする
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 50%の確率でリセットに失敗する
  if (Math.random() < 0.5) {
    throw new Error("リセットエラー");
  }

  // リセットに成功した場合は、リセットしたカウンターの値として現在値の半分の値を返す。
  return {
    count: maxCount / 2
  };
}

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
  actors: {
    // Promise actor を作成します。作成するには fromPromise を利用します。
    resetCount: fromPromise(async ({ input }: { input: { maxCount: number } }) => {
      const resetCounterResult = await resetCounter(input.maxCount);
      return resetCounterResult; // resetCounterの戻り値を返却
    })
  }
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
        reset: {
          // resetイベントを受け取ったら Resetting状態に遷移させカウンターのリセットをする
          target: "Resetting",
        }
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
    Resetting: {
      invoke: {
        id: "counterResetter",
        src: "resetCount", // Actor の実装を指定します。ここでは Promise Actorの実装を指定しています。
        input: ({ context: { maxCount } }) => ({ maxCount }), // Actor に渡す引数です。 保持しているmaxCountを渡しています。
        onDone: {
          // アクターが完了したときに実行されます。つまり、成功した時と失敗した時で遷移先を分けれます。
          target: "Inactive",
          actions: assign({ count: ({ event }) => event.output.count }),
        },
        onError: {
          // アクターがエラーをスローしたときに実行されます。つまり、成功した時と失敗した時で遷移先を分けれます。
          target: "Inactive",
        },
      },
    },
  },
});
