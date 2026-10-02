"use client";
import { useRouter } from "next/navigation";

export default function Topbar({ title, onMenuToggle, children }) {
  return (
    <div
      style={{
        background: "white",
        borderBottom: "1px solid #DCEAEC",
        padding: "0 24px",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={onMenuToggle}
          style={{
            background: "none",
            border: "none",
            fontSize: "1.2rem",
            cursor: "pointer",
            display: "block",
          }}
        >
          ☰
        </button>
        <h1
          style={{
            fontSize: "1.2rem",
            fontWeight: "700",
            color: "#12333A",
            margin: 0,
          }}
        >
          {title}
        </h1>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span
          style={{
            background: "#F4F9F9",
            border: "1px solid #DCEAEC",
            borderRadius: "7px",
            padding: "4px 12px",
            fontSize: "0.82rem",
            color: "#5B7C85",
          }}
        >
          {new Date().toLocaleDateString("en-GB", {
            weekday: "short",
            day: "numeric",
            month: "short",
          })}
        </span>
        {children}
      </div>
    </div>
  );
}
