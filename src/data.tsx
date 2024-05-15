import { FaSolidBook } from "solid-icons/fa";
import {
  type Accessor,
  type JSXElement,
  type Setter,
  createContext,
  createMemo,
  createSignal,
  useContext,
} from "solid-js";
import { femaleJumpDict, femaleLongRunDict, femaleShortrunDict, femaleSpecDict, femaleStretchDict, femaleVitalDict, maleJumpDict, maleLongRunDict, maleShortrunDict, maleSpecDict, maleStretchDict, maleVitalDict } from "./criteria";

export type State<T> = {
  get: Accessor<T>;
  set: Setter<T>;
};

export function createState<T>(): State<T | undefined>;
export function createState<T>(value: T): State<T>;
export function createState<T>(value?: T) {
  const [get, set] = value !== undefined ? createSignal<T>(value) : createSignal<T>();
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
  const select_grade = createState<number>(0);

  const decorate_test = (x: (typeof regular_tests)[0]) => {
    const state = createState<number>();
    return {
      ref: x,
      input: state,
      getGrade: createMemo(() => x.grade(state.get(), gender.get(), select_grade.get())),
    };
  };
  const reactive_regular_tests = regular_tests.map(decorate_test);
  const reactive_pullup_test = decorate_test(pullup_test);
  const reactive_getup_test = decorate_test(getup_test);

  const bmi_result = {
    name: "BMI",
    getGrade: createMemo((): number => {
      console.log("get bmi");
      const height = reactive_regular_tests
        .find((x) => x.ref.name === "身高")
        ?.input.get();
      const weight = reactive_regular_tests
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
  };
  
  const test2result = (x: typeof reactive_regular_tests[0]) => ({
    name:x.ref.name,
    weight:x.ref.weight,
    getGrade: x.getGrade
  })
  const test_results = [bmi_result].concat(
    reactive_regular_tests
      .filter((x) => x.ref.name !== "身高" && x.ref.name !== "体重")
      .map(test2result)
  );

  const overall_result = {
    name: "总分",
    getGrade: createMemo(() =>
      Math.round(
        test_results.reduce((acc, cur) => acc + cur.getGrade() * cur.weight, 0)
      )
    ),
    weight: 1,
  };

  return {
    gender,
    grade: select_grade,
    reactive_regular_tests,
    reactive_pullup_test,
    reactive_getup_test,
    test_results,
    pullup_result: test2result(reactive_pullup_test),
    getup_result: test2result(reactive_getup_test),
    overall_result,
  };
}
export const MyContextProvider = (props: { children: JSXElement }) => (
  <myContext.Provider value={initContext()}>
    {props.children}
  </myContext.Provider>
);

const genGrader = (male_dict: Record<number,number>[], female_dict: typeof male_dict, reverse = false) => {
  const getGradeInDict = (val: number, dict: (typeof male_dict)[0],reverse:boolean) => {
    const entries = Object.entries(dict);
    if (reverse) {
      let i = 0;
      while (i < entries.length) {
        if (val >= entries[i][1]) return Number.parseInt(entries[i][0]);
        i++;
      }
      return 0;
    }
    let i = entries.length - 1;
    while (i >= 0) {
      if (val >= entries[i][1]) return Number.parseInt(entries[i][0]);
      i--;
    }
    return 0;
  };
  return (val: number | undefined, gender: boolean, grade: number) => {
    if(val === undefined) return 0;
    console.log("get grade", val, gender, grade);
    return gender
      ? getGradeInDict(val, male_dict[grade],reverse)
      : getGradeInDict(val, female_dict[grade],reverse);
  };
}

const height_test = {
  name: "身高",
  icon: () => <FaSolidBook />,
  placeholder: "175",
  unit: "cm",
  weight: 0,
  grade: (val:number | undefined,gender:boolean, grade:number) => 1.0
};
const weight_test = {
  name: "体重",
  icon: () => <FaSolidBook />,
  placeholder: "70",
  unit: "kg",
  weight: 0,
  grade: (val:number | undefined,gender:boolean, grade:number) => 1.0
};
const vital_test = {
  name: "肺活量",
  icon: () => <FaSolidBook />,
  placeholder: "4000",
  unit: "",
  weight: 0.15,
  grade: genGrader(maleVitalDict,femaleVitalDict)
};
const shortrun_test = {
  name: "50米",
  icon: () => <FaSolidBook />,
  placeholder: "4000",
  unit: "s",
  weight: 0.2,
  grade: genGrader(maleShortrunDict,femaleShortrunDict,true)
};
const stretch_test = {
  name: "坐位体前屈",
  icon: () => <FaSolidBook />,
  placeholder: "26.5",
  unit: "cm",
  weight: 0.1,
  grade: genGrader(maleStretchDict, femaleStretchDict)
};
const jump_test = {
  name: "立定跳远",
  icon: () => <FaSolidBook />,
  placeholder: "245",
  unit: "cm",
  weight: 0.1,
  grade: genGrader(maleJumpDict, femaleJumpDict)
};
const longrun_test = {
  name: "耐力跑",
  icon: () => <FaSolidBook />,
  placeholder: "4.32",
  unit: "min",
  weight: 0.2,
  grade: genGrader(maleLongRunDict, femaleLongRunDict,true)
};

const pullup_test = {
  name: "引体向上",
  icon: () => <FaSolidBook />,
  placeholder: "18",
  unit: "个",
  weight: 0.1,
  grade: genGrader(maleSpecDict, maleSpecDict)
};

const getup_test = {
  name: "仰卧起坐",
  icon: () => <FaSolidBook />,
  placeholder: "50",
  unit: "个",
  weight: 0.1,
  grade: genGrader(femaleSpecDict, femaleSpecDict)
};

const regular_tests = [
  height_test,
  weight_test,
  vital_test,
  shortrun_test,
  stretch_test,
  jump_test,
  longrun_test,
];