import React from "react";

export default function MenuSkeleton({ count = 6 }) {
  const items = Array.from({ length: count });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((_, i) => (
        <article
          key={i}
          className="animate-pulse overflow-hidden rounded-xl border border-border-color bg-bg-card"
        >
          <div className="aspect-[4/3] w-full bg-gray-200" />
          <div className="p-4 sm:p-5">
            <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
            <div className="mb-4 h-3 w-1/2 rounded bg-gray-200" />
            <div className="h-9 w-full rounded bg-gray-200" />
          </div>
        </article>
      ))}
    </div>
  );
}
