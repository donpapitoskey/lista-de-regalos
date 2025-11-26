'use client';

export default function Snowfall() {
  return (
    <div className="snowfall-container">
      {Array.from({ length: 15 }).map((_, i) => (
        <div key={i} className="snowflake-fall">❄</div>
      ))}
    </div>
  );
}
