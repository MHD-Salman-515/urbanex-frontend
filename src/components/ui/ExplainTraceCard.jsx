export default function ExplainTraceCard({ explain }) {
  if (!explain) return null;

  const inputs = explain.inputs || {};
  const area = inputs.area ?? inputs.area_m2 ?? null;
  const price = inputs.price ?? inputs.price_usd ?? null;
  const confidence =
    typeof explain.confidence === "number" ? Math.round(explain.confidence * 100) : null;
  const steps = Array.isArray(explain.steps) ? explain.steps : [];

  return (
    <div className="mt-10 rounded-2xl border border-white/20 bg-white/10 p-6 text-white backdrop-blur">
      <h3 className="mb-4 text-xl font-bold">Why this property?</h3>

      <ul className="space-y-2 text-sm">
        {area != null ? <li>Area: {area}</li> : null}
        {price != null ? <li>Price: {price}</li> : null}
        {confidence != null ? <li>Confidence: {confidence}%</li> : null}
      </ul>

      {steps.length ? (
        <div className="mt-4 text-xs text-white/70">
          {steps.map((step, i) => (
            <div key={i}>- {step}</div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

