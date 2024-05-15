import { MetaProvider, Title } from "@solidjs/meta";
import { FaSolidBook } from "solid-icons/fa";
import { TestPiece } from "./app";


export default function App() {
  return (
    <MetaProvider>
      <Title>HITSZ 体测分数计算器</Title>
      <main class="container">
        <span class="icon">
          <i class="fas fa-home"></i>
        </span>
        <div class="panel is-primary">
          <p class="panel-heading">体测分数计算器</p>
          <TestPiece name="引体向上" calc={() => { }} icon={<FaSolidBook />} />
          <TestPiece name="1km" calc={() => { }} icon={<FaSolidBook />} />
          <div class="panel-block is-active">
            <span class="panel-icon">
              <i class="fas fa-bookmark" aria-hidden="false"></i>
            </span>
            bulma
          </div>
        </div>
      </main>
    </MetaProvider>
  );
}
