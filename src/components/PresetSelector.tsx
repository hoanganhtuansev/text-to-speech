import React from "react";
import { SCRIPT_PRESETS } from "../data/presets";
import { ScriptPreset } from "../types";
import { BookOpen, Sparkles, Clock, Check } from "lucide-react";

interface PresetSelectorProps {
  currentPresetId: string | null;
  onSelectPreset: (preset: ScriptPreset) => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  currentPresetId,
  onSelectPreset,
}) => {
  return (
    <div id="preset-selector-container" className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-lg space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <BookOpen className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Kịch Bản Mẫu Kỹ Sư Điện (Sẵn Sàng Đọc)
          </h2>
        </div>
        <span className="text-xs text-slate-400">5 Mẫu thực tế</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {SCRIPT_PRESETS.map((preset) => {
          const isSelected = currentPresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              id={`preset-card-${preset.id}`}
              onClick={() => onSelectPreset(preset)}
              className={`text-left p-3 rounded-xl border transition-all relative flex flex-col justify-between group ${
                isSelected
                  ? "bg-amber-950/20 border-amber-500/70 shadow-sm"
                  : "bg-slate-850 hover:bg-slate-800 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-1.5 mb-1.5">
                  <span className={`text-xs font-bold leading-snug ${isSelected ? "text-amber-300" : "text-slate-200 group-hover:text-amber-400/90"}`}>
                    {preset.title}
                  </span>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                <span className="inline-flex items-center gap-1 font-mono text-cyan-400">
                  <Clock className="w-3 h-3" />
                  {preset.durationEstimate}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                  {preset.category}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
