# One identity for Rishabh's portfolio and apps

Decision date: 19 October 2026 (Felt). Shared release: 0.6.0. Earlier directions
(enamel blue and porcelain, 4 October 2026; rust and charcoal, 6 October 2026) are retired.

The portfolio is for hiring teams. The experiments demonstrate design judgment
through things people can use. One visual identity now covers both, so the author
is recognisable in every app without turning any app into a portfolio presentation.

## Direction

Felt: as little design as possible, made of soft things. It began as the
"made with an AI in the room" face of the portfolio and became the family identity:
one grotesk, warm grey wool in light, charcoal in dark, and one signal, the coral
#FF5E7C, which is the 2025 hand-made site's own accent. Surfaces are raised felt with a
stitch; fields and tracks are pressed in; controls press when they are used.

The look is the same for every project. Project IDs remain so `data-project` keeps its
contract, but none of them changes the palette, type or shape.

Rejected along the way: a dark phosphor "instrument", a pink-hotel pastiche, gradient
glows, emoji, decorative all-caps labels, and per-app accent colours. Texture stays a
quiet fibre grain, never an image or pattern.

## Palette

| Name | Light | Dark | Use |
| --- | --- | --- | --- |
| Page | `#E7E4DE` wool | `#33322F` charcoal | `surface-page` |
| Raised | `#F1EEE9` | `#3E3D39` | `surface-raised`: cards, keys, the header |
| Overlay | `#F6F4F0` | `#3E3D39` | `surface-overlay`: dialogs and popovers, separated by shadow |
| Inset | `#DAD6CE` | `#2B2A27` | `surface-inset`: fields, tracks, wells, chips |
| Text | `#262624` | `#ECE9E3` | 11.9:1 and 10.6:1 on the page |
| Secondary | `#55524C` | `#B9B4AA` | 6.1:1 and 6.2:1 |
| Border | `#77716A` | `#8E897F` | field and control edges, 3.8:1 and 3.7:1 |
| Signal | `#FF5E7C` | `#FF5E7C` | `action-primary`: primary fills, with ink `#262624` on top (5.2:1) |
| Signal text | `#A1263F` | `#FF7F96` | `action-link` and `focus`: links, eyebrows, focus rings |
| Selection | `#F5D9DE` | `#4A3438` | hovered rows, open disclosures |

Coral is a fill. On wool it fails as text (2.1:1), so text in the signal colour always
uses `action-link`. Status colours keep their meaning across apps, and error stays a
deeper red than the coral so a failure never reads as the brand:

| Status | Light text on background | Dark text on background |
| --- | --- | --- |
| Success | `#2E5A29` on `#DCE6D3` | `#B7DCA9` on `#34442F` |
| Warning | `#6A4C00` on `#F1E1B5` | `#EBCB7C` on `#4A4026` |
| Error | `#962620` on `#F3D2CE` | `#F4B3AC` on `#55302C` |
| Info | `#2B5876` on `#D5E0E7` | `#AFCDE3` on `#2F4250` |

Charts use ink, coral, teal and mustard (`#262624`, `#C93A58`, `#3B7069`, `#8C6A22`;
in dark `#ECE9E3`, `#FF7F96`, `#7FC1B8`, `#E2C27A`), each at least 3:1 on the page,
raised and inset surfaces. Rent vs. buy draws renting in ink and buying in coral, as the
portfolio's illustrations do. Sequential ramps run from a coral tint to a deep wine.
Custom colours chosen by visualization users remain their own. Crane yellow is retired;
the `crane` token remains as a mustard alias for older consumers.

## Type and shape

Host Grotesk is the only locally hosted family: a variable 300 to 800 weight axis, latin
and latin-extended subsets, SIL OFL 1.1, provenance in `src/fonts/host-grotesk-source.txt`.
Use 400 for body, 500 for headings and figures, and 600 for controls and labels.
Headings tighten their tracking as they grow (-.02em at 25px to -.045em at 61px).

Body text is 16px in apps and 18px in portfolio prose, with a 1.55 line-height and a
64-character measure. The type scale stays 16, 20, 25, 31, 39, 49, and 61px. Financial
values use tabular numerals and right alignment.

Buttons, keys, chips and segments are pills (`radius-pill`); fields, selects, tracks and
alerts are 14px (`radius-control`); cards and panels 24px; dialogs 30px. Raised surfaces
carry `shadow-raised`: a one-pixel top light, a hairline and a soft drop. Fields and a
pressed key carry `shadow-pressed`. Cards and project links carry a stitch: a 1.5px
dashed line 7px inside the edge. Each page has a 240px fibre tile blended into its own
background (multiplied in light, overlaid in dark); `data-texture="off"` on the root
removes it. Shared control targets stay at least 44px; Mr. Shake keeps its 60px game
controls. Global navigation retains its own compact 44px targets.

## Composition and interaction

Results never look like inputs: figures sit on a raised results card under a stitched
rule, not in pressed wells. Local navigation inside an app (calculator tabs, Finance
sections) is an underline in the signal-text colour (`.ds-tab`), not a pill; a
segmented control (a recessed track with a raised key) chooses between values.

The portfolio splits its 2025 hand-made site against the felt face with a draggable
line; its glass panes and divider belong to the portfolio, not this system.

The experiments page presents three open project rows with direct actions.
Calculator and visualization subpages belong in native disclosures, and empty
categories stay hidden. Raised surfaces group actual working information; they do
not frame every heading or turn every paragraph into a card.

Every app shows Home and Experiments through `SiteHeader`, or its equivalent
`mountSiteHeader` static implementation: a raised pill whose current page is marked
with a coral dot. Local calculator, visualization, and Finance navigation stays
distinct beneath that global return path. Public navigation never advertises private
Finance.

Appearance uses one visible native control with System, Light, and Dark options.
Saved preference and resolved appearance are separate. Shared prepaint code runs
before styles, and System follows OS changes. Public preferences keep the existing
domain cookie and localStorage; Finance uses its private storage key without a
public cookie.

Text selection is normal on headings, copy, labels, and values. Only actual drag
controls and private game-reveal surfaces suppress it. Leaving Mr. Shake conceals
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
command for the affected consumers. Snapshots and tarballs are immutable. An upgrade
reaches a running app when its consumer change is merged and deployed, allowing
independent releases and reversions without a mutable shared CDN.
