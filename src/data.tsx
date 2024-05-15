import { FaSolidBook } from "solid-icons/fa";
import {
	type Accessor,
	type JSXElement,
	type Setter,
	createContext,
	createMemo,
	createSignal,
} from "solid-js";
import {
	femaleJumpDict,
	femaleLongRunDict,
	femaleShortrunDict,
	femaleSpecDict,
	femaleStretchDict,
	femaleVitalDict,
	maleJumpDict,
	maleLongRunDict,
	maleShortrunDict,
	maleSpecDict,
	maleStretchDict,
	maleVitalDict,
} from "./criteria";

export type State<T> = {
	get: Accessor<T>;
	set: Setter<T>;
};

export function createState<T>(): State<T | undefined>;
export function createState<T>(value: T): State<T>;
export function createState<T>(value?: T) {
	const [get, set] =
		value !== undefined ? createSignal<T>(value) : createSignal<T>();
	return { get, set };
}

export type RawTestType = {
	name: string;
	data: State<number | undefined>;
	icon: JSXElement;
	placeholder: string;
	unit: string;
};
export const myContext = createContext<MyContextType>();
export type MyContextType = ReturnType<typeof initContext>;

function initContext() {
	const gender = createState(true);
	const selectGrade = createState<number>(0);

	const decorateTest = (x: (typeof regularTests)[0]) => {
		const state = createState<number>();
		return {
			ref: x,
			input: state,
			getGrade: createMemo(() =>
				x.grade(state.get(), gender.get(), selectGrade.get()),
			),
		};
	};
	const reactiveRegularTests = regularTests.map(decorateTest);
	const reactivePullupTest = decorateTest(pullupTest);
	const reactiveGetupTest = decorateTest(getupTest);
	const reactiveHeightTest = decorateTest(heightTest);

	const bmiResult = {
		name: "BMI",
		getGrade: createMemo((): number => {
			console.log("get bmi");
			const height = reactiveHeightTest.input.get();
			const weight = reactiveRegularTests
				.find((x) => x.ref.name === "体重")
				?.input.get();
			if (!height || !weight) {
				return 0;
			}
			const _bmi =
				weight / ((height as number) / 100.0) / ((height as number) / 100.0);
			const bmi = Math.round(_bmi * 10) * 0.1; // precision set to 1
			if (gender.get()) {
				if (bmi >= 28) return 60;
				if (bmi <= 17.8) return 80;
				if (bmi >= 24) return 80;
				return 100;
			}
			if (bmi >= 28) return 60;
			if (bmi <= 17.1) return 80;
			if (bmi >= 24) return 80;
			return 100;
		}),
		weight: 0.15,
		ref: reactiveRegularTests.find((x) => x.ref.name === "体重"),
	};

	const test2result = (x: (typeof reactiveRegularTests)[0]) => ({
		ref: x,
		name: x.ref.name,
		weight: x.ref.weight,
		getGrade: x.getGrade,
	});
	const testResults = [bmiResult].concat(
		reactiveRegularTests.filter((x) => x.ref.name !== "体重").map(test2result),
	);

	const pullupResult = test2result(reactivePullupTest);
	const getupResult = test2result(reactiveGetupTest);
	const overallResult = {
		name: "总分",
		getGrade: createMemo(() =>
			Math.round(
				testResults.reduce((acc, cur) => acc + cur.getGrade() * cur.weight, 0) +
					(gender.get()
						? pullupResult.weight * pullupResult.getGrade()
						: getupResult.weight * getupResult.getGrade()),
			),
		),
		weight: 1,
	};

	return {
		gender,
		grade: selectGrade,
		reactiveRegularTests,
		reactivePullupTest,
		reactiveGetupTest,
		reactiveHeightTest,
		testResults,
		pullupResult,
		getupResult,
		overallResult,
	};
}
export const MyContextProvider = (props: { children: JSXElement }) => (
	<myContext.Provider value={initContext()}>
		{props.children}
	</myContext.Provider>
);

const genGrader = (
	maleDict: Record<number, number>[],
	femaleDict: typeof maleDict,
	reverse = false,
) => {
	const getGradeInDict = (
		val: number,
		dict: (typeof maleDict)[0],
		reverse: boolean,
	) => {
		const entries = Object.entries(dict);
		let i = entries.length - 1;
		while (i >= 0) {
			if ((reverse ? -1 : 1) * (val - entries[i][1]) >= 0)
				return Number.parseInt(entries[i][0]);
			i--;
		}
		return 0;
	};
	return (val: number | undefined, gender: boolean, grade: number) => {
		if (val === undefined) return 0;
		console.log("get grade", val, gender, grade);
		return gender
			? getGradeInDict(val, maleDict[grade], reverse)
			: getGradeInDict(val, femaleDict[grade], reverse);
	};
};

const heightTest = {
	name: "身高",
	icon: () => <FaSolidBook />,
	placeholder: "175",
	unit: "cm",
	weight: 0,
	grade: (val: number | undefined, gender: boolean, grade: number) => 1.0,
};
const weightTest = {
	name: "体重",
	icon: () => <FaSolidBook />,
	placeholder: "70",
	unit: "kg",
	weight: 0,
	grade: (val: number | undefined, gender: boolean, grade: number) => 1.0,
};
const vitalTest = {
	name: "肺活量",
	icon: () => <FaSolidBook />,
	placeholder: "4000",
	unit: "",
	weight: 0.15,
	grade: genGrader(maleVitalDict, femaleVitalDict),
};
const shortrunTest = {
	name: "50米",
	icon: () => <FaSolidBook />,
	placeholder: "7.8",
	unit: "s",
	weight: 0.2,
	grade: genGrader(maleShortrunDict, femaleShortrunDict, true),
};
const stretchTest = {
	name: "坐位体前屈",
	icon: () => <FaSolidBook />,
	placeholder: "26.5",
	unit: "cm",
	weight: 0.1,
	grade: genGrader(maleStretchDict, femaleStretchDict),
};
const jumpTest = {
	name: "立定跳远",
	icon: () => <FaSolidBook />,
	placeholder: "245",
	unit: "cm",
	weight: 0.1,
	grade: genGrader(maleJumpDict, femaleJumpDict),
};

const longrunTest = {
	name: "耐力跑",
	icon: () => <FaSolidBook />,
	placeholder: "4.32",
	unit: "(m.s)",
	weight: 0.2,
	grade: (val: number | undefined, gender: boolean, grade: number) => {
		if (val === undefined) return 0;
		const remainder = val % 1.0;
		const rawGrader = genGrader(maleLongRunDict, femaleLongRunDict, true);
		return rawGrader((val - remainder) * 60 + remainder * 100, gender, grade);
	},
};

const pullupTest = {
	name: "引体向上",
	icon: () => <FaSolidBook />,
	placeholder: "18",
	unit: "个",
	weight: 0.1,
	grade: genGrader(maleSpecDict, maleSpecDict),
};

const getupTest = {
	name: "仰卧起坐",
	icon: () => <FaSolidBook />,
	placeholder: "50",
	unit: "个",
	weight: 0.1,
	grade: genGrader(femaleSpecDict, femaleSpecDict),
};

const regularTests = [
	weightTest,
	vitalTest,
	shortrunTest,
	stretchTest,
	jumpTest,
	longrunTest,
];
