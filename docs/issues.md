# Issues list found while testing the functionality manually

## issues per role

## all roles

note: to design dashboards that minimal, modern, and user friendly. use the inspiration screenshot inside the docs/image named "ui ux inspiration". it has elements that are worth copying.

- is there a navbar component in the rendered page? since the items of the navbar has no outer wrapper containing all the items that should be in the navbar.
- the 4 cards that indicate the overviews for the user should be minimal. no description of what the card is about needed. only the card name, the number, and the icon are enough
- UI error fetched from chrome console: "React does not recognize the `asChild` prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `aschild` instead. If you accidentally passed it from a parent component, remove it from the DOM element."
- the toast sent by the frontend doesn't have a timer to remove itself. remove the "x" button on the toast and instead add a means of automatically fading the toast if possible. if not possible, suggest alternative solutions.

### student

- UI/UX design issue: how is it that a bootcamp card has 2 buttons that are not really what are needed on the cards? the cards have "view sessions" and "track progress" buttons which are not needed for the student since  
- in the student dashboard, what's the use of attendance quick check-in? the attendance per session, so to which session is that cards input filled sending to? remove it entirely from the dashboard since attendance must be per session, so the attendance checkin should be inside a session of a bootcamp.
- No direct smooth linking between bootcamps and sessions. currently both are like 2 islands.