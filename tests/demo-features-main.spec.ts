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

const baseUrl = config.DEMO_PORTAL_URL.replace(/\/$/g, ''); // .TrimEnd('/');
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

class SauceDemoInventoryPage {
  readonly page: Page;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartLink = page.locator(dataTest('shopping-cart-link'));
    this.cartBadge = page.locator(dataTest('shopping-cart-badge'));
  }

  addToCartBtn(item: string): Locator {
    return this.page.locator(dataTest(`add-to-cart-${item}`));
  }

  removeBtn(item: string): Locator {
    return this.page.locator(dataTest(`remove-${item}`));
  }

  itemNameLink(name: string): Locator {
    return this.page.locator(dataTest('inventory-item-name')).filter({ hasText: name });
  }

  async goToCart(): Promise<void> {
    await this.cartLink.click();
    await this.page.waitForURL(/cart\.html/);
  }

  async logout(): Promise<void> {
    await this.page.locator('#react-burger-menu-btn').click();
    await this.page.locator(dataTest('logout-sidebar-link')).waitFor({ state: 'visible' });
    await this.page.locator(dataTest('logout-sidebar-link')).click();
    await this.page.waitForURL(new RegExp(`^${baseUrl}/?$`));
  }
}

class SauceDemoDetailsPage {
  readonly page: Page;
  readonly backToProducts: Locator;
  readonly itemName: Locator;

  constructor(page: Page) {
    this.page = page;
    this.backToProducts = page.locator(dataTest('back-to-products'));
    this.itemName = page.locator(dataTest('inventory-item-name'));
  }

  async goBackToInventory(): Promise<void> {
    await this.backToProducts.click();
    await this.page.waitForURL(/inventory\.html/);
  }
}

class SauceDemoCartPage {
  readonly page: Page;
  readonly cartItems: Locator;
  readonly continueShopping: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartItems = page.locator(dataTest('inventory-item'));
    this.continueShopping = page.locator(dataTest('continue-shopping'));
  }

  removeItemBtn(item: string): Locator {
    return this.page.locator(dataTest(`remove-${item}`));
  }
}

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
      const loginPage = new SauceDemoLoginPage(page);
      await loginPage.login(defaultUser, loginPage.secondaryTitleText, page);
      await page.waitForURL(new RegExp(`^${baseUrl}${pathInventory}.*`));

      const inventoryPage = new SauceDemoInventoryPage(page);
      const detailsPage = new SauceDemoDetailsPage(page);
      const cartPage = new SauceDemoCartPage(page);

      const item1 = 'sauce-labs-backpack';
      const item1Name = 'Sauce Labs Backpack';
      const item2 = 'sauce-labs-bike-light';

      // Add two items to cart
      await inventoryPage.addToCartBtn(item1).click();
      await expect(inventoryPage.cartBadge).toHaveText('1');

      await inventoryPage.addToCartBtn(item2).click();
      await expect(inventoryPage.cartBadge).toHaveText('2');

      // Remove item2 from the inventory view
      await inventoryPage.removeBtn(item2).click();
      await expect(inventoryPage.cartBadge).toHaveText('1');

      // Navigate to item1 details page by clicking its name
      await inventoryPage.itemNameLink(item1Name).click();
      await page.waitForURL(new RegExp(`^${baseUrl}${pathDetails}.*`));
      await expect(detailsPage.itemName).toHaveText(item1Name);

      // Return to inventory via Back to Products link
      await detailsPage.goBackToInventory();
      await expect(page).toHaveURL(new RegExp(`^${baseUrl}${pathInventory}.*`));
      await expect(inventoryPage.cartBadge).toHaveText('1');

      // Navigate to cart
      await inventoryPage.goToCart();
      await expect(cartPage.cartItems).toHaveCount(1);

      // Remove item1 from cart — cart is now empty
      await cartPage.removeItemBtn(item1).click();
      await expect(cartPage.cartItems).toHaveCount(0);
      await expect(inventoryPage.cartBadge).not.toBeVisible();

      // Return to inventory and log out
      await cartPage.continueShopping.click();
      await page.waitForURL(new RegExp(`^${baseUrl}${pathInventory}.*`));
      await inventoryPage.logout();
      await expect(loginPage.loginButton).toBeVisible();
    });

    test('Bailing out mid shopping', async ({ page }) => {
      const loginPage = new SauceDemoLoginPage(page);
      await loginPage.login(defaultUser, loginPage.secondaryTitleText, page);
      await page.waitForURL(new RegExp(`^${baseUrl}${pathInventory}.*`));

      const inventoryPage = new SauceDemoInventoryPage(page);
      const detailsPage = new SauceDemoDetailsPage(page);

      const item1 = 'sauce-labs-fleece-jacket';
      const item1Name = 'Sauce Labs Fleece Jacket';
      const item2 = 'sauce-labs-onesie';

      // Add two items to cart
      await inventoryPage.addToCartBtn(item1).click();
      await expect(inventoryPage.cartBadge).toHaveText('1');

      await inventoryPage.addToCartBtn(item2).click();
      await expect(inventoryPage.cartBadge).toHaveText('2');

      // Browse to item1 details page by clicking its name
      await inventoryPage.itemNameLink(item1Name).click();
      await page.waitForURL(new RegExp(`^${baseUrl}${pathDetails}.*`));
      await expect(detailsPage.itemName).toHaveText(item1Name);

      // Return to inventory via Back to Products link
      await detailsPage.goBackToInventory();
      await expect(page).toHaveURL(new RegExp(`^${baseUrl}${pathInventory}.*`));

      // Cart is still full — user bails out without emptying it
      await expect(inventoryPage.cartBadge).toHaveText('2');

      // Log out, leaving cart full
      await inventoryPage.logout();
      await expect(loginPage.loginButton).toBeVisible();
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
