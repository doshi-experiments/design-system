# One identity for Rishabh's portfolio and apps

Decision date: 4 October 2026. Shared release: 0.5.0.

The portfolio is for hiring teams. The experiments demonstrate design judgment
through things people can use. Their shared visual identity should make it easy to
recognize the author without turning every app into a portfolio presentation.

## Direction

A designer's working model: precise, tactile, and lightly mischievous. The
portfolio's partly assembled building is the memorable element. Everything around
it is quiet enough to make the interaction legible. The game can sound dry and
playful; financial interfaces keep their instructions direct.

The first concept risked becoming a generic architecture identity through blue,
yellow, drafting grids, technical labels, and sheet numbers. The second pass kept
the building itself and removed those borrowed signals. We rejected registration
marks, corner ornaments, blinking cursors, grids outside the model, construction
office copy, decorative all-caps labels, gradients, and equal-size project cards.
The portfolio needs an open composition, not an enclosing presentation card.

## Palette

| Name | Value | Use |
| --- | --- | --- |
| Porcelain | `#F1F5F7` | Light page background |
| Model white | `#FFFFFF` | Light working surfaces and the building |
| Deep ink | `#17323D` | Light text; dark page background |
| Enamel blue | `#1B5D8A` | Light actions and links |
| Glacier | `#A8D7EB` | Dark actions and the light selection ramp |
| Crane yellow | `#E7BD45` | The crane and meaningful progress |

There are no separate app brand palettes. Existing project IDs remain compatible,
but resolve to the same identity. Dark surfaces use quieter blue-gray steps to
separate working areas. Green, amber, red, and blue status treatments communicate
success, warning, error, and information consistently. Charts start with blue,
then use teal, orange, and gray; purple is absent from the default palette. Custom
colors chosen by visualization users remain their own choices.

## Type and shape

Commissioner is the only locally hosted font family. Straight terminals serve
body text and controls. Headings use a subtle `FLAR` setting of 22; `VOLM` and
`slnt` stay at zero. The font comes from the official upstream repository at the
commit recorded in `src/fonts/commissioner-source.txt`, under SIL OFL 1.1.

Body text is 16px in apps and 18px in portfolio prose, with a 1.55 line-height and
a 64-character measure. The type scale is 16, 20, 25, 31, 39, 49, and 61px;
display sizes become fluid on smaller screens. Use 400 for body, 600 for controls,
and 700 for headings. Financial values use tabular numerals and right alignment.

Controls have 8px corners, surfaces 16px, and dialogs 20px. Shadows are reserved
for overlays. Shared control targets stay at least 44px; Mr. Shake keeps its 60px
game controls. Global navigation retains its own compact 44px targets.

## Composition and interaction

The portfolio places left-aligned introductory copy beside the model. On mobile,
the introduction precedes the model. The model begins partly assembled rather
than making visitors scroll through an empty scene. Three concise process moments
complete a roughly three-screen sequence. Reduced-motion visitors get the completed
model and ordinary readable content. Contact links remain accessible throughout.

The experiments page presents three open project rows with direct actions.
Calculator and visualization subpages belong in native disclosures, and empty
categories stay hidden. Borders and surfaces group actual working information;
they do not frame every heading or turn every paragraph into a card.

Every app shows Home and Experiments through `SiteHeader`, or its equivalent
`mountSiteHeader` static implementation. Local calculator, visualization, and
Finance navigation stays distinct beneath that global return path. Public
navigation never advertises private Finance.

Appearance uses one visible native control with System, Light, and Dark options.
Saved preference and resolved appearance are separate. Shared prepaint code runs
before styles, and System follows OS changes. Public preferences keep the existing
domain cookie and localStorage; Finance uses its private storage key without a
public cookie.

Text selection is normal on headings, copy, labels, and values. Only actual drag
controls and private game-reveal surfaces suppress it. Hidden portfolio panels
are inactive, while visible copy remains selectable. Leaving Mr. Shake conceals
the current word without discarding the resumable game.

## Copy rules

Use sentence case, plain verbs, and one job per written element. Name the action
the person will take: “Import statements,” “Save changes,” or “Review 1 account.”
Keep that action's name consistent in confirmations and outcomes. Cut repeated
introductions and put assumptions beside inputs or inside help disclosures.

The portfolio introduction is “The portfolio is under construction. The
experiments work.” Its process copy is “Understand what people need.” / “Make
something they can try.” / “Improve it from there.”

Project descriptions are short and literal:

- Rent vs. buy: “Compare renting and buying with your own numbers.”
- Visualizations: “Explore growth, symmetry, and chaos.”
- Mr. Shake: “One phone. A few suspicious friends.”

Mr. Shake's headline is exactly “Everyone gets the same word.” followed by
“Kind of” on the next line. Dry humor belongs in introductions and outcomes;
controls must remain understandable. Optional rules belong under “How to play.”
Errors describe the problem and next action without jokes or apology. Financial
qualifications, confirmations, and recovery instructions survive copy reduction.
Do not invent clients, case studies, credentials, or outcomes.

## Validation and maintenance

Shared unit checks cover semantic contrast, palette consistency, density, saved
preferences, System behavior, blocked storage, private persistence, and synchronous
prepaint. Component browser checks cover responsive layouts at 320, 390, 768, and
1440px in both appearances; labeled controls; React and static headers; real mouse
selection; keyboard disclosure; fields, uploads, table callbacks, and modal focus.

Consumer checks add app-specific layout, navigation, game concealment and resume,
calculator routes, and Finance review workflows using synthetic data. Financial
calculations and backend behavior remain outside this redesign. Representative
screenshots are reviewed alongside these checks.

Make future identity changes here, version them, and use the central rollout
command for all six consumers. Snapshots and tarballs are immutable. An upgrade
reaches a running app when its consumer change is merged and deployed, allowing
independent releases and reversions without a mutable shared CDN.
