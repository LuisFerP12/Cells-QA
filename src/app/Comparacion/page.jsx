//page.jsx
"use client";
import "../Comparacion/diff.css";

export default function Home() {
  return (
    <main className="min-h-screen p-20">
      <div class="container">
        <div class="snd-header">
          <h1>Version Changes</h1>
          <div class="legends">
            <h2>Legend</h2>
            <p class="diff_add">Added</p>
            <p class="diff_chg">Changed</p>
            <p class="diff_sub">Deleted</p>
          </div>
        </div>

        <iframe src="./table.html" frameborder="0" class="emb"></iframe>
      </div>
    </main>
  );
}
