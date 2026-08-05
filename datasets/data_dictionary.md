# Data Dictionary

## Table of Contents

- [Candidate Fields](#candidate-fields)
- [Job Fields](#job-fields)
- [Application Fields](#application-fields)
- [Handling Notes](#handling-notes)

Examples illustrate format only. They are not dataset records and must not be
interpreted as recommended values.

## Candidate Fields

| Name | Datatype | Nullable | Description | Example format |
| --- | --- | --- | --- | --- |
| `candidate_id` | UUID or string | No | Stable, non-meaningful candidate key. | `cnd_01HXYZ...` |
| `name` | String | No | Authorized candidate name. | `First Last` |
| `email` | String | Yes | Authorized candidate email. | `person@example.com` |
| `phone` | String | Yes | Authorized telephone number. | `+1 555 010 0200` |
| `education` | Array of strings or JSON | Yes | Education history or qualifications. | `["Bachelor's degree"]` |
| `experience` | Array of objects or JSON | Yes | Employment history and durations. | `[{"title":"Role","years":2}]` |
| `skills` | Array of strings or JSON | Yes | Taxonomy-mapped or supplied skills. | `["Python", "SQL"]` |
| `certifications` | Array of strings or JSON | Yes | Professional credentials. | `["Certification name"]` |
| `projects` | Array of objects or JSON | Yes | Project details and outcomes. | `[{"name":"Project","summary":"..."}]` |
| `resume_text` | Text | Yes | Authorized extracted resume content. | `Professional summary...` |

## Job Fields

| Name | Datatype | Nullable | Description | Example format |
| --- | --- | --- | --- | --- |
| `job_id` | UUID or string | No | Stable job-opening key. | `job_01HXYZ...` |
| `title` | String | No | Name of the job role. | `Software Engineer` |
| `company` | String | Yes | Hiring organization or unit. | `Example Organization` |
| `location` | String | Yes | Location or remote designation. | `Remote` |
| `required_skills` | Array of strings or JSON | Yes | Required or preferred skills. | `["Python", "SQL"]` |
| `experience_required` | String or integer | Yes | Required level or years of experience. | `3` or `Mid-level` |
| `education_required` | String | Yes | Required or preferred education. | `Bachelor's degree` |
| `description` | Text | No | Full job description. | `Role responsibilities...` |

## Application Fields

| Name | Datatype | Nullable | Description | Example format |
| --- | --- | --- | --- | --- |
| `application_id` | UUID or string | No | Stable application key. | `app_01HXYZ...` |
| `candidate_id` | UUID or string | No | Candidate record reference. | `cnd_01HXYZ...` |
| `job_id` | UUID or string | No | Job record reference. | `job_01HXYZ...` |
| `application_date` | ISO 8601 date or datetime | No | Submission or receipt date. | `2026-08-05T09:30:00Z` |
| `status` | Enumerated string | No | Controlled workflow state. | `submitted` |

## Handling Notes

`name`, `email`, `phone`, and `resume_text` may contain personal data. Their
collection, storage, access, retention, and reporting require documented
authorization and privacy controls. Prefer stable identifiers in downstream
work and aggregate or de-identify outputs whenever possible.
