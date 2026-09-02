import { test, expect, type Locator, type Page } from '@playwright/test';
const { describe } = require('@playwright/test')

interface User {
  password: string;
  username: string;
}
const defaultUser: User = {
  username: 'performance_glitch_user',
  password: 'secret_sauce'
};
const baseUrl = 'https://www.saucedemo.com/'
const homePage = 'inventory.html'
const portalHeader = 'Swag Labs';
const portalHomeSecondaryHeader = 'Products';


const dataTest = (locator: string) => `[data-test=${locator}]`

class SauceDemoLoginPage { // move to be imported
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
    await this.page.goto(baseUrl)
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

describe('Saucedemo tests', () => {
  test('basic login with general access credentials', async ({ page }) => {
    const loginPage = new SauceDemoLoginPage(page);
    await loginPage.goto();

    await expect(page).toHaveTitle(new RegExp(`^${loginPage.titleText}$`));
    await expect(page.getByText(loginPage.titleText)).toBeVisible();

    await loginPage.verifyLoginCredentials(defaultUser);
    await loginPage.useLoginCredentials(defaultUser);
    await loginPage.submitAndVerifyLanding(loginPage.secondaryTitleText, page);

    await expect(page.url()).toBe(`${baseUrl}${homePage}`);
  });

  test('main page xx1', async ({ page }) => {
    const loginPage = new SauceDemoLoginPage(page);
    await loginPage.login(defaultUser, loginPage.secondaryTitleText, page)
    await page.waitForURL(new RegExp(`^${baseUrl}${homePage}.*`));

    //tbd
  });

  test('main page xx2', async ({ page }) => {
    const loginPage = new SauceDemoLoginPage(page);
    await loginPage.login(defaultUser, loginPage.secondaryTitleText, page)
    await page.waitForURL(new RegExp(`^${baseUrl}${homePage}.*`));

    //tbd
  });

  test('main page xx3', async ({ page }) => {
    const loginPage = new SauceDemoLoginPage(page);
    await loginPage.login(defaultUser, loginPage.secondaryTitleText, page)
    await page.waitForURL(new RegExp(`^${baseUrl}${homePage}.*`));

    //tbd
  });

  test('main page xx4', async ({ page }) => {
    const loginPage = new SauceDemoLoginPage(page);
    await loginPage.login(defaultUser, loginPage.secondaryTitleText, page)
    await page.waitForURL(new RegExp(`^${baseUrl}${homePage}.*`));

    //tbd
  });
});
