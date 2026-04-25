import { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

/* ============================= */
/* 🔹 FILTER BAR */
/* ============================= */
function FilterBar({ filter, setFilter }) {
  const filters = ["all", "high", "low"];

  return (
    <div className="flex gap-3 mb-5">
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => setFilter(f)}
          className={`px-4 py-1.5 rounded-full text-sm transition ${
            filter === f
              ? "bg-[#6B8E23] text-white"
              : "bg-[#0E1A14] border border-[#1F3A2F] text-[#9FB7A7]"
          }`}
        >
          {f.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/* ============================= */
/* 🔹 MAIN DASHBOARD */
/* ============================= */
export default function Dashboard({ latestResult }) {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("all");

  const fetchData = () => {
    axios.get("http://localhost:5000/predict/history")
      .then(res => setTransactions(res.data));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [latestResult]);

  const filtered = transactions.filter(t => {
    if (filter === "high") return t.prediction === "Fraud";
    if (filter === "low") return t.prediction !== "Fraud";
    return true;
  });

  /* ============================= */
  /* 📊 CHART DATA */
/* ============================= */

  const high = transactions.filter(t => t.prediction === "Fraud").length;
  const low = transactions.length - high;

  const pieData = [
    { name: "High", value: high },
    { name: "Low", value: low }
  ];

  const typeMap = {};
  transactions.forEach(t => {
    typeMap[t.transactionType] =
      (typeMap[t.transactionType] || 0) + 1;
  });

  const barData = Object.keys(typeMap).map(key => ({
    name: key,
    value: typeMap[key]
  }));

  const trendData = transactions.map((t, i) => ({
    index: i + 1,
    value: t.confidence ? t.confidence * 100 : 0
  }));

  /* ============================= */
  /* 📄 FINAL REPORT */
/* ============================= */

  function generateReport(data) {
    if (!data.length) return;

    const clean = (text) =>
      text
        ?.replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/__/g, "")
        .replace(/`/g, "") || "Pending";

    const total = data.length;
    const highData = data.filter(t => t.prediction === "Fraud");
    const lowCount = total - highData.length;

    const avgConf =
      data.reduce((sum, t) => sum + (t.confidence || 0), 0) / total;

    const now = new Date().toLocaleString();

    // 🔥 AI SUMMARY (SMART)
    const aiSummary = `
      The system analyzed ${total} transactions and identified ${highData.length} as high-risk.
      This results in a fraud likelihood of ${((highData.length / total) * 100).toFixed(1)}%.
      High-risk patterns are commonly associated with higher transaction amounts,
      unusual transaction frequencies, and non-domestic activity patterns.
      Overall, the system demonstrates consistent confidence averaging ${(avgConf * 100).toFixed(1)}%.
    `;

    const rows = data.map(t => `
      <tr>
        <td>${t.amount}</td>
        <td>${t.transactionType}</td>
        <td style="color:${t.prediction === "Fraud" ? "#FF4D4D" : "#8BC34A"}">
          ${t.prediction === "Fraud" ? "High" : "Low"}
        </td>
        <td>${(t.confidence * 100).toFixed(1)}%</td>
        <td>${clean(t.explanation)}</td>
      </tr>
    `).join("");

    const win = window.open("", "_blank");

    win.document.write(`
      <html>
      <head>
        <title>FraudGuard AI Report</title>
        <style>
          body {
            font-family: Arial;
            padding: 40px;
            background: #0E1A14;
            color: #E8F5E9;
          }
          .card {
            background: #13241C;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 20px;
          }
          canvas {
            margin-top: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #1F3A2F;
            padding: 8px;
          }
          th { background: #152A21; }
        </style>
      </head>

      <body>

        <h1>FraudGuard AI Report</h1>
        <p>Generated: ${now}</p>

        <div class="card">
          <h3>AI Summary</h3>
          <p>${aiSummary}</p>
        </div>

        <div class="card">
          <h3>Statistics</h3>
          <p>Total: ${total}</p>
          <p>High Risk: ${highData.length}</p>
          <p>Low Risk: ${lowCount}</p>
          <p>Average Confidence: ${(avgConf * 100).toFixed(1)}%</p>
        </div>

        <div class="card">
          <h3>Risk Distribution</h3>
          <canvas id="pie" width="300" height="200"></canvas>
        </div>

        <div class="card">
          <h3>Confidence Trend</h3>
          <canvas id="line" width="400" height="200"></canvas>
        </div>

        <div class="card">
          <h3>Transactions</h3>
          <table>
            <thead>
              <tr>
                <th>Amount</th>
                <th>Type</th>
                <th>Prediction</th>
                <th>Confidence</th>
                <th>Insight</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>

        <script>
          const ctx = document.getElementById("pie").getContext("2d");
          ctx.fillStyle = "#FF4D4D";
          ctx.fillRect(0,0,150,200);
          ctx.fillStyle = "#8BC34A";
          ctx.fillRect(150,0,150,200);

          const line = document.getElementById("line").getContext("2d");
          line.beginPath();
          line.strokeStyle = "#6B8E23";

          const data = ${JSON.stringify(trendData.map(d => d.value))};

          data.forEach((v,i)=>{
            const x = i * 30;
            const y = 200 - v;
            if(i===0) line.moveTo(x,y);
            else line.lineTo(x,y);
          });

          line.stroke();

          window.onload = () => window.print();
        </script>

      </body>
      </html>
    `);

    win.document.close();
  }

  return (
    <div className="bg-[#13241C]/90 border border-[#1F3A2F] rounded-2xl p-6">

      <h3 className="text-white font-semibold mb-4">
        Analytics Overview
      </h3>

      <button
        onClick={() => generateReport(transactions)}
        className="mb-6 px-5 py-2 rounded-lg bg-[#6B8E23] text-white hover:bg-[#7FAE3A]"
      >
        Generate Report
      </button>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <ChartCard title="Risk Distribution">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="value">
                <Cell fill="#FF4D4D" />
                <Cell fill="#8BC34A" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Transaction Types">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}>
              <XAxis dataKey="name" stroke="#9FB7A7" />
              <YAxis stroke="#9FB7A7" />
              <Tooltip />
              <Bar dataKey="value" fill="#6B8E23" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Confidence Trend">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <XAxis dataKey="index" stroke="#9FB7A7" />
              <YAxis stroke="#9FB7A7" />
              <Tooltip />
              <Line dataKey="value" stroke="#5C4033" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <FilterBar filter={filter} setFilter={setFilter} />
      <Table data={filtered} />

    </div>
  );
}

/* ============================= */
function ChartCard({ title, children }) {
  return (
    <div className="bg-[#0E1A14] border border-[#1F3A2F] p-4 rounded-xl">
      <p className="text-[#9FB7A7] text-sm mb-2">{title}</p>
      {children}
    </div>
  );
}

/* ============================= */
function Table({ data }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#1F3A2F]">
      <table className="w-full text-sm text-[#E8F5E9]">
        <thead className="bg-[#0E1A14]">
          <tr>
            <th className="p-3 text-left">Amount</th>
            <th>Type</th>
            <th>Prediction</th>
            <th>Confidence</th>
            <th>Insight</th>
          </tr>
        </thead>

        <tbody>
          {data.map((t, i) => (
            <tr key={i} className={`border-t border-[#1F3A2F] ${i % 2 === 0 ? "bg-[#0E1A14]" : "bg-[#102018]"}`}>
              <td className="p-3">${t.amount}</td>
              <td>{t.transactionType}</td>
              <td className={t.prediction === "Fraud" ? "text-red-400" : "text-green-400"}>
                {t.prediction === "Fraud" ? "High" : "Low"}
              </td>
              <td>{t.confidence ? `${(t.confidence * 100).toFixed(1)}%` : "—"}</td>
              <td className="text-[#B7CFC0]">{t.explanation || "Analyzing with AI..."}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}