import * as React from "react"
import { cn } from "@/ui/cn"
import { appearanceOptions, projectTitle, siteHeaderClasses as classes, siteLinks } from "../site-contract.js"

// Felt's global header, as /react's SiteHeader and site.js's static header draw it (all three
// read siteHeaderClasses): Home and Experiments, the project's name, and the labelled
// System / Light / Dark control. The current site's link is underlined in the signal.

function AppearanceControl({ value = "system", onValueChange, className, withTitle = true }) {
  const labelId = React.useId()
  return (
    <label data-slot="appearance" className={cn(classes.appearance, withTitle ? classes.appearanceWithTitle : classes.appearanceWithoutTitle, className)}>
      <span id={labelId} className={classes.appearanceLabel}>Appearance</span>
      <select className={classes.appearanceSelect} aria-labelledby={labelId} value={value} onChange={(event) => onValueChange?.(event.target.value)}>
        {appearanceOptions.map(([option, label]) => <option key={option} value={option}>{label}</option>)}
      </select>
    </label>
  )
}

function SiteHeader({ project = "portfolio", appearance = "system", onAppearanceChange, showProjectTitle = true, className }) {
  return (
    <header data-slot="site-header" className={cn(classes.header, showProjectTitle ? classes.withTitle : classes.withoutTitle, className)}>
      <nav className={classes.navigation} aria-label="Global navigation">
        {Object.entries(siteLinks).map(([name, link]) => (
          <a key={name} className={classes.link} href={link.href}
            aria-current={(name === "home" && project === "portfolio") || (name === "experiments" && project === "experiments") ? "page" : undefined}>
            {link.label}
          </a>
        ))}
      </nav>
      {showProjectTitle && <span className={classes.project}>{projectTitle(project)}</span>}
      <AppearanceControl value={appearance} onValueChange={onAppearanceChange} withTitle={showProjectTitle} />
    </header>
  )
}

export { AppearanceControl, SiteHeader }
