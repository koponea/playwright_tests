# Repository playwrite_tests

This repository contains a project with a test folder containig a restricted but efficient UI automation suite implemented using Playwright and Typescript.

The test target site is <https://www.saucedemo.com/>. The tests cover the site’s core features and risks.

## Requirements for the tests implementation

The original requirements set include the following specifications:

- Tests must use a web-browser (no API-only solutions)
- No fixed sleeps
- Clear locator strategy (avoid brittle selectors)
- Maintainable structure (Page Objects or clear Keyword-structure)
- One-command run, documented in [README.md](./README.md)
- **AI tools are allowed and also recommended** (usage documented in *ai_usage.md* file)

## Deliverables

- Code, this [README.md](./README.md), [test_design.md](tests/test_design.md), [ai_usage.md](tests/ai_usage.md), see the *tests* directory
- Single contributor: Aila Koponen

## Test Suite Setup

Instructions for setting up and running this Playwright test suite in a clean environment.

### Prerequisites

The following tools must be installed before setting up the project.

#### 1. Git

Used to clone the repository.

**Linux (Debian/Ubuntu):**

```bash
sudo apt-get update
sudo apt-get install -y git
```

**macOS (Homebrew):**

```bash
brew install git
```

**Windows:**

```powershell
winget install --id Git.Git -e --source winget
```

#### 2. Node.js (includes npm)

Requires **Node.js 18 or later**.

**Linux (Debian/Ubuntu):**

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**macOS (Homebrew):**

```bash
brew install node
```

**Windows:**

```powershell
winget install OpenJS.NodeJS.LTS
```

Verify installation:

```bash
node -v
npm -v
```

### Setup

#### 1. Clone the repository

```bash
git clone https://github.com/koponea/playwright_tests.git
cd playwright_tests
```

#### 2. Install project dependencies

```bash
npm install
```

#### 3. Install Playwright browser binaries

**Linux:**

```bash
npx playwright install --with-deps
```

> `--with-deps` also installs OS-level libraries (e.g. `libnss3`, `libatk`) that browsers require on Linux. This flag is not needed on macOS or Windows, as the OS already provides the required libraries.

**macOS / Windows:**

```bash
npx playwright install
```

### Running the tests

Run the full test suite headlessly:

```bash
npx playwright test
```

>`--project` option runs the tests with one of the three given browser engines only. See the *playwrite.config.ts* for the currently defined browser engines. E.g., run only with chromium: `npx playwright test -- --project chromium`

Run tests with the interactive UI mode:

```bash
npx playwright test --ui
```

View the HTML report after a run:

```bash
npx playwright show-report
```

### Notes and some future concerns

- The project configurations in [playwright.config.md](tests/playwright.config.md) are by default running tests parallel using multiple workers. There might be need to run non-parallel due to e.g. the checkout phase and the fact that the suite needs to log in with the user with most rights when only one such is currently provided. This suite does not do testing of the user handling more than what is needed to login and to verify that the login works generally as expected.

- Also, is the DB usage tested for concurrent use if the same user in different browsers has baskets entering the checkout phase? Playwright runs tests havily in parallell which in turn could be really efficient, but the correct usage of the utilized DB as such will not verified within the current timebox.

- The playwright timeout is increased in [playwright.config.md](tests/playwright.config.md) to allow more time for the login procedure. It should be adjusted when the headless login implememtation is introduced. For future test suites it is a must for reducing the suite time budget.

- The test target is a publicly accessible website; no local server, separate authentication, or *.env* configuration is necessarily required (.env handling is offered and documented).
