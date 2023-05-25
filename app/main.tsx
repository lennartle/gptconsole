import { useRef } from "react";

import Header from "./header";
import MemoMessage from "./message";

const Main = () => {
  const mainViewRef = useRef(null);

  return (
    <main
      className="bg-black fixed flex flex-col-reverse h-full w-full items-center overflow-y-scroll"
      ref={mainViewRef}
    >
      <div className="mb-auto" />
      <div className="w-full max-w-screen-lg">
        <Header />
        <MemoMessage id={"#0000"} initialContent={[]} containerRef={mainViewRef} />
      </div>
    </main>
  );
};

export default Main;
