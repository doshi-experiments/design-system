export const siteLinks = {
  home: {label: 'Home', href: 'https://rishabhdoshi.com/'},
  experiments: {label: 'Experiments', href: 'https://experiments.rishabhdoshi.com/'},
};
const titles = {portfolio:'Rishabh Doshi', experiments:'Experiments', visualizations:'Visualizations', calculator:'Calculators', game:'Mr. Shake', finance:'Finance', household:'Household'};
export function projectTitle(project) {return titles[project] || String(project || 'Rishabh Doshi');}
export const appearanceOptions = [['system', 'System'], ['light', 'Light'], ['dark', 'Dark']];

// The global header's Tailwind classes (0.14), shared by /ui's SiteHeader and site.js's static
// header so they stay one drawing. They draw what components.css's .ds-site-* rules draw; below
// 641px the header stacks the appearance control beside the links. tailwind.css scans this file.
const narrow = 'max-[640.98px]:';
export const siteHeaderClasses = {
  header: 'box-border grid items-center gap-5 w-[calc(100%-2*clamp(16px,4vw,48px))] max-w-[calc(var(--ds-page-width)-2*clamp(16px,4vw,48px))] mx-auto mt-4 mb-0 py-1.5 pr-1.5 pl-[22px] rounded-pill raised font-sans font-normal text-body leading-[1.55] max-[640.98px]:grid-cols-[minmax(0,1fr)_auto] max-[640.98px]:[align-items:end] max-[640.98px]:gap-x-3 max-[640.98px]:gap-y-2 max-[640.98px]:p-2.5 max-[640.98px]:pl-[18px] max-[640.98px]:rounded-container',
  // Exactly one of each pair, since the static header has no class merging.
  withTitle: 'grid-cols-[auto_minmax(0,1fr)_auto]',
  withoutTitle: 'grid-cols-[minmax(0,1fr)_auto]',
  navigation: 'flex items-center gap-4 min-w-0 max-[640.98px]:gap-3',
  link: "relative box-border inline-flex items-center justify-center min-h-11 min-w-11 text-ink-secondary font-medium text-body leading-[1.55] no-underline whitespace-nowrap after:content-[''] after:absolute after:inset-x-0 after:bottom-1.5 after:h-0.5 after:rounded-[1px] after:bg-[var(--ds-action-primary)] after:scale-x-0 after:transition-transform after:duration-base after:ease-spring hover:text-ink hover:after:scale-x-100 aria-[current=page]:text-ink aria-[current=page]:after:scale-x-100 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus",
  project: 'min-w-0 px-2 text-ink-secondary font-normal text-caption leading-[1.55] wrap-anywhere max-[640.98px]:col-start-1 max-[640.98px]:row-start-2 max-[640.98px]:p-0 max-[640.98px]:text-[.75rem]',
  appearance: 'box-border flex items-center gap-2.5 w-auto min-w-0 max-w-full m-0 text-ink-secondary font-normal text-caption leading-[1.55] normal-case tracking-normal max-[640.98px]:col-start-2 max-[640.98px]:row-start-1 max-[640.98px]:flex-col max-[640.98px]:items-start max-[640.98px]:gap-1',
  appearanceWithTitle: 'max-[640.98px]:row-end-3',
  appearanceWithoutTitle: 'max-[640.98px]:row-end-auto',
  appearanceLabel: 'block whitespace-nowrap max-[640.98px]:text-[.75rem]',
  appearanceSelect: 'box-border block flex-none w-28 min-w-0 max-w-full min-h-11 px-3.5 py-2 border border-line rounded-pill text-ink pressed font-semibold text-body leading-[1.55] cursor-pointer appearance-auto [&_option]:text-ink [&_option]:bg-overlay focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus',
};
