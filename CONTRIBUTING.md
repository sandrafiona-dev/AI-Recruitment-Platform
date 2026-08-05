# Contributing to AI Recruitment Platform

Thank you for contributing. This project aims to build responsible,
maintainable recruitment technology, so contributions should be clear, tested,
and mindful of the sensitivity of employment-related data.

## Getting Started

1. Fork the repository and create a branch from the current main branch.
2. Name branches descriptively, for example `feature/resume-parser` or
   `fix/health-endpoint`.
3. Follow the setup steps in the project [README](README.md).
4. Keep changes focused on one logical purpose per pull request.

## Development Guidelines

- Follow the established directory structure and keep modules focused.
- Use PEP 8 conventions for Python and clear, consistent formatting for
  JavaScript and JSX.
- Do not commit secrets, credentials, personal data, or unapproved datasets.
- Add or update tests when changing behavior.
- Update documentation when interfaces, workflows, or setup steps change.
- Avoid introducing API calls, ML models, or dependencies that are not needed
  for the proposed change.

## Pull Requests

Before opening a pull request:

1. Confirm the application or affected tests run locally.
2. Review changed files for accidental secrets, generated artifacts, and
   unrelated edits.
3. Describe the purpose of the change, key implementation details, and testing
   performed.
4. Link any related issue or requirement.

Reviewers may request changes for correctness, maintainability, security,
documentation, accessibility, or responsible AI considerations.

## Responsible AI and Data Handling

Recruitment data can contain sensitive personal information. Do not use real
candidate data without documented authorization and appropriate safeguards.
AI-generated scores, predictions, and recommendations must be treated as
decision support and should be reviewed by authorized humans. Contributions
should document important limitations, potential bias, and validation methods.

## Code of Conduct

Be respectful, constructive, and inclusive in all project discussions and
reviews. Report concerning conduct or security issues privately to the project
maintainers.
