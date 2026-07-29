# Pi Runtime Spike

G001 Pi Source Audit has been accepted for bounded dynamic verification.

The next authorized implementation area will be `spikes/pi-runtime/g002/` as
defined by `docs/goals/G002_PI_DIRECT_HARNESS_GO_GATE.md`. Do not add code until
that contract is activated with a pinned project commit and executed in its own
Goal Session.

Dependencies and generated Pi build artifacts must stay under `.runs/g002/`,
never inside the immutable `.upstream/pi` reference checkout.
