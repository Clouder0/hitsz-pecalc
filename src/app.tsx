import {
  useContext,
  For,
  Show,
  type Accessor,
  createMemo,
  type JSXElement,
} from "solid-js";
import "bulma/bulma.scss";
import "./app.scss";
import { MetaProvider, Title } from "@solidjs/meta";
import { MyContextProvider, type State, myContext } from "./data";

function TestPiece(props: {
  name: string;
  icon: () => JSXElement;
  data: State<number | undefined>;
  placeholder: string;
  unit: string;
}) {
  return (
    <div class="m-0 p-1 panel-block columns is-mobile">
      <label
        style="text-wrap: nowrap"
        class="column is-4-mobile is-2-tablet has-text-right is-size-6"
      >
        {props.name}：
      </label>
      <div class="column">
        <span class="control has-icons-left">
          <span class="icon is-left">{props.icon()}</span>
          <input
            class="input"
            type="number"
            onChange={(e: { target: { value: string | null } }) => {
              if (!e.target.value) {
                props.data.set(undefined);
                return;
              }
              props.data.set(Number.parseFloat(e.target.value));
            }}
            placeholder={props.placeholder ?? props.name}
          />
        </span>
      </div>
      <label
        style="text-wrap: nowrap"
        class="m-0 p-0 column is-2-mobile is-2-tablet has-text-left is-size-6"
      >
        {props.unit}
      </label>
    </div>
  );
}

const TestPieces = () => {
  const ctx = useContext(myContext);
  if (!ctx) throw Error();
  const { reactive_regular_tests, reactive_getup_test, reactive_pullup_test } =
    ctx;
  return (
    <div>
      <For each={reactive_regular_tests}>
        {(item, _) => TestPiece({ ...item.ref, data: item.input })}
      </For>
      <Show
        when={ctx.gender.get()}
        fallback={TestPiece({
          ...reactive_getup_test.ref,
          data: reactive_getup_test.input,
        })}
      >
        {TestPiece({
          ...reactive_pullup_test.ref,
          data: reactive_pullup_test.input,
        })}
      </Show>
    </div>
  );
};

const Preface = () => {
  const ctx = useContext(myContext);
  if (!ctx) throw Error();
  return (
    <div class="panel-block">
      <div class="select">
        <select
          onChange={(e) => {
            ctx.gender.set(e.target.selectedIndex === 0);
          }}
        >
          <option>男</option>
          <option>女</option>
        </select>
      </div>
      <div class="ml-2 select">
        <select
          onChange={(e) => {
            ctx.grade.set(e.target.selectedIndex);
          }}
        >
          <option>大一</option>
          <option>大二大三大四</option>
        </select>
      </div>
    </div>
  );
};

type ResultType = {
  name: string;
  getGrade: Accessor<number>;
};

const ResultPiece = (item: ResultType) => {
  const danger = createMemo(() => item.getGrade() < 60);
  return (
    <div class="panel-block">
      <label
        style="text-wrap: nowrap"
        class="column is-4-mobile is-2-tablet has-text-right is-size-6"
      >
        {item.name}：
      </label>
      <progress
        classList={{
          progress: true,
          "show-value": true,
          "is-danger": danger(),
          "is-success": !danger(),
        }}
        value={item.getGrade()}
        max="100"
      >
        {item.getGrade()}
      </progress>
    </div>
  );
};

const Results = () => {
  const ctx = useContext(myContext);
  if (!ctx) throw Error();
  const { test_results, overall_result, pullup_result, getup_result } = ctx;
  return (
    <div class="mt-2">
      <For each={test_results}>{(item, _) => ResultPiece(item)}</For>
      <Show when={ctx.gender.get()} fallback={ResultPiece(getup_result)}>
        {ResultPiece(pullup_result)}
      </Show>
      {ResultPiece(overall_result)}
    </div>
  );
};

const Main = () => {
  return (
    <main class="container">
      <span class="icon" />
      <div class="panel is-primary">
        <p class="panel-heading">体测分数计算器</p>
        <Preface />
        <TestPieces />
        <div class="panel-block">
          <p class="title m-2">结果</p>
        </div>
        <Results />
      </div>
    </main>
  );
};

export default function App() {
  return (
    <MetaProvider>
      <Title>HITSZ 体测分数计算器</Title>
      <MyContextProvider>
        <Main />
      </MyContextProvider>
    </MetaProvider>
  );
}
