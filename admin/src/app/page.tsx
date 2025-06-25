"use client";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import useOrders from "@/hooks/useOrders";
import { formatCurrency } from "@/utils/formatCurrency";
import { CalendarDays } from "lucide-react";

interface ChartDataItem {
  name: string;
  "Ganancia": number;
  "Órdenes": number;
}

const PERIODS = [
  { key: "day", label: "Hoy" },
  { key: "week", label: "Semana" },
  { key: "month", label: "Mes" },
  { key: "year", label: "Año" },
  { key: "custom", label: "Custom" },
];

export default function Home() {
  const { getOrderGains, gains, gainsLoading, gainsError } = useOrders();
  const [period, setPeriod] = useState<
    "day" | "week" | "month" | "year" | "custom"
  >("day");
  const [customRange, setCustomRange] = useState<{
    fromDate: string;
    toDate: string;
  }>({ fromDate: "", toDate: "" });
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);

  useEffect(() => {
    if (period === "custom" && customRange.fromDate && customRange.toDate) {
      getOrderGains({ period: "custom", ...customRange });
    } else if (period !== "custom") {
      getOrderGains({ period });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, customRange.fromDate, customRange.toDate]);

  useEffect(() => {
    if (gains) {
      let chartName = PERIODS.find((p) => p.key === period)?.label || "Custom";
      
      if (period === "custom" && customRange.fromDate && customRange.toDate) {
        const formatDate = (dateStr: string) => {
          const date = new Date(dateStr);
          return date.toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "2-digit", 
            year: "numeric"
          });
        };
        chartName = `${formatDate(customRange.fromDate)} - ${formatDate(customRange.toDate)}`;
      }
      
      setChartData([
        {
          name: chartName,
          "Ganancia": gains.totalGainUSD,
          "Órdenes": gains.orderCount,
        },
      ]);
    }
  }, [gains, period, customRange.fromDate, customRange.toDate]);

  return (
    <div className="px-2 py-4 sm:px-4 sm:py-6 max-w-full sm:max-w-2xl mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold text-[#111111] mb-4">
        Dashboard de ganancias
      </h2>
      <div className="flex flex-wrap gap-2 mb-4">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() =>
              setPeriod(p.key as "day" | "week" | "month" | "year" | "custom")
            }
            className={`btn rounded-none border border-[#e1e1e1] shadow-none px-3 py-1 text-base font-medium ${
              period === p.key
                ? "bg-[#222222] text-white"
                : "bg-[#ffffff] text-[#222222]"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {period === "custom" && (
        <div className="flex flex-wrap gap-4 mb-4">
          {/* From Date Input with Fieldset */}
          <fieldset className="fieldset bg-[#ffffff] text-[#222222]">
            <legend className="fieldset-legend text-[#222222] px-2 bg-[#ffffff]">Fecha desde</legend>
            <div className="relative">
              <input
                type="date"
                value={customRange.fromDate}
                onChange={(e) =>
                  setCustomRange((r) => ({ ...r, fromDate: e.target.value }))
                }
                className="input border border-[#e1e1e1] rounded-none bg-[#FFFFFF] text-[#222222] pr-10"
                id="fromDateInput"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#888] hover:text-[#111] focus:outline-none bg-transparent"
                tabIndex={-1}
                onClick={() => {
                  const input = document.getElementById("fromDateInput");
                  if (input) {
                    (input as HTMLInputElement).showPicker?.();
                    input.focus();
                  }
                }}
              >
                <CalendarDays size={18} />
              </button>
            </div>
          </fieldset>
          {/* To Date Input with Fieldset */}
          <fieldset className="fieldset bg-[#ffffff] text-[#222222]">
            <legend className="fieldset-legend text-[#222222] px-2 bg-[#ffffff]">Fecha hasta</legend>
            <div className="relative">
              <input
                type="date"
                value={customRange.toDate}
                onChange={(e) =>
                  setCustomRange((r) => ({ ...r, toDate: e.target.value }))
                }
                className="input border border-[#e1e1e1] rounded-none bg-[#FFFFFF] text-[#222222] pr-10"
                id="toDateInput"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#888] hover:text-[#111] focus:outline-none bg-transparent"
                tabIndex={-1}
                onClick={() => {
                  const input = document.getElementById("toDateInput");
                  if (input) {
                    (input as HTMLInputElement).showPicker?.();
                    input.focus();
                  }
                }}
              >
                <CalendarDays size={18} />
              </button>
            </div>
          </fieldset>
        </div>
      )}
      <div className="bg-[#ffffff] rounded-none shadow-md p-2 sm:p-4">
        {gainsLoading ? (
          <div className="p-4 text-center text-sm opacity-60">Cargando...</div>
        ) : gainsError ? (
          <div className="p-4 text-center text-error">{gainsError}</div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              margin={{ top: 40, right: 20, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "Ganancia") {
                    return formatCurrency(Number(value), "en-US", "USD");
                  }
                  return value;
                }}
              />
              <Legend />
              <Bar
                dataKey="Ganancia"
                fill="#1976d2"
                name="Ganancia"
                label={({ x, y, width, value }) => (
                  <text
                    x={x! + width! / 2}
                    y={y! - 12}
                    textAnchor="middle"
                    fill="#1976d2"
                    fontSize={12}
                    fontWeight={600}
                  >
                    {formatCurrency(Number(value), "en-US", "USD")}
                  </text>
                )}
              />
              <Bar dataKey="Órdenes" fill="#82ca9d" name="Órdenes" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
