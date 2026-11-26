export function DemoBanner() {
  return (
    <div role="note" className="bg-marigold px-4 py-2 text-center text-[13px] leading-snug text-ink">
      Clinicly is a portfolio demo. Payments run in Stripe test mode, so no real money moves. To try Pro, pay with card{" "}
      <span className="font-semibold tabular-nums">4242 4242 4242 4242</span>, any future date and any CVC.
    </div>
  );
}
