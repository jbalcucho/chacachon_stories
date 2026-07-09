type CrearProgressProps = {
  activeStep: 1 | 2 | 3;
};

const STEPS = [
  { num: 1, label: "Elige el camino" },
  { num: 2, label: "Arma la receta" },
  { num: 3, label: "Tu cuento" },
] as const;

export default function CrearProgress({ activeStep }: CrearProgressProps) {
  return (
    <nav className="crear-progress" aria-label="Pasos para crear tu cuento">
      <ol className="crear-progress__list">
        {STEPS.map((step) => (
          <li
            key={step.num}
            className={`crear-progress__item${step.num === activeStep ? " crear-progress__item--active" : ""}${step.num < activeStep ? " crear-progress__item--done" : ""}`}
            aria-current={step.num === activeStep ? "step" : undefined}
          >
            <span className="crear-progress__dot" aria-hidden="true">
              {step.num < activeStep ? "✓" : step.num}
            </span>
            <span className="crear-progress__label">{step.label}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
