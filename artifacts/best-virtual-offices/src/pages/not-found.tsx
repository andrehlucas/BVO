import { Link } from 'wouter';

export default function NotFound() {
  return (
    <article className="trust-page">
      <header className="trust-page-heading">
        <p className="eyebrow">Page not found</p>
        <h1>This page is not in our comparison.</h1>
        <p>The address may have changed, or the page may no longer be available.</p>
        <Link className="button-link button-link--primary" href="/">Return to the homepage</Link>
      </header>
    </article>
  );
}
