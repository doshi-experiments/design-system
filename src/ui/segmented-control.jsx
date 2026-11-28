import { Radio } from "@base-ui/react/radio"
import { RadioGroup } from "@base-ui/react/radio-group"
import { cn } from "@/ui/cn"

// Chooses between values, as /react's SegmentedControl draws it: a recessed track with a raised
// key. It is a radio group, not tabs. size="small" is shorter over the same hit area.
// options: [value, label] pairs.
function SegmentedControl({ options, value, onValueChange, label, size, className }) {
  return (
    <RadioGroup
      data-slot="segmented-control"
      data-size={size}
      aria-label={label || `Choose: ${options.map(([, text]) => text).join(", ")}`}
      value={String(options.findIndex(([option]) => option === value))}
      onValueChange={(index) => { const option = options[Number(index)]; if (option) onValueChange(option[0]) }}
      className={cn(
        "inline-flex flex-wrap gap-1.5 max-w-full p-[5px] rounded-[calc(var(--ds-control-target)/2+5px)] pressed data-[size=small]:rounded-[calc(var(--ds-control-compact-height)/2+5px)]",
        className
      )}
    >
      {options.map(([, text], index) => (
        <Radio.Root
          key={index}
          value={String(index)}
          data-slot="segment"
          className="inline-flex items-center justify-center min-h-target px-4 py-2 border border-transparent rounded-pill bg-transparent text-ink-secondary font-sans font-semibold text-caption leading-[normal] cursor-pointer not-data-checked:hover:text-ink data-checked:raised focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus in-data-[size=small]:relative in-data-[size=small]:min-h-control-compact in-data-[size=small]:leading-[1.25] in-data-[size=small]:px-3.5 in-data-[size=small]:py-1.5 in-data-[size=small]:after:absolute in-data-[size=small]:after:inset-x-0 in-data-[size=small]:after:top-1/2 in-data-[size=small]:after:h-[max(100%,var(--ds-control-target))] in-data-[size=small]:after:-translate-y-1/2"
        >
          {text}
        </Radio.Root>
      ))}
    </RadioGroup>
  )
}

export { SegmentedControl }
