export interface ArticulationGuide {
  targetId: string;
  childInstruction: string;
  mechanicsExplainer: string;
  parentCue: string;
  isInvisibleToCamera: boolean;
  cameraNote?: string;
  emoji: string;
  scene: ArticulationSceneConfig;
}

export interface ArticulationSceneConfig {
  lipsClosing: boolean;
  lipsRounding: boolean;
  lowerLipRise: boolean;
  tongueTipRaise: boolean;
  tongueBodyRaise: boolean;
  highlightBilabial: boolean;
  highlightLabiodental: boolean;
  highlightAlveolar: boolean;
  highlightVelar: boolean;
}

export const ARTICULATION_GUIDES: Record<string, ArticulationGuide> = {
  p: {
    targetId: "p",
    childInstruction: "Press BOTH lips firmly together — then let them POP open with a little puff of air!",
    mechanicsExplainer: "Both lips press together to stop the air. When they release, the air pops out.",
    parentCue: "Look for firm lip closure before the sound. Both lips should press together, then release with a slight breath.",
    isInvisibleToCamera: false,
    emoji: "👄",
    scene: {
      lipsClosing: true, lipsRounding: false, lowerLipRise: false,
      tongueTipRaise: false, tongueBodyRaise: false,
      highlightBilabial: true, highlightLabiodental: false,
      highlightAlveolar: false, highlightVelar: false,
    },
  },
  m: {
    targetId: "m",
    childInstruction: "Close your lips gently and make a humming sound — mmmmm! Feel it vibrate!",
    mechanicsExplainer: "Both lips come together softly. The voice hums through the nose while lips stay closed.",
    parentCue: "Look for gentle lip closure with a continuous hum. The lips stay together for the whole sound.",
    isInvisibleToCamera: false,
    emoji: "🎵",
    scene: {
      lipsClosing: true, lipsRounding: false, lowerLipRise: false,
      tongueTipRaise: false, tongueBodyRaise: false,
      highlightBilabial: true, highlightLabiodental: false,
      highlightAlveolar: false, highlightVelar: false,
    },
  },
  oo: {
    targetId: "oo",
    childInstruction: "Make your lips into a tiny round circle — like you are blowing out birthday candles!",
    mechanicsExplainer: "The lips narrow and round into a small circular opening. The cheeks may round too.",
    parentCue: "Watch for the lips narrowing into a small round shape — not wide or stretched. The opening becomes circular.",
    isInvisibleToCamera: false,
    emoji: "⭕",
    scene: {
      lipsClosing: false, lipsRounding: true, lowerLipRise: false,
      tongueTipRaise: false, tongueBodyRaise: false,
      highlightBilabial: true, highlightLabiodental: false,
      highlightAlveolar: false, highlightVelar: false,
    },
  },
  f: {
    targetId: "f",
    childInstruction: "Gently rest your BOTTOM lip near your TOP teeth, then blow air out — like a fan!",
    mechanicsExplainer: "The lower lip moves close to the upper front teeth. Air flows through the gap to make the F sound.",
    parentCue: "Look for the lower lip making near-contact with the upper teeth edge. Some parents call it 'biting' the lip.",
    isInvisibleToCamera: false,
    emoji: "🌬️",
    scene: {
      lipsClosing: false, lipsRounding: false, lowerLipRise: true,
      tongueTipRaise: false, tongueBodyRaise: false,
      highlightBilabial: false, highlightLabiodental: true,
      highlightAlveolar: false, highlightVelar: false,
    },
  },
  s: {
    targetId: "s",
    childInstruction: "Point your tongue tip toward the bumpy ridge just behind your top teeth and make a hissing sound — ssss!",
    mechanicsExplainer: "The tongue tip aims toward the alveolar ridge — the bumpy area just behind the top front teeth. Air flows over it to make the hissing S sound.",
    parentCue: "The S sound relies on tongue placement inside the mouth. This guide shows where the tongue should aim. The camera cannot verify tongue position — listen for a clear hissing quality.",
    isInvisibleToCamera: true,
    cameraNote: "This placement is shown as a guide only. The camera cannot check tongue placement. Audio practice is the focus for /s/.",
    emoji: "🐍",
    scene: {
      lipsClosing: false, lipsRounding: false, lowerLipRise: false,
      tongueTipRaise: true, tongueBodyRaise: false,
      highlightBilabial: false, highlightLabiodental: false,
      highlightAlveolar: true, highlightVelar: false,
    },
  },
  k: {
    targetId: "k",
    childInstruction: "Push the BACK of your tongue up to touch the back of the roof of your mouth — like saying a little cough!",
    mechanicsExplainer: "The back of the tongue rises to contact the soft palate (velum) at the back of the roof of the mouth. It blocks and releases the air.",
    parentCue: "The K sound happens deep inside the mouth and is not visible through the camera. Listen for a clean, back-of-mouth stop sound.",
    isInvisibleToCamera: true,
    cameraNote: "This placement is shown as a guide only. The camera cannot check back-of-tongue placement. Audio practice is the focus for /k/.",
    emoji: "🔙",
    scene: {
      lipsClosing: false, lipsRounding: false, lowerLipRise: false,
      tongueTipRaise: false, tongueBodyRaise: true,
      highlightBilabial: false, highlightLabiodental: false,
      highlightAlveolar: false, highlightVelar: true,
    },
  },
};
