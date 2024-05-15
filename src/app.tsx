import {
	type Accessor,
	For,
	type JSXElement,
	Show,
	createMemo,
	useContext,
} from "solid-js";
import "bulma/bulma.scss";
import "./app.scss";
import { MetaProvider, Title } from "@solidjs/meta";
import { MyContextProvider, type State, myContext } from "./data";

function ProgressBar(props: { val: Accessor<number> }) {
	const danger = createMemo(() => props.val() < 60);
	return (
		<div class="progress-wrapper">
			<progress
				classList={{
					progress: true,
					"show-value": true,
					"is-danger": danger(),
					"is-success": !danger(),
					"m-0": true,
				}}
				value={props.val()}
				max="100"
			>
				{props.val()}
			</progress>
			<p class="progress-value m-0">{props.val()}</p>
		</div>
	);
}

function TestPiece(props: {
	name: string;
	icon: () => JSXElement;
	data: State<number | undefined>;
	placeholder: string;
	unit: string;
	getGrade: Accessor<number> | undefined;
}) {
	return (
		<div class="panel-block rows">
			<div class="columns is-mobile container is-vcentered">
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
							onKeyUp={(e) => {
								const t = e as unknown as { target: { value: string | null } };
								if (!t.target.value) {
									props.data.set(undefined);
									return;
								}
								props.data.set(Number.parseFloat(t.target.value));
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
			<Show when={props.getGrade !== undefined}>
				<div class="mb-2 is-width-70 is-width-80-mobile">
					<ProgressBar val={props.getGrade!} />
				</div>
			</Show>
		</div>
	);
}

const TestPieces = () => {
	const ctx = useContext(myContext);
	if (!ctx) throw Error();
	const {
		reactiveHeightTest,
		reactiveGetupTest,
		reactivePullupTest,
		testResults,
		pullupResult,
		getupResult,
		overallResult,
	} = ctx;
	return (
		<div>
			{ResultPiece(overallResult)}
			{TestPiece({
				...reactiveHeightTest.ref,
				data: reactiveHeightTest.input,
				getGrade: undefined,
			})}
			<For each={testResults}>
				{(item, _) =>
					TestPiece({
						...item.ref!.ref,
						data: item.ref!.input,
						getGrade: item.getGrade,
					})
				}
			</For>
			<Show
				when={ctx.gender.get()}
				fallback={TestPiece({
					...reactiveGetupTest.ref,
					data: reactiveGetupTest.input,
					getGrade: getupResult.getGrade,
				})}
			>
				{TestPiece({
					...reactivePullupTest.ref,
					data: reactivePullupTest.input,
					getGrade: pullupResult.getGrade,
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
	return (
		<div class="panel-block columns m-0 p-1 pr-3">
			<label
				style="text-wrap: nowrap"
				class="column is-4-mobile is-2-tablet has-text-right is-size-6"
			>
				{item.name}：
			</label>
			<div class="column">
				<ProgressBar val={item.getGrade} />
			</div>
		</div>
	);
};

const Results = () => {
	const ctx = useContext(myContext);
	if (!ctx) throw Error();
	const { testResults, overallResult, pullupResult, getupResult } = ctx;
	return (
		<div class="mt-2">
			{ResultPiece(overallResult)}
			<For each={testResults}>{(item, _) => ResultPiece(item)}</For>
			<Show when={ctx.gender.get()} fallback={ResultPiece(getupResult)}>
				{ResultPiece(pullupResult)}
			</Show>
		</div>
	);
};

const Header = () => {
	return (
		<div class="container ml-4 mt-2">
			<p>
				Authored By Clouder. Check on{" "}
				<a href="https://github.com/clouder0/hitsz-pecalc">GitHub</a>.
			</p>
		</div>
	);
};

const Main = () => {
	return (
		<main class="container">
			<div class="panel is-primary">
				<p class="panel-heading">体测分数计算器</p>
				<Header />
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
