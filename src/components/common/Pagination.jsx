import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./styles/Pagination.css";

export default function Pagination({ currentPage, lastPage, onChange }) {
  if (!lastPage || lastPage <= 1) return null;

  const pages = [];
  const window = 1;
  for (let p = 1; p <= lastPage; p += 1) {
    if (p === 1 || p === lastPage || Math.abs(p - currentPage) <= window) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <div className="pagination">
      <button
        type="button"
        className="page-btn"
        disabled={currentPage <= 1}
        onClick={() => onChange(currentPage - 1)}
        aria-label="السابق"
      >
        <ChevronRight size={17} />
      </button>

      {pages.map((p, idx) =>
        p === "…" ? (
          <span key={`dots-${idx}`} className="page-dots">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            className={`page-btn ${p === currentPage ? "active" : ""}`}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        className="page-btn"
        disabled={currentPage >= lastPage}
        onClick={() => onChange(currentPage + 1)}
        aria-label="التالي"
      >
        <ChevronLeft size={17} />
      </button>
    </div>
  );
}
