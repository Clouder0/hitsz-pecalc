# HITSZ-pecalc
HITSZ 体测分数计算器。由 Solidjs 强力驱动(?)，旧版本使用 Flutter，加载较为缓慢。本版本加载量小、性能优异，纯前端实现。

## 开发部署

使用 Bun 作为 Nodejs 运行时。

开发运行：

```bash
bun install
bun dev
```

部署运行：

```bash
bun run build
bun run start
```

完成修改后，格式化代码：

```bash
bun run check
```

## 维护

如果发生了分数计算规则的更改，可以在 `src/criteria.tsx` 文件中进行相应的修改。

对于某个规则，例如：

```js
export const maleJumpDict = [
	{
		10: 183,
		20: 188,
		30: 193,
		40: 198,
		50: 203,
		60: 208,
		62: 212,
		64: 216,
		66: 220,
		68: 224,
		70: 228,
		72: 232,
		74: 236,
		76: 240,
		78: 244,
		80: 248,
		85: 256,
		90: 263,
		95: 268,
		100: 273,
	},
	{
		10: 185,
		20: 190,
		30: 195,
		40: 200,
		50: 205,
		60: 210,
		62: 214,
		64: 218,
		66: 222,
		68: 226,
		70: 230,
		72: 234,
		74: 238,
		76: 242,
		78: 246,
		80: 250,
		85: 258,
		90: 265,
		95: 270,
		100: 275,
	},
];
```

第一个 dict 对应的是低年级计分规则，较为宽松。第二个 dict 对应的是高年级。key 为分数、value 为对应要求的项目成绩。

如果涉及到较为复杂的逻辑变动，可以去 `src/data.tsx` 中修改，例如将 `4.32` 的输入长跑成绩转换为 4min32s 进行统计：

```js
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
```

调整权重也在 `src/data.tsx` 中进行。
