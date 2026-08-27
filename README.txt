YGT Executive Limo — V15.2 FUNCTIONAL FIX

Root cause fixed:
- Previous Google tick patch referenced pickupAddress/dropoffAddress before they were declared.
- That JavaScript error stopped the rest of script.js, which is why Pickup Date and Pickup Time did not work.

Now:
- Pickup date box opens the custom calendar.
- Calendar icon opens the calendar.
- Pickup time shows 30-minute options.
- Return time shows 30-minute options.
- Green Google check appears only after a real autocomplete selection.
- Typing manually hides the check again.
- V15 premium homepage and pricing are retained.

Replace:
- script.js
- styles.css
