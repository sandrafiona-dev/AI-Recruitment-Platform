# Dataset Foundation

## Table of Contents

- [Purpose](#purpose)
- [Directory Layout](#directory-layout)
- [Dataset Lifecycle](#dataset-lifecycle)
- [Versioning Strategy](#versioning-strategy)
- [Naming Conventions](#naming-conventions)
- [Storage Guidelines](#storage-guidelines)
- [Data Governance](#data-governance)
- [Recommended Public Sources](#recommended-public-sources)

## Purpose

`datasets/` is the governed workspace for approved data used in future
analysis, evaluation, and development. No data files are included in this
repository. The documented candidate, job, and application entities establish
a shared data contract; they do not represent an active production dataset.

## Directory Layout

| Directory | Intended content | Rule |
| --- | --- | --- |
| `raw/` | Immutable approved source extracts. | Do not edit or commit personal data. |
| `processed/` | Reproducible, approved derived datasets. | Preserve transformation provenance. |
| `external/` | Versioned public taxonomies and references. | Record source, license, and retrieval date. |
| `sample/` | Explicitly approved synthetic examples. | Never store real candidate information. |

## Dataset Lifecycle

```text
Approval → Acquisition → Provenance review → Raw storage
         → Validation → Documented transformation → Processed storage
         → Approved analysis → Retention review / secure disposal
```

Each stage requires an owner, a documented purpose, and appropriate access
controls. Raw source data remains unchanged; derivative files must identify the
source version and transformation method.

## Versioning Strategy

- Record a dataset identifier, source URL, license, owner, retrieval date, and
  source version in an accompanying manifest or approved data catalog.
- Use semantic labels for derived data where appropriate, such as `v1.0.0`.
- Do not overwrite released or analyzed versions; create a new version when
  source data or transformations change.
- Link reports and future experiments to the exact dataset version used.

## Naming Conventions

Use lowercase, descriptive filenames with underscores and an explicit version.

```text
<entity>_<purpose>_<YYYY-MM-DD>_v<major.minor.patch>.<extension>
```

Example format: `job_taxonomy_reference_2026-08-05_v1.0.0.csv`. Names should
not contain candidate names, email addresses, phone numbers, or other direct
identifiers.

## Storage Guidelines

- Do not commit datasets, resumes, contact details, credentials, or secrets.
- Store production or sensitive data in approved access-controlled storage,
  not in the repository workspace.
- Encrypt sensitive data in transit and at rest where applicable.
- Keep `raw/` read-only after intake and make derived transformations
  reproducible.
- Retain only the minimum data needed for the approved purpose.

## Data Governance

Before using a dataset, confirm lawful collection, permitted use, privacy
notice or consent where required, license compatibility, retention period, and
access owner. Candidate data is sensitive: restrict access, maintain audit
records, and use synthetic or properly de-identified data for demonstrations.

Assess quality, representation, and potential bias before future analytical or
ML work. Do not infer protected characteristics from resumes or contact data,
and keep human oversight over any future recruitment decision support.

## Recommended Public Sources

Public sources must be reviewed for current licensing and suitability before
use. Useful reference sources include the [O*NET Database](https://www.onetcenter.org/database.html)
and the [ESCO classification](https://esco.ec.europa.eu/en/use-esco/download).
Official labour-market data and research datasets may also be considered after
provenance, anonymization, and permitted-use review.
