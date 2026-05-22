interface DisclaimerBannerProps {
  compact?: boolean;
}

export function DisclaimerBanner({ compact = false }: DisclaimerBannerProps) {
  if (compact) {
    return (
      <p className="text-xs text-slate-400 text-center px-4">
        SpeechSprout supports therapist-prescribed practice. Not a clinical assessment.
      </p>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700 leading-relaxed">
      <strong className="font-semibold">Important: </strong>
      SpeechSprout supports therapist-prescribed home practice. It does not diagnose speech conditions, assess speech disorders, or replace a qualified speech pathologist.
      Visual feedback is provided only for movements where mouth position is visibly detectable. Audio practice is always the primary signal.
    </div>
  );
}
