YGT EXECUTIVE LIMO — V11.1 PRICE FIX

This patch fixes vehicle cards still showing “Call for availability”.

Fix:
- Every vehicle card directly re-detects the fixed route from the visible pickup/drop-off addresses.
- MIA → Fontainebleau / Miami Beach prices no longer depend on an async routeKey.
- Only Rolls-Royce shows “Call for availability”.
- Other unknown routes show “Price loading…” while Google route pricing is calculated.

Replace only:
- script.js

Or upload the full package.
