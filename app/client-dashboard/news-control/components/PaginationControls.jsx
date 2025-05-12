// client-dashboard/news-control/components/PaginationControls.jsx

"use client";

import React from "react";

export default function PaginationControls({ page, setPage }) {
  return (
    <div className="flex justify-between mt-6">
      <button
        onClick={() => setPage((p) => Math.max(p - 1, 0))}
        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        disabled={page === 0}
      >
        ← 前へ
      </button>

      <button
        onClick={() => setPage((p) => p + 1)}
        className="px-4 py-2 bg-gray-200 rounded"
      >
        次へ →
      </button>
    </div>
  );
}