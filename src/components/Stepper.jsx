const STEPS = ['Upload photo', 'Customise', 'Payment', 'Confirmation'];

export default function Stepper({ current }) {
  return (
    <div className="bg-white border-b border-black/10 px-3 md:px-4 py-3 md:py-[18px] rounded-[20px] mb-[18px]">
      <div className="flex items-center justify-center gap-0.5 md:gap-1.5 overflow-x-auto">
        {STEPS.map((label, i) => {
          const stepNum = i + 1;
          const done = stepNum < current;
          const active = stepNum === current;
          const highlighted = done || active;

          return (
            <div className="flex items-center" key={label}>
              <div className="flex items-center gap-1 md:gap-2 shrink-0">
                <div
                  className={`w-7 h-7 md:w-7 md:h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold ${
                    highlighted ? 'bg-[#534ab7] text-white' : 'bg-[#e4e4f0] text-[#999]'
                  } ${active ? 'outline outline-[3px] outline-[rgba(127,119,221,0.18)]' : ''}`}
                >
                  {done ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  ) : (
                    stepNum
                  )}
                </div>
                <span className={`hidden md:inline text-xs font-medium whitespace-nowrap ${highlighted ? 'text-[#534ab7]' : 'text-[#bbb]'}`}>
                  {label}
                </span>
              </div>
              {stepNum < STEPS.length && (
                <div className={`w-4 md:w-8 h-px mx-1 md:mx-1.5 shrink-0 ${stepNum < current ? 'bg-[#534ab7]' : 'bg-[#ddd]'}`}></div>
              )}
            </div>
          );
        })}
      </div>
      <p className="md:hidden text-center text-[11px] font-medium text-[#534ab7] mt-2">
        Step {current} of {STEPS.length} — {STEPS[current - 1]}
      </p>
    </div>
  );
}
