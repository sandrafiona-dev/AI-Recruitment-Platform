# Dataset Schema

## Table of Contents

- [Conventions](#conventions)
- [Candidate Schema](#candidate-schema)
- [Job Schema](#job-schema)
- [Application Schema](#application-schema)
- [Relationships](#relationships)
- [Constraints](#constraints)
- [Validation Rules](#validation-rules)

## Conventions

This is a logical schema for future approved datasets. It is storage-neutral:
JSON arrays or objects may be represented differently in a relational database
or flat file, but their meaning must remain unchanged. Identifiers are stable,
unique, and non-meaningful.

## Candidate Schema

| Column | Logical datatype | Required | Description |
| --- | --- | --- | --- |
| `candidate_id` | UUID or string | Yes | Unique candidate identifier. |
| `name` | String | Yes | Authorized candidate name. |
| `email` | String | No | Authorized contact email. |
| `phone` | String | No | Authorized contact telephone number. |
| `education` | Array of strings or JSON | No | Education history or normalized qualifications. |
| `experience` | Array of objects or JSON | No | Employment roles, durations, and related details. |
| `skills` | Array of strings or JSON | No | Candidate skills, preferably taxonomy-mapped. |
| `certifications` | Array of strings or JSON | No | Professional credentials. |
| `projects` | Array of objects or JSON | No | Project descriptions and related metadata. |
| `resume_text` | Text | No | Authorized extracted resume content. |

## Job Schema

| Column | Logical datatype | Required | Description |
| --- | --- | --- | --- |
| `job_id` | UUID or string | Yes | Unique job identifier. |
| `title` | String | Yes | Job title. |
| `company` | String | No | Hiring organization or business unit. |
| `location` | String | No | Location or remote-work designation. |
| `required_skills` | Array of strings or JSON | No | Required or preferred skills. |
| `experience_required` | String or integer | No | Required experience level or years. |
| `education_required` | String | No | Required or preferred education. |
| `description` | Text | Yes | Job description content. |

## Application Schema

| Column | Logical datatype | Required | Description |
| --- | --- | --- | --- |
| `application_id` | UUID or string | Yes | Unique application identifier. |
| `candidate_id` | UUID or string | Yes | Reference to the candidate. |
| `job_id` | UUID or string | Yes | Reference to the job. |
| `application_date` | ISO 8601 date or datetime | Yes | Receipt or submission date. |
| `status` | Enumerated string | Yes | Controlled application lifecycle status. |

## Relationships

| Parent entity | Child entity | Cardinality | Key |
| --- | --- | --- | --- |
| Candidate | Application | One to many | `application.candidate_id` → `candidate.candidate_id` |
| Job | Application | One to many | `application.job_id` → `job.job_id` |

An application must reference exactly one existing candidate and one existing
job. The schema does not define a direct candidate-to-job record outside an
application.

## Constraints

| Area | Constraint |
| --- | --- |
| Primary identifiers | `candidate_id`, `job_id`, and `application_id` are unique and non-null. |
| Foreign keys | Application references resolve to existing parent records. |
| Required fields | Fields marked required must be present and non-empty. |
| Privacy | Direct identifiers and `resume_text` require approved collection and access controls. |
| Enumerations | `status` uses a documented controlled vocabulary. |
| Multi-value fields | Arrays and objects follow a documented serialization format. |

## Validation Rules

1. Validate identifier format and uniqueness before accepting records.
2. Trim text values; reject fields that are empty after normalization when
   required.
3. Validate email and phone formats only when values are collected.
4. Validate `application_date` as an ISO 8601 date or datetime.
5. Verify application foreign-key relationships.
6. Check that structured arrays and objects conform to the documented format.
7. Record validation failures without exposing personal data in logs or reports.
