import Link from "next/link";

export default function NotFound() {
  return (
    <main className="missing-page">
      <picture>
        <source srcSet="/scenes/deduction.avif" type="image/avif" />
        <img src="/scenes/deduction.jpg" alt="" width="1935" height="813" />
      </picture>
      <div className="missing-overlay" />
      <div className="missing-content">
        <p>Scotland Yard · Misfiled evidence</p>
        <span>404</span>
        <h1>This trail goes cold.</h1>
        <p>
          The address leaves no print in the casebook. Return to Baker Street and
          begin with the evidence we can prove.
        </p>
        <Link href="/">Return to The Cold Ember <i aria-hidden="true">→</i></Link>
      </div>
    </main>
  );
}
