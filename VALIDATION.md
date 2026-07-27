# Local Static Validation

The package was served from a plain local static server before archive creation.

| Route | Result |
|---|---|
| `/` | The estimator loaded with its planning controls, form fields, CSS, and JavaScript available. |
| `/carousel/` | The four-slide carousel loaded with all four image references and the previous, next, dot, and pause controls available. |

The estimator’s Wood selection recalculated the 320-square-foot planning range to `$13,250–$15,850`. The carousel’s next control advanced from slide 1 to slide 2 and correctly paused automatic advancement after the visitor interaction.

The package does not include a server-side form endpoint, session gate, or authentication dependency. GitHub Pages must still be verified from an anonymous browser session after the repository owner publishes it.
