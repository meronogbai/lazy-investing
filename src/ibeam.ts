import { execSync, spawn } from "node:child_process";

export const startIbeam = async () => {
  return new Promise((resolve, reject) => {
    console.log("Authenticating via ibeam...");
    console.log(
      "⌛️ This may take a few seconds... (or minutes if you have 2FA enabled)"
    );

    execSync("docker compose up ibeam -d", {
      stdio: "ignore",
    });

    const child = spawn("docker", [
      "compose",
      "logs",
      "ibeam",
      "-f",
      "--since",
      "1ms", // @HACK: only get the logs from the current session
    ]);

    child.on("error", (err) => {
      reject(err);
    });

    child.stdout.on("data", (chunk) => {
      const data = chunk.toString();

      if (typeof data !== "string") {
        return;
      }

      if (
        data
          .toString()
          .toLowerCase()
          .includes("gateway running and authenticated")
      ) {
        child.kill("SIGINT");
        console.log("✅ Authenticated via ibeam");
        resolve(undefined);
      }
    });
  });
};

export const stopIbeam = () => {
  execSync("docker compose stop ibeam", {
    stdio: "ignore",
  });
  console.log("🛑 Stopped ibeam");
};
