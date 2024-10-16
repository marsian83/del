import { Link } from "react-router-dom";
import DocTitle from "../../common/DocTitle";

export default function ErrorPage() {
  return (
    <article className="flex h-screen items-center justify-center">
      <DocTitle title="404 Not Found.." />

      <div className="relative flex w-[30vw] flex-col items-center gap-y-2 rounded-2xl border border-front border-opacity-20 bg-background p-6 shadow-lg mobile:w-[80vw]">
        <div
          className="absolute-cover -z-10 scale-90 animate-pulse bg-primary blur-3xl"
          style={{ animationDelay: "1s" }}
        />

        <img
          src="/images/soparu_disappointed_head.png"
          alt="soparu sad"
          className="w-1/3"
        />

        <h1 className="text-7xl font-black text-primary">404</h1>
        <div className="absolute-cover -z-1 scale-90 animate-pulse bg-secondary blur-3xl" />
        <p className="mb-3 text-center text-sm text-front text-opacity-70">
          Soparu thinks you are lost. This magical button can help you get back
          though
        </p>
        <Link
          to="/"
          className="rounded-md bg-secondary/50 p-2 transition-all hover:bg-secondary/60"
        >
          Back to Safety
        </Link>
      </div>
    </article>
  );
}
