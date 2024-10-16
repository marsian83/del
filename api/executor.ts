import { spawn } from "child_process";
import fs from "fs";

const outputStore: Record<
  string,
  { pycode: string; output: string | null; completed?: boolean }
> = {};
const executionQueue: string[] = [];

let semaphore = false;

function safeCheckAndExecute() {
  if (semaphore) return;

  try {
    if (executionQueue.length > 0) {
      semaphore = true;
      const nxt = executionQueue.shift();
      if (!nxt) throw "Failed to execute";
      fs.writeFile("./api/focus_func.py", outputStore[nxt].pycode, () => {
        try {
          const pythonProcess = spawn("python3", ["api/focus_func.py"]);

          pythonProcess.stdout.on("data", (data) => {
            outputStore[nxt].output = data.toString().trim();
            outputStore[nxt].completed = true;
            semaphore = false;
          });

          pythonProcess.stderr.on("data", (data) => {
            console.error(`Python error: ${data}`);
            throw data;
          });
        } catch (err) {}
      });
    }
  } catch (err) {
    console.error(err);
  }
}

export default { outputStore, executionQueue, safeCheckAndExecute };
