# Tests, repository playwrite_tests

This repository contains a restricted but efficient UI automation suite implemented using Playwright and Typescript.

The test target site is <https://www.saucedemo.com/>. The tests cover the site’s core features and risks.

## Branching

The tests stay in all branches intact to avoid the need to ask for a permission to stress the target portal for purposes of new tests development.

### Branch: syyskuun_alussa

This branch is the original fast setup, branched out Sept 2026. The reasoning for branching out is to leave the documentation intact as it was, with some forwarding assumptions left not documented as self-evident due to the original assumption: this is the first E2E suite for a 'portal under construction' as the functionality from that point of view was far from complete.

When creating the documentation or tests, the demo-nature of the functionality of the portal was not considered as the test target, but a development-stage portal. The automated e2e testing would be started with this suite. The suite itself was expected to have a very restricted coverage and limited count of tests. Thus it was considered to be used e.g. as a fast loop E2E CI-suite for code stability and for designers to get rapid feedback - in case some further functionality changes would break the main basic use cases.

Now this said, the test design documentation in this branch contains notes on problems and what is left out of the testing scope, including e.g. the complete user roles testing with authorization & authentication (only login used with some chosen user that has generic access). The scope was excluding also the parts that were present in the actual test target as fake functionality without logically meaningful usage intent for an actual user of this 'shop portal'.

The scope definition, notes and observations included were meant to provide feedback also for further QA design. This, in e.g. a real agile development environment, would have been communicated directly to the designers, or e.g. via GitHub/GitLab/Gerrit commenting, or Jira ticketing as bug reports, or user stories with development items in the backlog - instead of the blunt suite design document notes. If a test plan was to be created after this first fast test suite, that could have also covered all the above observations, host the plans to mitigate the test coverage gaps for the missing functionality and tests for the future portal fixes - all for augmenting the work backlog if not yet included.

### Branch: main

Additional documentation tuning to add visibility of the assumptions made when designing the tests in syyskuun_alussa, e.g. the user. Update tbd.

## Notes

- The test target is a publicly accessible website; no local server, separate authentication, or `.env` configuration is required.

- current: Running 4 workers parallel ~34 sec

- See the upper level README.md for tests requirements, the repo cloning, and installation instructions when a clean test environment.
