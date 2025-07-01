"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import useOrders from "@/hooks/useOrders";
import { formatCurrency } from "@/utils/formatCurrency";

// Importa ECharts de forma dinámica para evitar problemas de SSR
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const PERIOD_OPTIONS = [
  { value: "day", label: "Día" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
  { value: "year", label: "Año" },
  { value: "custom", label: "Personalizado" },
];

export default function Home() {
  const { gains, gainsLoading, gainsError, getOrderGains } = useOrders();
  const [period, setPeriod] = useState<string>("day");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch gains cuando cambian los filtros
  useEffect(() => {
    if (period === "custom" && fromDate && toDate) {
      getOrderGains({ period, fromDate, toDate });
    } else if (period !== "custom") {
      getOrderGains({ period });
    }
  }, [period, fromDate, toDate, getOrderGains]);

  // Prepara los datos para el gráfico
  const xData = gains?.breakdown?.map((b) => b.label) || [];
  const yData = gains?.breakdown?.map((b) => b.totalGainUSD) || [];
  const countData = gains?.breakdown?.map((b) => b.orderCount) || [];

  // Cards resumen
  const summaryCards = [
    {
      label: "Total Ganancia (USD)",
      value: formatCurrency(gains?.totalGainUSD ?? 0, "en-US", "USD") ?? "-",
    },
    {
      label: "Cantidad de Órdenes",
      value: gains?.orderCount?.toLocaleString() ?? "-",
    },
    {
      label: "Desde",
      value: gains?.fromDate
        ? new Date(gains.fromDate).toLocaleDateString()
        : "-",
    },
    {
      label: "Hasta",
      value: gains?.toDate ? new Date(gains.toDate).toLocaleDateString() : "-",
    },
  ];

  const option = {
    title: {
      text: "Ganancias y Cantidad de Órdenes por periodo",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      formatter: (
        params: Array<{
          seriesName: string;
          data: number;
          color: string;
          axisValueLabel?: string;
        }>
      ) => {
        let tooltip = params[0]?.axisValueLabel
          ? `<b>${params[0].axisValueLabel}</b><br/>`
          : "";
        params.forEach((item) => {
          if (item.seriesName === "Ganancia USD") {
            tooltip += `<span style='color:${item.color}'>●</span> ${
              item.seriesName
            }: <b>${formatCurrency(item.data, "en-US", "USD")}</b><br/>`;
          } else {
            tooltip += `<span style='color:${item.color}'>●</span> ${item.seriesName}: <b>${item.data}</b><br/>`;
          }
        });
        return tooltip;
      },
    },
    legend: {
      data: ["Ganancia USD", "Cantidad de Órdenes"],
      top: 30,
    },
    xAxis: {
      type: "category",
      data: xData,
      boundaryGap: false,
    },
    yAxis: [
      {
        type: "value",
        name: "Ganancia USD",
        position: "left",
      },
      {
        type: "value",
        name: "Órdenes",
        position: "right",
        minInterval: 1,
      },
    ],
    series: [
      {
        data: yData,
        type: "line",
        smooth: true,
        areaStyle: {},
        name: "Ganancia USD",
        showSymbol: false,
        lineStyle: {
          width: 3,
        },
        itemStyle: {
          color: "#5470C6",
        },
        yAxisIndex: 0,
      },
      {
        data: countData,
        type: "line",
        smooth: true,
        name: "Cantidad de Órdenes",
        showSymbol: false,
        lineStyle: {
          width: 3,
          type: "dashed",
        },
        itemStyle: {
          color: "#91cc75",
        },
        yAxisIndex: 1,
      },
    ],
    grid: { left: 40, right: 40, bottom: 40, top: 80 },
  };

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1 className="text-[#111111] font-bold text-2xl mb-4">
        Dashboard de Ganancias
      </h1>
      {/* Selector de periodo */}
      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center",
          marginBottom: 24,
          color: "#111",
          flexWrap: isMobile ? "wrap" : undefined,
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        <div
          style={{
            width: isMobile ? "100%" : undefined,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <label htmlFor="period" style={{ color: "#222" }}>
            Periodo:
          </label>
          <select
            id="period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            style={{
              padding: 4,
              color: "#111",
              background: "#fff",
              border: "1px solid #ccc",
            }}
          >
            {PERIOD_OPTIONS.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                style={{ color: "#111" }}
              >
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {period === "custom" && (
          <div
            style={{
              width: isMobile ? "100%" : "auto",
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: 8,
              alignItems: isMobile ? "flex-start" : "center",
            }}
          >
            <label htmlFor="fromDate" style={{ color: "#222" }}>
              Desde:
            </label>
            <input
              id="fromDate"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{
                padding: 4,
                color: "#111",
                background: "#fff",
                border: "1px solid #ccc",
                width: isMobile ? "100%" : undefined,
              }}
            />
            <label htmlFor="toDate" style={{ color: "#222" }}>
              Hasta:
            </label>
            <input
              id="toDate"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{
                padding: 4,
                color: "#111",
                background: "#fff",
                border: "1px solid #ccc",
                width: isMobile ? "100%" : undefined,
              }}
            />
          </div>
        )}
      </div>
      {/* Cards resumen */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 24,
          flexDirection: isMobile ? "column" : "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {summaryCards.map((card) => (
          <div
            key={card.label}
            style={{
              background: "#f5f5f5",
              borderRadius: 8,
              padding: 16,
              minWidth: 120,
              textAlign: "center",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              width: isMobile ? "100%" : undefined,
              maxWidth: isMobile ? 300 : undefined,
            }}
          >
            <div style={{ fontSize: 14, color: "#222" }}>{card.label}</div>
            <div style={{ fontSize: 20, fontWeight: 600, color: "#111" }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>
      {/* Mostrar gráfico solo si no es móvil */}
      {!isMobile && (
        <>
          {gainsLoading && <p>Cargando gráfico...</p>}
          {gainsError && <p style={{ color: "red" }}>{gainsError}</p>}
          {!gainsLoading && !gainsError && gains && (
            <ReactECharts
              option={option}
              style={{ height: 400, width: "100%" }}
            />
          )}
          {!gainsLoading && !gainsError && !gains && (
            <p>No hay datos para mostrar.</p>
          )}
        </>
      )}
    </main>
  );
}
