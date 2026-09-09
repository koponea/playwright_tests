import { test, expect, type Locator, type Page } from '@playwright/test';
const { describe } = require('@playwright/test')
const config = require('../utils/config')

/******UNDER CONSTRUCTION !! tests all playable***/

interface User {
  password: string;
  username: string;
}
const defaultUser: User = {
  username: config.USERNAME_DEFAULT,
  password: config.PASSWORD_DEFAULT
};
const defultUsernameArray: string[] =
  config.USERNAMES_DEFAULT.split(/\s+/);

const baseUrl = config.DEMO_PORTAL_URL;
const portalHeader = config.DEMO_PORTAL_HEADER;
const portalHomeSecondaryHeader = 'Products';

const pathInventory = '/inventory.html'; // home landingpage
const pathDetails = '/inventory-item.html'; // e.g. /inventory-item.html?id=4
const pathCart = '/cart.html';
const pathCheckoutInfo = '/checkout-step-one.html';
const pathCheckoutOverview = '/checkout-step-two.html';
const pathCheckoutComplete = '/checkout-complete.html';
// pdf receipt at checkout e.g.:
// file:///home/aila/Downloads/swag-labs-order-2026-09-09_19-44-47.pdf

const dataTest = (locator: string) => `[data-test=${locator}]`

class SauceDemoLoginPage {
  readonly page: Page;
  readonly loginButton: Locator;
  readonly passwordInput: Locator;
  readonly usernameInput: Locator;
  readonly titleText: string;
  readonly secondaryTitleText: string;
  readonly loginCredentialsGrid: Locator;
  readonly loginPasswordGrid: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginCredentialsGrid = page.locator(`.login_credentials`);
    this.loginPasswordGrid = page.locator(`.login_password`);
    this.loginButton = page.locator(dataTest('login-button'));
    this.passwordInput = page.locator(dataTest('password'));
    this.usernameInput = page.locator(dataTest('username'));
    this.titleText = portalHeader;
    this.secondaryTitleText = portalHomeSecondaryHeader;
  }

  async goto() {
    await this.page.goto('/')
    await this.page.waitForURL(new RegExp(`^${baseUrl}.*`));
    await expect(this.page.getByText(this.titleText)).toBeVisible();
    await expect(this.loginCredentialsGrid).toBeVisible();
  };

  async verifyLoginCredentials(user: User) {
    await expect(this.loginCredentialsGrid)
      .toContainText(new RegExp(`.*${user.username}.*`));
    await expect(this.loginPasswordGrid)
      .toContainText(new RegExp(`.*${user.password}.*`));
  };

  async verifyAllLoginCredentials(users: string[] | User[]) {
    users.forEach(async (user: string | User) => {
      const userToCheck: User = (typeof user == 'string')
        ? { username: user, password: config.PASSWORD_DEFAULT }
        : user;
      await this.verifyLoginCredentials(userToCheck);
    });
  }

  async useLoginCredentials(user: User) {
    await this.usernameInput.fill(user.username);
    await this.passwordInput.fill(user.password);
  };

  async submitAndVerifyLanding(bodyTextToWait: string, page: Page) {
    await this.loginButton.click(); // increased timeout for page stalling
    const bodyText = (bodyTextToWait) ?
      bodyTextToWait :
      this.secondaryTitleText;
    await expect(page.getByText(bodyText)).toBeVisible();
  };

  async login(
    user: User,
    bodyTextToWait: string,
    page: Page,
  ) {
    await this.goto()
    await this.verifyLoginCredentials(user);
    await this.useLoginCredentials(user);
    await this.submitAndVerifyLanding(bodyTextToWait, page);
  };
}

class SauceDemoInventoryPage { }

class SauceDemoDetailsPage { }

class SauceDemoCartPage { }

class SauceDemoCheckoutInfoPage { }

class SauceDemoCheckoutOverviewPage { }

class SauceDemoCheckoutCompletePage { }

describe('Saucedemo shopping portal', () => {
  test('Basic login and general access credentials', async ({ page }) => {
    const loginPage = new SauceDemoLoginPage(page);
    await loginPage.goto();

    await expect(page).toHaveTitle(new RegExp(`^${loginPage.titleText}$`));
    await expect(page.getByText(loginPage.titleText)).toBeVisible();

    await loginPage.verifyAllLoginCredentials(defultUsernameArray)

    await loginPage.verifyLoginCredentials(defaultUser);
    await loginPage.useLoginCredentials(defaultUser);
    await loginPage.submitAndVerifyLanding(loginPage.secondaryTitleText, page);

    await expect(page.url()).toBe(`${baseUrl}${pathInventory}`);
  });
  describe('Shopping without intent to check-out', () => {
    test('Items can be browsed and de-carted with regular logout', async ({ page }) => {
      //basic logout when no purchase
      const loginPage = new SauceDemoLoginPage(page);
      await loginPage.login(defaultUser, loginPage.secondaryTitleText, page)
      await page.waitForURL(new RegExp(`^${baseUrl}${pathInventory}.*`));

      // login complete, continue case after this
    });

    test('Bailing out mid shopping', async ({ page }) => {
      //basic logout when no purchase
      const loginPage = new SauceDemoLoginPage(page);
      await loginPage.login(defaultUser, loginPage.secondaryTitleText, page)
      await page.waitForURL(new RegExp(`^${baseUrl}${pathInventory}.*`));

      // login complete, continue case after this
    });
  });

  describe('Shopping with intent to check-out', () => {
    test('Checking out with purchase and receipt', async ({ page }) => {
      const loginPage = new SauceDemoLoginPage(page);
      await loginPage.login(defaultUser, loginPage.secondaryTitleText, page)
      await page.waitForURL(new RegExp(`^${baseUrl}${pathInventory}.*`));

      // login complete, continue case after this
    });

    test('Cheking out with no purchase', async ({ page }) => {
      const loginPage = new SauceDemoLoginPage(page);
      await loginPage.login(defaultUser, loginPage.secondaryTitleText, page)
      await page.waitForURL(new RegExp(`^${baseUrl}${pathInventory}.*`));

      // login complete, continue case after this
    });
  });

  test('Linking outside the portal', async ({ page }) => {
    const loginPage = new SauceDemoLoginPage(page);
    await loginPage.login(defaultUser, loginPage.secondaryTitleText, page)
    await page.waitForURL(new RegExp(`^${baseUrl}${pathInventory}.*`));

    // login complete, continue case after this
  });
});
