# Repository playwrite_tests

This repository contains test folder of a project of a restricted but efficient UI automation suite implemented using Playwright and Typescript.

The test target site is <https://www.saucedemo.com/>. The tests cover the site’s core features and risks.

## Requirements for the tests implementation

The original requirements set include the following specifications:

- Tests must use a web-browser (no API-only solutions)
- No fixed sleeps
- Clear locator strategy (avoid brittle selectors)
- Maintainable structure (Page Objects or clear Keyword-structure)
- One-command run, documented in README
- __*AI tools are allowed and also recommended*__ (usage documented in ai_usage.md file)

## Deliverables

- Code, this README.md, test_design.md, ai_usage.md, see tests directory
- Single contributor: Aila Koponen

## Test Suite Setup

Instructions for setting up and running this Playwright test suite in a clean environment.

### Prerequisites

The following tools must be installed before setting up the project.

#### 1. Git

Used to clone the repository.

__Linux (Debian/Ubuntu):__

```bash
sudo apt-get update
sudo apt-get install -y git
```

__macOS (Homebrew):__

```bash
brew install git
```

__Windows:__

```powershell
winget install --id Git.Git -e --source winget
```

#### 2. Node.js (includes npm)

Requires __Node.js 18 or later__.

__Linux (Debian/Ubuntu):__

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

__macOS (Homebrew):__

```bash
brew install node
```

__Windows:__

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

__Linux:__

```bash
npx playwright install --with-deps
```

> `--with-deps` also installs OS-level libraries (e.g. `libnss3`, `libatk`) that browsers require on Linux. This flag is not needed on macOS or Windows, as the OS already provides the required libraries.

__macOS / Windows:__

```bash
npx playwright install
```

### Running the tests

Run the full test suite headlessly:

```bash
npx playwright test
```

Run tests with the interactive UI mode:

```bash
npx playwright test --ui
```

View the HTML report after a run:

```bash
npx playwright show-report
```

### Notes

- The tests can also be run with 'npx test' or 'npx run test -- --ui' and the report can be obtained with 'npx run test:report' (instead of the 'playwright show-report') as the commands are added to the package.json configuration
- The test target is a publicly accessible website; no local server, separate authentication, or `.env` configuration is required.
