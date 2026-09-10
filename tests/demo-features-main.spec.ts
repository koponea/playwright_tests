import { test, expect, type Locator, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as zlib from 'zlib';
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

const defaultUserPostalCode = '01800';
const defaultUserFirstName = 'Kerttu';
const defaultUserSurName = 'Ketteryysguru';

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

function extractPdfText(pdfPath: string): string {
  const buf = fs.readFileSync(pdfPath);
  const startMarker = Buffer.from('stream\n');
  const endMarker = Buffer.from('\nendstream');
  const texts: string[] = [];
  let pos = 0;
  while (pos < buf.length) {
    const s = buf.indexOf(startMarker, pos);
    if (s === -1) break;
    const dataStart = s + startMarker.length;
    const e = buf.indexOf(endMarker, dataStart);
    if (e === -1) { pos = s + 1; continue; }
    try {
      const content = zlib.inflateSync(buf.slice(dataStart, e)).toString('latin1');
      const hexMatches = content.match(/<([0-9a-fA-F]+)>/g) || [];
      hexMatches.forEach(m => {
        const hex = m.slice(1, -1);
        if (hex.length % 2 === 0)
          texts.push(Buffer.from(hex, 'hex').toString('latin1'));
      });
    } catch { /* skip non-FlateDecode streams */ }
    pos = e + 1;
  }
  return texts.join('');
}

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

  async goToCheckout(): Promise<void> {
    await this.page.locator(dataTest('checkout')).click();
    await this.page.waitForURL(/checkout-step-one/);
  }
}

class SauceDemoCheckoutInfoPage {
  readonly page: Page;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.locator(dataTest('firstName'));
    this.lastNameInput = page.locator(dataTest('lastName'));
    this.postalCodeInput = page.locator(dataTest('postalCode'));
    this.continueBtn = page.locator(dataTest('continue'));
  }

  async fillAndContinue(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
    await this.continueBtn.click();
    await this.page.waitForURL(/checkout-step-two/);
  }
}

class SauceDemoCheckoutOverviewPage {
  readonly page: Page;
  readonly cartItems: Locator;
  readonly totalLabel: Locator;
  readonly finishBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartItems = page.locator(dataTest('inventory-item'));
    this.totalLabel = page.locator(dataTest('total-label'));
    this.finishBtn = page.locator(dataTest('finish'));
  }

  async finish(): Promise<void> {
    await this.finishBtn.click();
    await this.page.waitForURL(/checkout-complete/);
  }
}

class SauceDemoCheckoutCompletePage {
  readonly page: Page;
  readonly completeHeader: Locator;
  readonly generatePdfBtn: Locator;
  readonly backHomeBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.completeHeader = page.locator(dataTest('complete-header'));
    this.generatePdfBtn = page.locator(dataTest('generate-pdf-order'));
    this.backHomeBtn = page.locator(dataTest('back-to-products'));
  }

  async downloadPdf(savePath: string): Promise<void> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.generatePdfBtn.click(),
    ]);
    await download.saveAs(savePath);
  }

  async goBackHome(): Promise<void> {
    await this.backHomeBtn.click();
    await this.page.waitForURL(/inventory\.html/);
  }
}

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
      await loginPage.login(defaultUser, loginPage.secondaryTitleText, page);
      await page.waitForURL(new RegExp(`^${baseUrl}${pathInventory}.*`));

      const inventoryPage = new SauceDemoInventoryPage(page);
      const cartPage = new SauceDemoCartPage(page);
      const checkoutInfoPage = new SauceDemoCheckoutInfoPage(page);
      const checkoutOverviewPage = new SauceDemoCheckoutOverviewPage(page);
      const checkoutCompletePage = new SauceDemoCheckoutCompletePage(page);

      const item1 = 'sauce-labs-backpack';
      const item1Name = 'Sauce Labs Backpack';

      // Add item to cart
      await inventoryPage.addToCartBtn(item1).click();
      await expect(inventoryPage.cartBadge).toHaveText('1');

      // Go to cart and verify item is there
      await inventoryPage.goToCart();
      await expect(cartPage.cartItems).toHaveCount(1);
      await expect(page.locator(dataTest('inventory-item-name'))).toHaveText(item1Name);

      // Proceed to checkout step one
      await cartPage.goToCheckout();
      await expect(page).toHaveURL(new RegExp(`^${baseUrl}${pathCheckoutInfo}.*`));
      await expect(page.locator(dataTest('title'))).toHaveText('Checkout: Your Information');

      // Fill in customer information and continue
      await checkoutInfoPage.fillAndContinue(defaultUserFirstName, defaultUserSurName, defaultUserPostalCode);
      await expect(page).toHaveURL(new RegExp(`^${baseUrl}${pathCheckoutOverview}.*`));

      // Verify item and total on overview
      await expect(checkoutOverviewPage.cartItems).toHaveCount(1);
      await expect(page.locator(dataTest('inventory-item-name'))).toHaveText(item1Name);
      const totalText = await checkoutOverviewPage.totalLabel.textContent() ?? '';
      await expect(checkoutOverviewPage.totalLabel).toContainText('$');

      // Finish the order
      await checkoutOverviewPage.finish();
      await expect(page).toHaveURL(new RegExp(`^${baseUrl}${pathCheckoutComplete}.*`));
      await expect(checkoutCompletePage.completeHeader).toHaveText('Thank you for your order!');

      // Download PDF receipt and verify name and total amount
      const pdfPath = '/tmp/swag-labs-receipt-test.pdf';
      await checkoutCompletePage.downloadPdf(pdfPath);
      const pdfText = extractPdfText(pdfPath);
      expect(pdfText).toContain(defaultUserFirstName);
      expect(pdfText).toContain(defaultUserSurName);
      const numericTotal = (totalText.match(/[\d.]+/) ?? [])[0] ?? '';
      expect(pdfText).toContain(numericTotal);

      // Back Home → inventory → logout
      await checkoutCompletePage.goBackHome();
      await expect(page).toHaveURL(new RegExp(`^${baseUrl}${pathInventory}.*`));
      await inventoryPage.logout();
      await expect(loginPage.loginButton).toBeVisible();
    });

    test('Cheking out with no purchase', async ({ page }) => {
      const loginPage = new SauceDemoLoginPage(page);
      await loginPage.login(defaultUser, loginPage.secondaryTitleText, page);
      await page.waitForURL(new RegExp(`^${baseUrl}${pathInventory}.*`));

      // login complete, continue case after this
    });
  });

  test('Linking outside the portal', async ({ page }) => {
    const loginPage = new SauceDemoLoginPage(page);
    await loginPage.login(defaultUser, loginPage.secondaryTitleText, page);
    await page.waitForURL(new RegExp(`^${baseUrl}${pathInventory}.*`));

    // login complete, continue case after this
  });
});
