/**
 * DishDrop Menu Scraper
 *
 * Comprehensive web crawler for extracting structured menu data from restaurant websites.
 * Uses Playwright for JavaScript-rendered pages and heuristic parsing for menu extraction.
 *
 * Usage: npx ts-node --transpile-only scripts/scrape-menus.ts [--limit N] [--offset N] [--restaurant slug]
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

// ============================================
// TYPES
// ============================================

interface MenuItem {
  name: string;
  description?: string;
  price?: string;
  dietaryTags?: string[];
}

interface MenuCategory {
  name: string;
  items: MenuItem[];
}

interface RestaurantMenu {
  categories: MenuCategory[];
}

interface RestaurantInput {
  name: string;
  slug: string;
  website: string | null;
  cuisineTypes: string[];
  city: string;
  state: string;
}

interface ScrapeResult {
  slug: string;
  name: string;
  website: string;
  status: 'success' | 'partial' | 'failed' | 'skipped' | 'pdf_menu' | 'image_menu' | 'no_website';
  menuUrl?: string;
  menu?: RestaurantMenu;
  itemCount: number;
  categoryCount: number;
  error?: string;
  duration: number;
}

// ============================================
// CONSTANTS
// ============================================

const DATA_DIR = path.join(__dirname, '..', 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'menus-extracted.json');
const LOG_FILE = path.join(DATA_DIR, 'scrape-log.json');
const RAW_DIR = path.join(DATA_DIR, 'menu-raw');

const MENU_LINK_PATTERNS = [
  /\bmenu\b/i,
  /\bfood\s*(?:&|and)?\s*drink/i,
  /\bdining\b/i,
  /\bour\s*food\b/i,
  /\bfood\b/i,
];

const MENU_URL_PATTERNS = [
  /\/menu/i,
  /\/food/i,
  /\/dining/i,
  /\/eat/i,
  /\/our-menu/i,
  /\/lunch/i,
  /\/dinner/i,
];

// Dietary keyword detection
const DIETARY_KEYWORDS: Record<string, RegExp> = {
  vegetarian: /\b(vegetarian|veggie)\b/i,
  vegan: /\b(vegan|plant[\s-]?based)\b/i,
  'gluten-free': /\b(gluten[\s-]?free|gf|celiac)\b/i,
  spicy: /\b(spicy|hot|🌶|🔥)\b/i,
  'dairy-free': /\b(dairy[\s-]?free|non[\s-]?dairy)\b/i,
  'nut-free': /\b(nut[\s-]?free)\b/i,
  halal: /\b(halal)\b/i,
  kosher: /\b(kosher)\b/i,
  organic: /\b(organic)\b/i,
};

// Price regex: matches $X, $X.XX, $XX, $XX.XX, etc.
const PRICE_REGEX = /\$\d{1,3}(?:\.\d{2})?/;
const PRICE_STRICT_REGEX = /^\$?\d{1,3}(?:\.\d{2})?$/;

// Skip these domains - they're ordering platforms, not restaurant websites
const SKIP_DOMAINS = [
  'ordering.chownow.com',
  'order.online',
  'doordash.com',
  'ubereats.com',
  'grubhub.com',
  'postmates.com',
  'seamless.com',
  'yelp.com',
  'tripadvisor.com',
  'facebook.com',
  'instagram.com',
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function cleanText(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function standardizeCapitalization(text: string): string {
  // Don't modify if it's already properly capitalized or ALL CAPS intentionally short (e.g., "BBQ")
  if (text.length <= 4 && text === text.toUpperCase()) return text;

  // Convert ALL CAPS to Title Case
  if (text === text.toUpperCase() && text.length > 4) {
    return text
      .toLowerCase()
      .replace(/(?:^|\s|-)\S/g, c => c.toUpperCase());
  }
  return text;
}

function extractPrice(text: string): string | undefined {
  const match = text.match(PRICE_REGEX);
  return match ? match[0] : undefined;
}

function extractDietaryTags(text: string): string[] {
  const tags: string[] = [];
  for (const [tag, regex] of Object.entries(DIETARY_KEYWORDS)) {
    if (regex.test(text)) {
      tags.push(tag);
    }
  }
  return tags;
}

function isSkippedDomain(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return SKIP_DOMAINS.some(d => hostname.includes(d));
  } catch {
    return false;
  }
}

function isSameDomain(url1: string, url2: string): boolean {
  try {
    const h1 = new URL(url1).hostname.replace(/^www\./, '');
    const h2 = new URL(url2).hostname.replace(/^www\./, '');
    return h1 === h2;
  } catch {
    return false;
  }
}

// ============================================
// MENU PAGE DISCOVERY
// ============================================

async function findMenuPage(page: Page, baseUrl: string): Promise<string | null> {
  // Strategy 1: Check common menu URL patterns directly
  const urlsToTry = [
    '/menu',
    '/menus',
    '/food-menu',
    '/our-menu',
    '/food-and-drink',
    '/food',
    '/dining',
    '/lunch-menu',
    '/dinner-menu',
    '/menu/',
    '/food-drink',
  ];

  // Strategy 2: Look for menu links on the current page
  const links = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a[href]'));
    return anchors.map(a => ({
      href: (a as HTMLAnchorElement).href,
      text: (a as HTMLElement).innerText?.trim() || '',
    }));
  });

  // First: find links with "menu" in the text
  for (const pattern of MENU_LINK_PATTERNS) {
    const menuLink = links.find(
      l => pattern.test(l.text) && l.href && isSameDomain(l.href, baseUrl)
    );
    if (menuLink) {
      return menuLink.href;
    }
  }

  // Second: find links with menu in the URL path
  for (const pattern of MENU_URL_PATTERNS) {
    const menuLink = links.find(
      l => pattern.test(l.href) && isSameDomain(l.href, baseUrl)
    );
    if (menuLink) {
      return menuLink.href;
    }
  }

  // Strategy 3: Try common URL patterns directly
  const origin = new URL(baseUrl).origin;
  for (const urlPath of urlsToTry) {
    try {
      const testUrl = origin + urlPath;
      const response = await page.goto(testUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 8000,
      });
      if (response && response.status() === 200) {
        const title = await page.title();
        const content = await page.textContent('body');
        // Check if the page looks like it has menu content (prices, food items)
        if (content && PRICE_REGEX.test(content)) {
          return testUrl;
        }
      }
    } catch {
      // URL doesn't exist, continue
    }
  }

  return null;
}

// ============================================
// MENU EXTRACTION
// ============================================

interface RawMenuSection {
  heading: string;
  items: string[];
}

async function extractMenuFromPage(page: Page): Promise<{
  menu: RestaurantMenu | null;
  isPdf: boolean;
  isImageOnly: boolean;
}> {
  // Check for PDF links - both direct .pdf links and links with "pdf" text
  const hasPdfMenu = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href]'));
    return links.some(l => {
      const href = (l as HTMLAnchorElement).href?.toLowerCase() || '';
      const text = (l as HTMLElement).innerText?.toLowerCase() || '';
      return href.endsWith('.pdf') || href.includes('.pdf') ||
        (text.includes('pdf') && (text.includes('menu') || href.includes('menu')));
    });
  });

  // Get the page content type
  const contentType = await page.evaluate(() => document.contentType);
  if (contentType === 'application/pdf') {
    return { menu: null, isPdf: true, isImageOnly: false };
  }

  // Strategy 1: Try structured extraction (look for common menu HTML patterns)
  let menu = await extractStructuredMenu(page);

  // Strategy 2: If no structured menu found, try text-based extraction
  if (!menu || menu.categories.length === 0) {
    menu = await extractTextBasedMenu(page);
  }

  // Check if the page is image-only (no text menu items found)
  const isImageOnly = !menu || menu.categories.length === 0;
  if (isImageOnly) {
    // Check if there are images that look like menu images
    const hasMenuImages = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.some(img => {
        const alt = (img.alt || '').toLowerCase();
        const src = (img.src || '').toLowerCase();
        return alt.includes('menu') || src.includes('menu');
      });
    });
    if (hasMenuImages) {
      return { menu: null, isPdf: false, isImageOnly: true };
    }
  }

  return {
    menu: menu && menu.categories.length > 0 ? menu : null,
    isPdf: hasPdfMenu && (!menu || menu.categories.length === 0),
    isImageOnly: false,
  };
}

async function extractStructuredMenu(page: Page): Promise<RestaurantMenu | null> {
  // Look for common menu HTML structures
  const rawData = await page.evaluate(() => {
    const results: { heading: string; items: { name: string; desc: string; price: string; fullText: string }[] }[] = [];

    // Common menu container selectors
    const containerSelectors = [
      '.menu-section',
      '.menu-category',
      '.menu-group',
      '[class*="menu-section"]',
      '[class*="menu-category"]',
      '[class*="menuSection"]',
      '[class*="menuCategory"]',
      '[data-menu-category]',
      '.food-menu-section',
      '.menu__section',
      '.menu__category',
    ];

    for (const selector of containerSelectors) {
      const sections = document.querySelectorAll(selector);
      if (sections.length > 0) {
        sections.forEach(section => {
          // Find heading
          const headingEl =
            section.querySelector('h2, h3, h4, .menu-section-title, .category-name, [class*="heading"], [class*="title"]');
          const heading = headingEl?.textContent?.trim() || 'Menu';

          // Find items
          const itemEls = section.querySelectorAll(
            '.menu-item, .menu-entry, [class*="menu-item"], [class*="menuItem"], [class*="dish"], li'
          );

          const items: { name: string; desc: string; price: string; fullText: string }[] = [];
          itemEls.forEach(item => {
            const nameEl = item.querySelector(
              '.item-name, .dish-name, .menu-item-name, [class*="name"], [class*="title"], h3, h4, h5, strong, b'
            );
            const descEl = item.querySelector(
              '.item-description, .dish-description, .menu-item-description, [class*="description"], [class*="desc"], p'
            );
            const priceEl = item.querySelector(
              '.item-price, .dish-price, .menu-item-price, [class*="price"], [class*="cost"]'
            );

            const name = nameEl?.textContent?.trim() || '';
            const desc = descEl?.textContent?.trim() || '';
            const price = priceEl?.textContent?.trim() || '';
            const fullText = item.textContent?.trim() || '';

            if (name && name.length > 1 && name.length < 100) {
              items.push({ name, desc, price, fullText });
            }
          });

          if (items.length > 0) {
            results.push({ heading, items });
          }
        });
        break; // Use the first matching selector pattern
      }
    }

    return results;
  });

  if (rawData.length === 0) return null;

  const categories: MenuCategory[] = rawData.map(section => ({
    name: standardizeCapitalization(cleanText(section.heading)),
    items: section.items.map(item => {
      const price = extractPrice(item.price) || extractPrice(item.fullText);
      let description = cleanText(item.desc);
      const dietaryTags = extractDietaryTags(item.fullText);
      const itemName = standardizeCapitalization(cleanText(item.name));

      // Remove description if it's just the item name repeated (case-insensitive)
      if (
        description &&
        description.toLowerCase().replace(/\s+/g, ' ') ===
          itemName.toLowerCase().replace(/\s+/g, ' ')
      ) {
        description = '';
      }

      const menuItem: MenuItem = { name: itemName };
      if (description && description.length > 3) menuItem.description = description;
      if (price) menuItem.price = price;
      if (dietaryTags.length > 0) menuItem.dietaryTags = dietaryTags;

      return menuItem;
    }),
  }));

  return { categories };
}

async function extractTextBasedMenu(page: Page): Promise<RestaurantMenu | null> {
  // Get all text content with structure hints
  const textBlocks = await page.evaluate(() => {
    const blocks: { tag: string; text: string; level: number; fontSize: number }[] = [];

    function walk(node: Node, depth: number) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text && text.length > 0) {
          const parent = node.parentElement;
          if (parent) {
            const tag = parent.tagName.toLowerCase();
            const style = window.getComputedStyle(parent);
            const fontSize = parseFloat(style.fontSize) || 16;
            blocks.push({ tag, text, level: depth, fontSize });
          }
        }
        return;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();

        // Skip hidden elements, scripts, styles, nav, footer
        if (['script', 'style', 'noscript', 'nav', 'footer', 'header'].includes(tag)) return;
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') return;

        for (const child of Array.from(node.childNodes)) {
          walk(child, depth + 1);
        }
      }
    }

    // Try to find main content area first
    const main = document.querySelector('main, [role="main"], .content, .main-content, #content, #main');
    walk(main || document.body, 0);

    return blocks;
  });

  // Parse text blocks into menu structure
  // First pass: identify the font size distribution to distinguish category headings from item headings
  const fontSizes = textBlocks.map(b => b.fontSize).filter(s => s > 0);
  const avgFontSize = fontSizes.length > 0 ? fontSizes.reduce((a, b) => a + b, 0) / fontSizes.length : 16;

  // Only treat h1/h2 or very large text as category headings
  // h3/h4/h5/h6 are often used for menu item names, not categories
  const CATEGORY_HEADING_TAGS = new Set(['h1', 'h2']);
  const CATEGORY_MIN_FONT_SIZE = avgFontSize * 1.5;

  const sections: RawMenuSection[] = [];
  let currentSection: RawMenuSection | null = null;

  for (const block of textBlocks) {
    const text = block.text.trim();
    if (!text || text.length < 2) continue;

    const isCategoryHeading =
      (CATEGORY_HEADING_TAGS.has(block.tag) || block.fontSize >= CATEGORY_MIN_FONT_SIZE) &&
      block.fontSize > avgFontSize * 1.2;
    const hasPrice = PRICE_REGEX.test(text);

    // Skip very long text blocks (likely paragraphs, not menu items)
    if (text.length > 300 && !hasPrice) continue;

    if (isCategoryHeading && !hasPrice && text.length < 50 && text.length > 2) {
      // This looks like a category heading
      if (currentSection && currentSection.items.length > 0) {
        sections.push(currentSection);
      }
      currentSection = { heading: text, items: [] };
    } else if (hasPrice || (currentSection && text.length > 3 && text.length < 200)) {
      // This looks like a menu item or description
      if (!currentSection) {
        currentSection = { heading: 'Menu', items: [] };
      }
      currentSection.items.push(text);
    }
  }

  if (currentSection && currentSection.items.length > 0) {
    sections.push(currentSection);
  }

  // Post-process: if we ended up with too many categories with 1-2 items each,
  // merge them into a single category (the parser was too aggressive with headings)
  if (sections.length > 0) {
    const singleItemSections = sections.filter(s => s.items.length <= 2);
    if (singleItemSections.length > sections.length * 0.6) {
      // Most sections have very few items - merge them
      const merged: RawMenuSection = { heading: 'Menu', items: [] };
      for (const section of sections) {
        // Add the heading as a potential item name if it looks like one
        if (section.heading !== 'Menu') {
          merged.items.push(section.heading);
        }
        merged.items.push(...section.items);
      }
      sections.length = 0;
      sections.push(merged);
    }
  }

  if (sections.length === 0) return null;

  // Convert raw sections to structured menu
  const categories: MenuCategory[] = sections
    .filter(s => s.items.length > 0)
    .map(section => ({
      name: standardizeCapitalization(cleanText(section.heading)),
      items: parseMenuItems(section.items),
    }));

  return { categories };
}

function parseMenuItems(rawItems: string[]): MenuItem[] {
  const items: MenuItem[] = [];
  let currentItem: { name: string; parts: string[] } | null = null;

  for (const raw of rawItems) {
    const cleaned = cleanText(raw);
    const hasPrice = PRICE_REGEX.test(cleaned);

    // If this line has a price, it's likely an item name + price line
    if (hasPrice) {
      // Save previous item
      if (currentItem) {
        items.push(buildMenuItem(currentItem.name, currentItem.parts.join(' ')));
      }

      // Extract name and price
      const priceMatch = cleaned.match(PRICE_REGEX);
      const price = priceMatch ? priceMatch[0] : undefined;
      const name = cleaned.replace(PRICE_REGEX, '').replace(/[\s.…·\-–—]+$/, '').trim();

      if (name.length > 1) {
        currentItem = { name, parts: price ? [price] : [] };
      }
    } else if (cleaned.length > 10 && cleaned.length < 200 && !cleaned.match(/^\d/)) {
      // This looks like a description for the current item
      if (currentItem) {
        currentItem.parts.push(cleaned);
      } else {
        // Could be a standalone item name
        currentItem = { name: cleaned, parts: [] };
      }
    } else if (cleaned.length <= 60 && cleaned.length > 2) {
      // Short text - likely another item name
      if (currentItem) {
        items.push(buildMenuItem(currentItem.name, currentItem.parts.join(' ')));
      }
      currentItem = { name: cleaned, parts: [] };
    }
  }

  // Don't forget the last item
  if (currentItem) {
    items.push(buildMenuItem(currentItem.name, currentItem.parts.join(' ')));
  }

  return items;
}

function buildMenuItem(name: string, extraText: string): MenuItem {
  const price = extractPrice(extraText);
  let description = extraText
    .replace(PRICE_REGEX, '')
    .replace(/[\s.…·\-–—]+$/, '')
    .trim();
  const fullText = name + ' ' + extraText;
  const dietaryTags = extractDietaryTags(fullText);

  // Remove description if it's just the item name repeated (case-insensitive)
  if (description && description.toLowerCase().replace(/\s+/g, ' ') === name.toLowerCase().replace(/\s+/g, ' ')) {
    description = '';
  }

  const stdName = standardizeCapitalization(name);
  const item: MenuItem = { name: stdName };
  if (description && description.length > 3) {
    // Also remove description if it's the standardized name
    if (description.toLowerCase().replace(/\s+/g, ' ') !== stdName.toLowerCase().replace(/\s+/g, ' ')) {
      item.description = cleanText(description);
    }
  }
  if (price) item.price = price;
  if (dietaryTags.length > 0) item.dietaryTags = dietaryTags;

  return item;
}

// ============================================
// MULTI-PAGE MENU HANDLING
// ============================================

async function findSubMenuPages(page: Page, menuUrl: string): Promise<string[]> {
  const subPages: string[] = [];

  const links = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a[href]'));
    return anchors.map(a => ({
      href: (a as HTMLAnchorElement).href,
      text: (a as HTMLElement).innerText?.trim() || '',
    }));
  });

  const subMenuPatterns = [
    /\blunch\b/i,
    /\bdinner\b/i,
    /\bbrunch\b/i,
    /\bbreakfast\b/i,
    /\bdrink/i,
    /\bcocktail/i,
    /\bwine/i,
    /\bbeer/i,
    /\bdessert/i,
    /\bappetizer/i,
    /\bspecial/i,
    /\bhappy\s*hour/i,
    /\bkid/i,
    /\bcatering/i,
  ];

  for (const link of links) {
    if (!isSameDomain(link.href, menuUrl)) continue;
    if (link.href === menuUrl) continue;

    const isSubMenu = subMenuPatterns.some(
      p => p.test(link.text) || p.test(link.href)
    );

    if (isSubMenu && !subPages.includes(link.href)) {
      subPages.push(link.href);
    }
  }

  return subPages.slice(0, 5); // Limit to 5 sub-pages
}

// ============================================
// MAIN SCRAPER
// ============================================

async function scrapeRestaurantMenu(
  context: BrowserContext,
  restaurant: RestaurantInput,
  retries = 2
): Promise<ScrapeResult> {
  const startTime = Date.now();

  if (!restaurant.website) {
    return {
      slug: restaurant.slug,
      name: restaurant.name,
      website: '',
      status: 'no_website',
      itemCount: 0,
      categoryCount: 0,
      duration: Date.now() - startTime,
    };
  }

  if (isSkippedDomain(restaurant.website)) {
    return {
      slug: restaurant.slug,
      name: restaurant.name,
      website: restaurant.website,
      status: 'skipped',
      error: 'Third-party ordering platform, not a restaurant website',
      itemCount: 0,
      categoryCount: 0,
      duration: Date.now() - startTime,
    };
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    const page = await context.newPage();

    try {
      // Navigate to the restaurant website
      console.log(`  [${attempt > 0 ? `retry ${attempt}` : 'visit'}] ${restaurant.website}`);
      await page.goto(restaurant.website, {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      });

      // Wait a bit for dynamic content
      await sleep(1500);

      // Try to find the menu page
      let menuUrl = restaurant.website;
      const foundMenuUrl = await findMenuPage(page, restaurant.website);

      if (foundMenuUrl && foundMenuUrl !== restaurant.website) {
        menuUrl = foundMenuUrl;
        console.log(`  [menu found] ${menuUrl}`);
        await page.goto(menuUrl, {
          waitUntil: 'domcontentloaded',
          timeout: 15000,
        });
        await sleep(1500);
      }

      // Extract menu from the main menu page
      const { menu, isPdf, isImageOnly } = await extractMenuFromPage(page);

      if (isPdf && (!menu || menu.categories.length === 0 || menu.categories.reduce((s, c) => s + c.items.length, 0) < 3)) {
        await page.close();
        return {
          slug: restaurant.slug,
          name: restaurant.name,
          website: restaurant.website,
          menuUrl,
          status: 'pdf_menu',
          error: 'Menu is only available as PDF (OCR required)',
          itemCount: 0,
          categoryCount: 0,
          duration: Date.now() - startTime,
        };
      }

      if (isImageOnly) {
        await page.close();
        return {
          slug: restaurant.slug,
          name: restaurant.name,
          website: restaurant.website,
          menuUrl,
          status: 'image_menu',
          error: 'Menu is only available as image (OCR required)',
          itemCount: 0,
          categoryCount: 0,
          duration: Date.now() - startTime,
        };
      }

      // Check for sub-menu pages (lunch, dinner, drinks, etc.)
      let allCategories = menu?.categories || [];

      if (menu && menu.categories.length > 0) {
        const subPages = await findSubMenuPages(page, menuUrl);
        for (const subUrl of subPages) {
          try {
            await page.goto(subUrl, {
              waitUntil: 'domcontentloaded',
              timeout: 10000,
            });
            await sleep(1000);
            const subResult = await extractMenuFromPage(page);
            if (subResult.menu && subResult.menu.categories.length > 0) {
              allCategories = [...allCategories, ...subResult.menu.categories];
            }
          } catch {
            // Sub-page failed, continue
          }
        }
      }

      // Deduplicate categories and items
      const dedupedMenu = deduplicateMenu({ categories: allCategories });

      await page.close();

      const totalItems = dedupedMenu.categories.reduce(
        (sum, cat) => sum + cat.items.length,
        0
      );

      if (totalItems === 0) {
        return {
          slug: restaurant.slug,
          name: restaurant.name,
          website: restaurant.website,
          menuUrl,
          status: 'failed',
          error: 'Could not extract any menu items',
          itemCount: 0,
          categoryCount: 0,
          duration: Date.now() - startTime,
        };
      }

      return {
        slug: restaurant.slug,
        name: restaurant.name,
        website: restaurant.website,
        menuUrl,
        status: totalItems >= 3 ? 'success' : 'partial',
        menu: dedupedMenu,
        itemCount: totalItems,
        categoryCount: dedupedMenu.categories.length,
        duration: Date.now() - startTime,
      };
    } catch (err: any) {
      await page.close();

      if (attempt < retries) {
        console.log(`  [error] ${err.message} - retrying...`);
        await sleep(2000);
        continue;
      }

      return {
        slug: restaurant.slug,
        name: restaurant.name,
        website: restaurant.website,
        status: 'failed',
        error: err.message?.slice(0, 200),
        itemCount: 0,
        categoryCount: 0,
        duration: Date.now() - startTime,
      };
    }
  }

  // Should never reach here but TypeScript needs it
  return {
    slug: restaurant.slug,
    name: restaurant.name,
    website: restaurant.website || '',
    status: 'failed',
    error: 'Exhausted retries',
    itemCount: 0,
    categoryCount: 0,
    duration: Date.now() - startTime,
  };
}

// ============================================
// DEDUPLICATION
// ============================================

// Junk patterns that indicate non-food content
const JUNK_ITEM_PATTERNS = [
  /\b(pdf|load more|view menu|download|click here|order online|catering|gift card)\b/i,
  /^(home|about|contact|reservations|private events|gallery|press)$/i,
  /^\d+$/,  // Just a number
];

function isJunkItem(item: MenuItem): boolean {
  return JUNK_ITEM_PATTERNS.some(p => p.test(item.name)) ||
    item.name.length < 2 ||
    item.name.length > 80;
}

function deduplicateMenu(menu: RestaurantMenu): RestaurantMenu {
  const seenItems = new Set<string>();
  const categories: MenuCategory[] = [];

  for (const category of menu.categories) {
    const uniqueItems: MenuItem[] = [];

    for (const item of category.items) {
      if (isJunkItem(item)) continue;

      const key = item.name.toLowerCase().replace(/\s+/g, ' ');
      if (!seenItems.has(key)) {
        seenItems.add(key);
        uniqueItems.push(item);
      }
    }

    if (uniqueItems.length > 0) {
      // Check if a category with this name already exists
      const existingCat = categories.find(
        c => c.name.toLowerCase() === category.name.toLowerCase()
      );
      if (existingCat) {
        existingCat.items.push(...uniqueItems);
      } else {
        categories.push({ name: category.name, items: uniqueItems });
      }
    }
  }

  return { categories };
}

// ============================================
// MAIN
// ============================================

async function main() {
  // Parse CLI args
  const args = process.argv.slice(2);
  const limitIdx = args.indexOf('--limit');
  const offsetIdx = args.indexOf('--offset');
  const slugIdx = args.indexOf('--restaurant');

  const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1]) : undefined;
  const offset = offsetIdx >= 0 ? parseInt(args[offsetIdx + 1]) : 0;
  const targetSlug = slugIdx >= 0 ? args[slugIdx + 1] : undefined;

  // Load restaurant data
  const rawDataPath = path.join(DATA_DIR, 'restaurants-raw.json');
  if (!fs.existsSync(rawDataPath)) {
    console.error('Error: restaurants-raw.json not found. Run fetch-restaurants first.');
    process.exit(1);
  }

  let restaurants: RestaurantInput[] = JSON.parse(
    fs.readFileSync(rawDataPath, 'utf-8')
  );

  // Filter
  if (targetSlug) {
    restaurants = restaurants.filter(r => r.slug === targetSlug);
    if (restaurants.length === 0) {
      console.error(`Restaurant with slug "${targetSlug}" not found.`);
      process.exit(1);
    }
  }

  restaurants = restaurants.slice(offset, limit ? offset + limit : undefined);

  console.log(`\n🍽️  DishDrop Menu Scraper`);
  console.log(`${'='.repeat(50)}`);
  console.log(`Restaurants to process: ${restaurants.length}`);
  console.log(`Output: ${OUTPUT_FILE}`);
  console.log(`Log: ${LOG_FILE}\n`);

  // Ensure output directories exist
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(RAW_DIR)) fs.mkdirSync(RAW_DIR, { recursive: true });

  // Launch browser
  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 900 },
    locale: 'en-US',
  });

  // Block unnecessary resources for speed
  await context.route('**/*.{png,jpg,jpeg,gif,svg,webp,ico,woff,woff2,ttf,eot}', route =>
    route.abort()
  );
  await context.route('**/*google-analytics*', route => route.abort());
  await context.route('**/*facebook*', route => route.abort());
  await context.route('**/*analytics*', route => route.abort());

  const results: ScrapeResult[] = [];
  const menuData: Record<string, { name: string; menu: RestaurantMenu; menuUrl: string }> = {};

  // Load existing results if resuming
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      const existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
      Object.assign(menuData, existing);
      console.log(`Loaded ${Object.keys(existing).length} existing menu entries\n`);
    } catch {
      // Start fresh
    }
  }

  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;

  for (let i = 0; i < restaurants.length; i++) {
    const restaurant = restaurants[i];
    const progress = `[${i + 1}/${restaurants.length}]`;

    console.log(`${progress} ${restaurant.name}`);

    // Skip if already scraped
    if (menuData[restaurant.slug]) {
      console.log(`  [cached] Already scraped, skipping\n`);
      skipCount++;
      continue;
    }

    const result = await scrapeRestaurantMenu(context, restaurant);
    results.push(result);

    if (result.status === 'success' || result.status === 'partial') {
      successCount++;
      menuData[restaurant.slug] = {
        name: restaurant.name,
        menu: result.menu!,
        menuUrl: result.menuUrl || restaurant.website || '',
      };
      console.log(
        `  ✅ ${result.categoryCount} categories, ${result.itemCount} items (${result.duration}ms)\n`
      );
    } else {
      failCount++;
      console.log(`  ❌ ${result.status}: ${result.error} (${result.duration}ms)\n`);
    }

    // Save progress periodically
    if ((i + 1) % 10 === 0) {
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(menuData, null, 2));
      console.log(`  [saved] Progress saved (${Object.keys(menuData).length} menus)\n`);
    }

    // Rate limiting
    await sleep(1500);
  }

  // Save final results
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(menuData, null, 2));

  // Generate summary log
  const summary = {
    timestamp: new Date().toISOString(),
    totalProcessed: restaurants.length,
    success: successCount,
    failed: failCount,
    skipped: skipCount,
    totalMenusStored: Object.keys(menuData).length,
    results: results.map(r => ({
      slug: r.slug,
      name: r.name,
      status: r.status,
      itemCount: r.itemCount,
      categoryCount: r.categoryCount,
      menuUrl: r.menuUrl,
      error: r.error,
      duration: r.duration,
    })),
  };

  fs.writeFileSync(LOG_FILE, JSON.stringify(summary, null, 2));

  await browser.close();

  // Print summary
  console.log(`\n${'='.repeat(50)}`);
  console.log(`📊 Scrape Summary`);
  console.log(`${'='.repeat(50)}`);
  console.log(`Total processed: ${restaurants.length}`);
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`⏭️  Skipped: ${skipCount}`);
  console.log(`📁 Total menus stored: ${Object.keys(menuData).length}`);
  console.log(`\nOutput: ${OUTPUT_FILE}`);
  console.log(`Log: ${LOG_FILE}`);

  // Print failed restaurants
  const failed = results.filter(r => !['success', 'partial', 'skipped'].includes(r.status));
  if (failed.length > 0) {
    console.log(`\n--- Failed/Flagged Restaurants ---`);
    for (const f of failed) {
      console.log(`  ${f.name} [${f.status}]: ${f.error}`);
    }
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
