import Chart from "./components/Chart";
import Swap from "./components/Swap";
import DocTitle from "../../common/DocTitle";

export default function () {
  return (
    <div className="p-page mt-4 flex flex-col gap-4">
      <DocTitle title="Swap" />
      <section className="mb-8 mt-4 flex flex-col gap-2">
        <Swap />
      </section>
      <section className="mb-8 flex flex-col gap-2">
        <Chart />
      </section>
    </div>
  );
}
