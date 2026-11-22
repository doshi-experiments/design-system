import {clsx} from 'clsx'
import {extendTailwindMerge, validators} from 'tailwind-merge'
import {themeTokens, typeScale, durations, tones} from '../tailwind-theme.js'

// tailwind-merge only knows Tailwind's default names. Without Felt's, it can't tell text-caption
// (a size) from text-ink (a colour) and would drop one of them.
// Felt has no shadow colours, and raised and overlay are names of both a colour and a
// shadow, so shadow-raised must read as the shadow (as Tailwind compiles it).
const names = entries => Object.keys(entries)
const twMerge = extendTailwindMerge({
  override: {
    classGroups: {
      'shadow-color': [{shadow: [validators.isArbitraryVariable, validators.isArbitraryValue]}],
    },
  },
  extend: {
    theme: {
      color: names(themeTokens.color),
      font: names(themeTokens.font),
      text: names(typeScale),
      radius: names(themeTokens.radius),
      shadow: names(themeTokens.shadow),
      spacing: names(themeTokens.spacing),
      container: names(themeTokens.container),
      ease: names(themeTokens.ease),
    },
    classGroups: {
      duration: [{duration: names(durations)}],
      'felt-surface': ['raised', 'pressed'],
      'felt-fill': ['signal', 'signal-hover', 'signal-pressed', 'signal-solid', ...tones.map(tone => `tone-${tone}`)],
    },
  },
})

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
