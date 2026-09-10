# Repository playwright_tests, Test Design Report

## Introduction / Purpose

The application under test is the externally freely accessible demo site at <https://www.saucedemo.com/>. The aim of this automation project is to create a restricted but an efficient test suite for demo purposes.

## Scope

The core features of the site are to be covered in the suite, which should match with the end-to-end nature of the tests. Some of the most meaningful main flows and features are to be targeted, depicting the probable user behavior. Due to the time constraints and the nature of the test suite given in the requirements in [project README.md](../README.md), some scope restrictions are applied to the work as listed below, and should be later be largely considered as improvement or new work items to suitable design backlogs when aproppriate.

__Outscoped:__

* The user actions outside the portal
* The user actions in then login page which do not lead to a regular successful login, and in overall the login error scenarios
* The different users' and user role visibility and usage tests: access right and authorization tests should be widely taken into account in later test automation design efforts, including also the *headless login* possibility for the portal test environment or framework if appropriate
* The tests that can be easily covered by page concentrated tests or unit tests, or e.g. by enhancing this suite - or implementing its own ui-access based specific feature related test suite as a differnet approach or testing level
* Filtering in the portal invenory - the icon in the sorting dropdown hints filtering, but none provided at the moment.
* Browser provided regular means - buttos, arrows etc, e.g. navigating arrows, typing *directly* to the visible address bar in ui, and reload

## Test Strategy and Approach

The test level is E2E. The target is a readily finished portal, to which there is no internal or external API access. The tests are therefore done solely using UI access to the target portal until further notice, also the portal login in the now designed tests will follow this.

## Tools & Technologies

* Playwright with TypeScript
* Test runner Playwright Test
* Git, Github, VSCode

## Test Case Design

The list of scenarios and use cases covered can be read for the planned test suite structure with case descriptive names. As required, maximum of 6 cases are to be included, covering __most of the regular user scenarios__ of this implementation.

The __negative__ cases taken into account could cover scenarios like 'User can not check-out without giving user information' and 'User cannot check-out (1) and get recept (2) when cart is empty'. The former case can be verified with UT and thus not included, and the latter two sub-scenarios are not currently working logically if not broken, and therefore the last below described test case for the suite is not negative case - if the current behavior is intentional. The last test case can be modified to cover the possible bug fix if the portal requirements consider it as such.

The aim is to create a compact and simple suite, and therefore no specific corner cases are included yet, prioritization is done in favor of sticking to the main user paths for this initial budget.

The suite structure is depicted in the below sub-chapters with small descriptions where applicable. The suite uses the Page Object approach, thus every page including the login page has an object to be used in the scenario approach cases.

### Main suite: Saucedemo shopping portal

The suite uses the user with most rights in the portal to do all the tests. Now the tests do a regular time-consuming login in the beginng of the test, but it is highly beneficial to change it to a solution to do the authentication once per suite and save it to a __project state__ (storageState) for reuse in all of the tests. The different users' access right and authorization tests will not be concluded in this suite at this moment, though they should be heavily considered to be included later even if might complicate things with above login improvements.

The descriptions in this chapter are used as partial input for a large language model for aiding in creating the 5/6 test cases and the parts not handling login or the login Page Object.

* __Main suite level case: *'Basic login with general access credentials'*__
  * The test uses the login page and verifies landing to the portal.
  * The login page shows all allowed users and passwords, this is verified.
  * Login error cases of login form are not verified

* __Main suite level case: *'Linking outside the portal'*__
  * The portal has links outside the portal e.g. in the side navigation bar/panel, so verification of those is done. Firing another tab for this is done here. Later, doing this case instead or also in UT should be considered if reliably possible with the means provided.
  * The basket is intact whe the user returns

#### Sub-Suite: Shopping without intent to check-out

* __Case: *'Items can be browsed and un-carted with regular logout'*__
  * The user adds and removes some items and visits item details pages. The user moves regularly with site navigation means
  * The user empties the cart before logging out regularly. The navigation bar has a portal reset-button, but assume that it is not intended for this case (It could be tried as stretch, though no documentation on this available)

* __Case: *'Bailing out mid shopping'*__
  * The user chooses some items to the cart but then leaves the portal regularly and thus leaving the cart full, successfully

#### Sub-Suite: Shopping with intent to check-out

* __Case: *'Checking out with purchase and receipt'*__
  * A regular shopping session, select items (actually only one of each possible at the moment, an improvement idea)
  * Check out by filling the requested information and forms while proceeding for checkout
  * See that a pdf receipt is received

* __Case: *'Checking out with no purchase'*__
  * A regular shopping session otherwise but no items selected
  * Proceed to check out by filling the requested information forms while proceeding
  * See that a pdf receipt is received with 0 billed credits ( this hould be an unsuccessful case? - Portal requirements)

## Test Architecture

The folder and project structure is the regular one produced during a npm Playwright project installation, such as described in the [project README.md](../README.md). Additionally helpers are provided in the *utils* directory and the coding attempts to enhance reusability.

The selector strategy in the suite was planned to use in addition to component css locators and some regular __data-testid__ sttributes but those are not available. Instead the implementation uses __test-data__ named attributes, so a shortcut function for creating locators is implemented to access portal elements.

## Test Data Management

No specific test data or secret handling is needed since there is none. The password and user names are provided in the login page to be read from. The project has in the main level a possibility for a user to include environment variables from an __*.env*__ file (an *example.env* is provided). The project requires a *dotenv* module, which reads the provided file and adds to the environment variables. The *utils/config.js* file gives also default values, which as such apply for the test to run in absence of the *.env* file or separately setting the environment variables.

## Execution Environment & Strategy

Browser coverage in the test project is in principle all Chromium, Firefox and WebKit, but due to time and design environment constraints, successful test runs only in Chromium and Firefox can be assured.

Parallel execution handling is regular as is set for the freshly created project, no tweaks applied. The suite should be assured for fully non-flaky run. Failing tests should be fixed ASAP and re-run. For daily use, not scheduling planned as starters.

## Roles & Maintenance

Test ownership is currently fully at creator (Aila Koponen). The review process, improvements and implementation of new cases is yet to be negotiated.

## Risks, Limitations & Known Challenges

* No APIs available at the moment, this might pose a risk for effective means e.g. headless login in order to test all not-login functionalities, though the project state based login solution will ease the pain substantially. Also verification of the data input would benefit from direct DB access via APIs
* The portal seems to have problems in requirement handling or clear errors e.g. a client can purchase 0 items and check-out getting a receipt, which should not be possible. This indicates that there might be some underlying structure problems, or a bunch of bigger problems that need application refactoring
* The portal code does not use 'test-dataid':s but non-standard arributes for accessing elements.

## Timeline

This is the first project for the site. Timeline to be revisited in near future.
