import React from "react";

export default function ProgressBar({ step = 1, labels = [] , maxWidthClass = "max-w-[700px]"}) {
  const steps = labels.length ? labels : ["Upload photo", "Customise", "Payment", "Confirmation"];

  return (
    <div className={`mx-auto mt-7 flex ${maxWidthClass} items-center px-8`}>
      <div className="w-full rounded-full bg-[#0b0920] p-3 shadow-lg">
        <div className="rounded-full bg-white p-3">
          <div className="flex items-center">
            {steps.map((label, i) => {
              const idx = i + 1;
              const done = idx < step;
              const active = idx === step;
              return (
                <div key={label} className="flex items-center flex-1">
                  <div className="flex w-full flex-col items-center">
                    <div className="flex items-center w-full">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${done || active ? "bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white" : "bg-white/10 text-[#aaa6c8]"}`}>
                        {done ? '✓' : idx}
                      </div>
                      {i !== steps.length - 1 && (
                        <div className={`ml-3 flex-1 h-[6px] ${done ? "bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]" : "bg-white/10"} rounded-full`} />
                      )}
                    </div>
                    <div className="mt-2 text-xs text-[#6b6885] text-center w-full">{label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
