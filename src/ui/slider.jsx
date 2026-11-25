import { Slider as SliderPrimitive } from "@base-ui/react/slider"
import { cn } from "@/ui/cn"

// From `shadcn add slider` (base-nova, 4.23.0), restyled to Felt as /react's RangeField draws its
// slider: a pressed-in track filled with the signal, and a signal thumb with a white rim (the red
// reads on wool, the rim on charcoal). The control is a 44px row; the thumb's hit area is 50px.
// Base UI focuses the hidden range input inside the thumb, so the thumb that contains it rings.
function Slider({ className, thumbProps, ...props }) {
  return (
    <SliderPrimitive.Root data-slot="slider" className={cn("min-w-0", className)} {...props}>
      <SliderPrimitive.Control data-slot="slider-control" className="flex items-center w-full h-11 touch-none select-none cursor-pointer">
        <SliderPrimitive.Track data-slot="slider-track" className="h-2 w-full rounded-pill pressed">
          <SliderPrimitive.Indicator data-slot="slider-range" className="h-full rounded-pill [background:var(--ds-action-gradient)]" />
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            className="box-border size-[26px] border-3 border-[#FFFFFF] rounded-[50%] [background:var(--ds-action-gradient)] shadow-[0_0_0_1px_rgba(38,38,36,.18),0_6px_12px_-4px_rgba(0,0,0,.45)] before:absolute before:-inset-3 before:content-[''] has-focus-visible:outline-3 has-focus-visible:outline-offset-4 has-focus-visible:outline-focus"
            {...thumbProps}
          />
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
