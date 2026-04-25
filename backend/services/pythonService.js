const { spawn } = require("child_process");
const path = require("path");

exports.runPythonPrediction = (data) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, "../../ml/predict.py");

    const py = spawn("python", [scriptPath, JSON.stringify(data)]);

    let result = "";

    py.stdout.on("data", (data) => {
      result += data.toString();
    });

    py.stderr.on("data", (err) => {
      reject(err.toString());
    });

    py.on("close", () => {
      try {
        const parsed = JSON.parse(result);
        resolve(parsed);
      } catch {
        reject("Invalid JSON from Python");
      }
    });
  });
};