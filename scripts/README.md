# Governance and Classification of Scripts

The `scripts/` directory is explicitly organized to separate operational concerns, preventing clutter in the main project. Any new script must be categorized into one of these folders. Do not place loose scripts in the root of the project or the root of this folder.

## Categories

- **`/catalog`**: Productive Operation / Content Administration. Scripts related to fetching, matching, and maintaining the core catalog (brands, domains, logos). Example: `sync_ai_brandfetch.ts`.
- **`/ops`**: Deploy / Maintenance / One-Shot. Administrative or migration scripts intended to run securely against the database (e.g., creating RPCs, applying ELO logic, or removing duplicates).
- **`/debug`**: Debug / Manual Testing. Safe-to-delete scripts used strictly for isolating functionality or debugging external APIs (e.g., WhatsApp API tokens, testing delivery logs). They are not part of the operational flow.
- **`/seed`**: Seeding / Environment Gen. Scripts that populate the database with initial states (e.g., `seed_actualidad.ts`). Useful for staging or local environments.

## Archive Policy

If a script becomes entirely obsolete or represents a one-time migration that will never be run again, it must be either deleted or moved to `../archive/legacy/` to avoid polluting the workspace.
