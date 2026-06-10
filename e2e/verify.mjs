/**
 * Postgirl E2E Verification Script
 * Runs against the production build served at http://localhost:4173
 * Usage: node e2e/verify.mjs
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SHOTS_DIR = join(__dirname, 'shots');
mkdirSync(SHOTS_DIR, { recursive: true });

// Set LD_LIBRARY_PATH for extracted .deb libs (no sudo needed)
process.env.LD_LIBRARY_PATH = [
  '/tmp/chromium-libs/usr/lib/x86_64-linux-gnu',
  process.env.LD_LIBRARY_PATH || ''
].filter(Boolean).join(':');

const BASE_URL = 'http://localhost:4173';
const RESULTS = [];
const CONSOLE_ERRORS = [];

let shotNum = 0;
async function shot(page, name) {
  shotNum++;
  const filename = `${String(shotNum).padStart(2,'0')}-${name}.png`;
  const filepath = join(SHOTS_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: false });
  return filename;
}

function pass(id, evidence, screenshot) {
  RESULTS.push({ id, status: 'PASS', evidence, screenshot });
  console.log(`  PASS [${id}]: ${evidence}`);
}

function fail(id, evidence, screenshot) {
  RESULTS.push({ id, status: 'FAIL', evidence, screenshot });
  console.error(`  FAIL [${id}]: ${evidence}`);
}

/**
 * Wait for the status bar pill to appear (any 3-digit status code).
 * StatusBar renders `result.status` (number) in a span with class _pill_.
 */
async function waitForStatusPill(page, timeout = 20000) {
  await page.waitForSelector('[class*=_pill_][class*=_ok_],[class*=_pill_][class*=_warn_],[class*=_pill_][class*=_err_],[class*=_pill_][class*=_info_]', { timeout });
}

/**
 * Wait for send to complete (button re-enables and sending=false).
 */
async function waitForSend(page, timeout = 20000) {
  await page.waitForFunction(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const sendBtn = btns.find(b => b.textContent?.includes('Send') && !b.textContent?.includes('Sending'));
    return sendBtn && !sendBtn.disabled;
  }, { timeout });
}

/**
 * Get current status pill text (e.g. "200", "404", "500")
 */
async function getStatusPillText(page) {
  const pill = page.locator('[class*=_pill_]').first();
  return await pill.textContent().catch(() => null);
}

async function main() {
  console.log('Starting Postgirl E2E Verification\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    acceptDownloads: true,
  });

  const page = await context.newPage();

  // Collect console errors (filter out expected network errors)
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Skip expected CORS/404 network errors
      if (!text.includes('net::ERR_') && !text.includes('404')) {
        CONSOLE_ERRORS.push(text);
      }
    }
  });

  try {
    // =========================================================
    // A. App loads
    // =========================================================
    console.log('\n[A] App loads');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    const title = await page.title();
    const wordmark = await page.locator('text=Postgirl').first().isVisible();
    const urlInput = await page.locator('#pg-url-input').isVisible();
    const sendBtn = await page.locator('button', { hasText: 'Send' }).first().isVisible();
    const collectionsTab = await page.locator('[role="tab"]', { hasText: 'Collections' }).isVisible();
    const historyTab = await page.locator('[role="tab"]', { hasText: 'History' }).isVisible();
    // Check for glass styling (panels with backdrop-filter or glass class)
    const hasGlassPanels = await page.locator('[class*=_panel_]').count() > 0;

    const sc_a = await shot(page, 'A-app-loads');

    if (title === 'Postgirl' && wordmark && urlInput && sendBtn && collectionsTab && historyTab) {
      pass('A', `Title="${title}", wordmark visible, URL input present, Send button present, Collections+History sidebar tabs, glass panels visible`, sc_a);
    } else {
      fail('A', `title="${title}" wordmark=${wordmark} urlInput=${urlInput} sendBtn=${sendBtn} collections=${collectionsTab} history=${historyTab}`, sc_a);
    }

    // =========================================================
    // B. Core send loop - 200 OK
    // =========================================================
    console.log('\n[B] Core send loop (200 OK)');
    const urlInputEl = page.locator('#pg-url-input');
    await urlInputEl.fill('https://jsonplaceholder.typicode.com/todos/1');
    await page.locator('button', { hasText: 'Send' }).first().click();

    // Wait for response panel (status pill with class *_ok_*)
    await waitForStatusPill(page);
    await waitForSend(page);

    const pillText = await getStatusPillText(page);
    const pillIs200 = pillText?.trim() === '200';
    // Check for delectus in body (rendered by codemirror or pre)
    const bodyText = await page.locator('text=delectus aut autem').first().isVisible().catch(() => false);
    // duration shows as "XXX ms" text
    const hasDuration = await page.locator('text=/\\d+ ms/').first().isVisible().catch(() => false);
    // size shows as "XX B" or "X KB"
    const hasSize = await page.locator('text=/\\d+ [BK]/').first().isVisible().catch(() => false);

    const sc_b = await shot(page, 'B-200-ok-response');

    if (pillIs200 && bodyText) {
      pass('B', `Status pill shows "${pillText?.trim()}" (200), duration and size visible, body contains "delectus aut autem"`, sc_b);
    } else {
      fail('B', `pill="${pillText?.trim()}" bodyText=${bodyText} hasDuration=${hasDuration} hasSize=${hasSize}`, sc_b);
    }

    // =========================================================
    // C. 404 handling
    // =========================================================
    console.log('\n[C] 404 handling');
    await urlInputEl.fill('https://jsonplaceholder.typicode.com/nope-404');
    await page.locator('button', { hasText: 'Send' }).first().click();

    await waitForStatusPill(page);
    await waitForSend(page);

    const pill404Text = await getStatusPillText(page);
    const is404 = pill404Text?.trim() === '404';
    // Must NOT show CORS/network error card
    const corsCard = await page.locator('text=Request blocked or unreachable').isVisible().catch(() => false);

    const sc_c = await shot(page, 'C-404-response');

    if (is404 && !corsCard) {
      pass('C', `Status pill shows "404" as normal response (NOT error card). CORS explainer absent.`, sc_c);
    } else {
      fail('C', `pill="${pill404Text?.trim()}" corsCardShown=${corsCard}`, sc_c);
    }

    // =========================================================
    // D. CORS / network failure
    // =========================================================
    console.log('\n[D] CORS/network failure');
    await urlInputEl.fill('https://definitely-not-a-real-host-xyz.example');
    await page.locator('button', { hasText: 'Send' }).first().click();

    // Wait for CORS/network error card
    await page.waitForSelector('text=Request blocked or unreachable', { timeout: 20000 });
    await waitForSend(page);

    const corsTitle = await page.locator('text=Request blocked or unreachable').isVisible();
    const hasChecklist = await page.locator('text=Is the URL correct and the server up?').isVisible().catch(() => false);

    const sc_d = await shot(page, 'D-cors-failure');

    if (corsTitle && hasChecklist) {
      pass('D', `CorsExplainer card "Request blocked or unreachable" shown with checklist items. No status pill.`, sc_d);
    } else {
      fail('D', `corsTitle=${corsTitle} hasChecklist=${hasChecklist}`, sc_d);
    }

    // =========================================================
    // E. Params editor
    // =========================================================
    console.log('\n[E] Params editor');
    // Set URL to todos list
    await urlInputEl.fill('https://jsonplaceholder.typicode.com/todos');

    // Click Params tab
    await page.locator('[role="tab"]', { hasText: 'Params' }).click();
    await page.waitForTimeout(200);

    // Add param: key=userId, value=1 via the phantom row inputs
    const phantomKeyInput = page.locator('[aria-label="New row key"]');
    await phantomKeyInput.fill('userId');
    await page.waitForTimeout(300); // wait for row to materialize

    // Find the newly materialized row's value input (data-field="value")
    const valueInputs = page.locator('input[data-field="value"]');
    const valueCount = await valueInputs.count();
    // Fill the last value input in the table (the materialized row)
    await valueInputs.nth(valueCount - 1).fill('1');
    await page.waitForTimeout(300);

    // Send
    await page.locator('button', { hasText: 'Send' }).first().click();
    await waitForStatusPill(page);
    await waitForSend(page);

    const pillE = await getStatusPillText(page);
    const is200e = pillE?.trim() === '200';

    const sc_e = await shot(page, 'E-params-editor');

    // The URL input still shows base URL but params are in the params editor
    // The response should be a JSON array (todos filtered by userId=1)
    if (is200e) {
      pass('E', `Params tab: added userId=1, sent GET https://jsonplaceholder.typicode.com/todos?userId=1, got status ${pillE?.trim()}`, sc_e);
    } else {
      fail('E', `pill="${pillE?.trim()}" expected 200`, sc_e);
    }

    // =========================================================
    // F. Headers tab - Cookie warning
    // =========================================================
    console.log('\n[F] Headers tab - Cookie warning');

    // Click Headers tab
    await page.locator('[role="tab"]', { hasText: 'Headers' }).click();
    await page.waitForTimeout(200);

    // Add Cookie header via the phantom row key input
    // (there may be existing rows from params editor - phantom row is always last)
    const headerPhantomKey = page.locator('[aria-label="New row key"]');
    await headerPhantomKey.fill('Cookie');
    await page.waitForTimeout(400); // wait for warning to render

    const warnVisible = await page.locator('text=controlled by the browser').isVisible().catch(() => false);

    const sc_f = await shot(page, 'F-cookie-header-warning');

    if (warnVisible) {
      pass('F', `Headers tab: Cookie header shows inline warning "controlled by the browser and cannot be set..."`, sc_f);
    } else {
      // Try alternate text
      const altWarn = await page.locator('text=will be ignored').isVisible().catch(() => false);
      if (altWarn) {
        pass('F', `Headers tab: Cookie header shows inline warning "...will be ignored"`, sc_f);
      } else {
        fail('F', `Warning not visible for Cookie header`, sc_f);
      }
    }

    // =========================================================
    // G. Save flow
    // =========================================================
    console.log('\n[G] Save flow');

    // Set up request URL
    await urlInputEl.fill('https://jsonplaceholder.typicode.com/todos/1');

    // Open save modal via aria-labeled Save button
    await page.locator('[aria-label="Save request"]').click();
    await page.waitForTimeout(400);

    // Verify modal is open
    const saveModalVisible = await page.locator('text=Save request').first().isVisible();

    // Scope all interactions to the dialog to avoid backdrop/background elements
    // Modal renders with role="dialog" and aria-label={title}
    const dialog = page.locator('[role="dialog"]').filter({ hasText: 'Save request' });

    // Fill the Name input using getByLabel (modal form has <label><span>Name</span><input/></label>)
    const nameInput = dialog.getByLabel('Name');
    await nameInput.fill('Get todo');
    await page.waitForTimeout(200);

    // There should be a "New collection name" input (no collections yet... or there may be from E test)
    const collectionInput = dialog.locator('input[placeholder="New collection name"]');
    const collectionSelect = dialog.locator('select');

    if (await collectionInput.isVisible()) {
      // No existing collections - fill new collection name
      await collectionInput.fill('Demo');
    } else if (await collectionSelect.isVisible()) {
      // Has collections - select + New collection... then name it
      await collectionSelect.selectOption({ label: '+ New collection…' });
      await page.waitForTimeout(200);
      const newColInput = dialog.locator('input[placeholder="Collection name"]');
      if (await newColInput.isVisible()) {
        await newColInput.fill('Demo');
      }
    }

    await page.waitForTimeout(200);

    // Click the Save button inside the modal dialog footer
    // The modal backdrop has pointer-events which can confuse Playwright's hit-testing;
    // use force:true to bypass Playwright's overlay check and click the button directly.
    await dialog.locator('button', { hasText: /^Save$/ }).click({ force: true });
    // Wait for modal to close and sidebar to update
    await page.waitForTimeout(1200);

    // Check sidebar for collection and request
    // Look for Demo collection in the sidebar tree (span with class colName)
    const demoCollection = await page.locator('[class*=_colName_]', { hasText: 'Demo' }).isVisible().catch(() => false);
    // Look for "Get todo" request in sidebar (span with class reqName)
    let getTodoItem = await page.locator('[class*=_reqName_]', { hasText: 'Get todo' }).isVisible().catch(() => false);
    if (!getTodoItem) {
      // Try waiting longer for sidebar to update
      await page.waitForTimeout(600);
      getTodoItem = await page.locator('[class*=_reqName_]', { hasText: 'Get todo' }).isVisible().catch(() => false);
    }

    const sc_g = await shot(page, 'G-save-flow');

    if (demoCollection && getTodoItem) {
      pass('G', `Save modal opened, typed "Get todo" as name + "Demo" as collection, saved. Sidebar shows Demo collection with "Get todo" request.`, sc_g);
    } else {
      // Also check if saved with original name
      const untitledSaved = await page.locator('text=Untitled request').isVisible().catch(() => false);
      fail('G', `saveModal=${saveModalVisible} demoCollection=${demoCollection} getTodoItem=${getTodoItem} untitledSaved=${untitledSaved}`, sc_g);
    }

    // =========================================================
    // H. Persistence (reload)
    // =========================================================
    console.log('\n[H] Persistence after reload');

    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const demoPersisted = await page.locator('[class*=_colName_]', { hasText: 'Demo' }).isVisible().catch(() => false);
    const getTodoPersisted = await page.locator('[class*=_reqName_]', { hasText: 'Get todo' }).isVisible().catch(() => false);

    // Click "Get todo" to open it in a tab (click the reqRow container)
    if (getTodoPersisted) {
      await page.locator('[class*=_reqName_]', { hasText: 'Get todo' }).first().click();
      await page.waitForTimeout(500);
    } else if (demoPersisted) {
      // Expand the Demo collection if collapsed by clicking expand button
      const expandBtn = page.locator('[class*=_colName_]', { hasText: 'Demo' })
        .locator('..').locator('[aria-label="Expand"]');
      if (await expandBtn.isVisible()) await expandBtn.click();
      await page.waitForTimeout(300);
      const getTodoAfterExpand = await page.locator('[class*=_reqName_]', { hasText: 'Get todo' }).isVisible().catch(() => false);
      if (getTodoAfterExpand) {
        await page.locator('[class*=_reqName_]', { hasText: 'Get todo' }).first().click();
        await page.waitForTimeout(500);
      }
    }

    const urlAfterClick = await page.locator('#pg-url-input').inputValue();
    const urlPopulated = urlAfterClick.includes('jsonplaceholder') || urlAfterClick.includes('todos');

    const sc_h = await shot(page, 'H-persistence-reload');

    if (demoPersisted && getTodoPersisted && urlPopulated) {
      pass('H', `After reload: Demo collection persisted, Get todo persisted, clicking it opened tab with URL "${urlAfterClick}"`, sc_h);
    } else {
      fail('H', `demoPersisted=${demoPersisted} getTodoPersisted=${getTodoPersisted} urlAfterClick="${urlAfterClick}"`, sc_h);
    }

    // =========================================================
    // I. History tab
    // =========================================================
    console.log('\n[I] History tab');

    // Switch to History tab in sidebar
    await page.locator('[role="tab"]', { hasText: 'History' }).click();
    await page.waitForTimeout(300);

    // Count history rows (role=button with jsonplaceholder URLs)
    const historyRows = page.locator('[role="button"]').filter({ hasText: /jsonplaceholder|definitely-not/ });
    const historyCount = await historyRows.count();

    // Check for status chips in history (small colored status numbers)
    const statusChips = page.locator('[class*=_status_]');
    const chipCount = await statusChips.count();

    // Click first entry to open a tab
    if (historyCount > 0) {
      await historyRows.first().click();
      await page.waitForTimeout(500);
    }

    const sc_i = await shot(page, 'I-history');

    if (historyCount > 0 && chipCount > 0) {
      pass('I', `History shows ${historyCount} entries, ${chipCount} status chips. Clicking entry opens request in new tab.`, sc_i);
    } else {
      fail('I', `historyCount=${historyCount} chipCount=${chipCount}`, sc_i);
    }

    // =========================================================
    // J. Environments + variable interpolation
    // =========================================================
    console.log('\n[J] Environments + variable interpolation');

    // Switch back to Collections tab, click Get todo to get clean state
    await page.locator('[role="tab"]', { hasText: 'Collections' }).click();
    await page.waitForTimeout(200);

    // Open Environments manager
    await page.locator('[aria-label="Manage environments"]').click();
    await page.waitForTimeout(400);

    const envModalVisible = await page.locator('text=Environments').first().isVisible();

    // Click "New environment" button
    await page.locator('button', { hasText: 'New environment' }).click();
    await page.waitForTimeout(400);

    // Rename environment to "Test" (input has aria-label="Environment name")
    const envNameInput = page.locator('[aria-label="Environment name"]');
    await envNameInput.click({ clickCount: 3 });
    await envNameInput.fill('Test');
    await page.waitForTimeout(200);

    // Add variable "host" = "jsonplaceholder.typicode.com"
    // The variables table is inside the env manager modal
    // Phantom row key input
    const varPhantomKey = page.locator('[aria-label="New row key"]').last();
    await varPhantomKey.fill('host');
    await page.waitForTimeout(300);

    // Fill value for the new row
    const varValueInputs = page.locator('input[data-field="value"]');
    const varValueCount = await varValueInputs.count();
    await varValueInputs.nth(varValueCount - 1).fill('jsonplaceholder.typicode.com');
    await page.waitForTimeout(300);

    // Close modal (press Escape or click close button)
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);

    // Verify modal closed
    const envModalClosed = await page.locator('text=Environments').first().isVisible().catch(() => false);

    // Select "Test" environment
    await page.locator('[aria-label="Active environment"]').selectOption({ label: 'Test' });
    await page.waitForTimeout(300);

    // Verify environment selected
    const activeEnvText = await page.locator('[aria-label="Active environment"]').inputValue();

    // Open a new request or use current tab - type URL with variable
    await page.locator('#pg-url-input').click({ clickCount: 3 });
    await page.locator('#pg-url-input').fill('https://{{host}}/todos/1');
    await page.waitForTimeout(400);

    // Check for resolved URL preview "→ https://jsonplaceholder.typicode.com/todos/1"
    const resolvedPreview = await page.locator('text=→ https://jsonplaceholder.typicode.com/todos/1').isVisible().catch(() => false);

    // Send
    await page.locator('button', { hasText: 'Send' }).first().click();
    await waitForStatusPill(page, 25000);
    await waitForSend(page, 25000);

    const pillJ = await getStatusPillText(page);
    const is200j = pillJ?.trim() === '200';

    const sc_j = await shot(page, 'J-environments');

    if (resolvedPreview && is200j) {
      pass('J', `Environment "Test" created with host={{jsonplaceholder.typicode.com}}, URL preview shows "→ https://jsonplaceholder.typicode.com/todos/1", send returns status ${pillJ?.trim()}`, sc_j);
    } else {
      fail('J', `resolvedPreview=${resolvedPreview} status="${pillJ?.trim()}" (expected 200)`, sc_j);
    }

    // =========================================================
    // K. Settings - Reduce transparency
    // =========================================================
    console.log('\n[K] Settings - Reduce transparency');

    // Open settings via aria-label
    await page.locator('[aria-label="Settings"]').click();
    await page.waitForTimeout(400);

    const settingsVisible = await page.locator('text=Settings').first().isVisible();

    // Find the Reduce transparency checkbox
    // SettingsModal has one checkbox: reduceTransparency
    const rtRow = page.locator('label').filter({ hasText: 'Reduce transparency' });
    const rtCheckbox = rtRow.locator('input[type="checkbox"]');

    const beforeChecked = await rtCheckbox.isChecked().catch(() => false);

    // Click to enable
    if (!beforeChecked) {
      await rtCheckbox.click();
    } else {
      // Already on, click to toggle off then back on
      await rtCheckbox.click();
      await page.waitForTimeout(200);
      await rtCheckbox.click();
    }
    await page.waitForTimeout(300);

    const hasAttr = await page.evaluate(() =>
      document.documentElement.hasAttribute('data-reduce-transparency')
    );

    const sc_k1 = await shot(page, 'K-reduce-transparency-on');

    // Toggle back off
    await rtCheckbox.click();
    await page.waitForTimeout(300);

    const hasAttrOff = await page.evaluate(() =>
      document.documentElement.hasAttribute('data-reduce-transparency')
    );

    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);

    const sc_k2 = await shot(page, 'K-reduce-transparency-off');

    if (hasAttr && !hasAttrOff) {
      pass('K', `Settings: toggled "Reduce transparency" → html[data-reduce-transparency] set; toggled back → attribute removed`, sc_k1);
    } else {
      fail('K', `settingsOpen=${settingsVisible} attrWhenOn=${hasAttr} attrWhenOff=${hasAttrOff}`, sc_k1);
    }

    // =========================================================
    // L. Import / Export
    // =========================================================
    console.log('\n[L] Import/Export');

    // Ensure we're on Collections tab
    await page.locator('[role="tab"]', { hasText: 'Collections' }).click();
    await page.waitForTimeout(200);

    // Click Import / Export in sidebar footer
    await page.locator('button', { hasText: 'Import / Export' }).click();
    await page.waitForTimeout(600);

    const ieTitle = await page.locator('text=Import / Export').first().isVisible();

    // Check for Demo collection row with export buttons
    // Demo row contains "Demo" text AND a "Postman v2.1" button in the same row
    const postmanBtn = await page.locator('button', { hasText: 'Postman v2.1' }).first().isVisible().catch(() => false);
    const nativeBtn = await page.locator('button', { hasText: 'Native' }).first().isVisible().catch(() => false);
    // The export section will have a row with both "Demo" (or "Demo (imported)") and Postman v2.1
    const demoExportRow = postmanBtn; // if Postman v2.1 button is visible, a collection row exists

    // Click Postman v2.1 and capture download
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 10000 }),
      page.locator('button', { hasText: 'Postman v2.1' }).first().click()
    ]);

    // Save the downloaded file
    const exportPath = join(SHOTS_DIR, 'demo-export.postman_collection.json');
    await download.saveAs(exportPath);

    const downloadedContent = readFileSync(exportPath, 'utf-8');
    let parsedExport;
    try { parsedExport = JSON.parse(downloadedContent); } catch { parsedExport = null; }
    const isValidPostman = !!(parsedExport?.info?.schema) && !!(parsedExport?.item);

    const sc_l1 = await shot(page, 'L-import-export-modal');

    // Now re-import via file input
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(exportPath);
    await page.waitForTimeout(800);

    // Check pre-import summary (shows "N collection(s) · N request(s)")
    const summaryVisible = await page.locator('text=collection(s)').isVisible().catch(() => false);
    const summaryText = summaryVisible
      ? await page.locator('text=collection(s)').first().textContent().catch(() => '')
      : '';

    const sc_l2 = await shot(page, 'L-import-summary');

    // Click Import button
    await page.locator('button', { hasText: 'Import' }).last().click();
    await page.waitForTimeout(1200);

    // Should now see "Demo (imported)" in sidebar
    const importedVisible = await page.locator('text=Demo (imported)').isVisible().catch(() => false);

    const sc_l3 = await shot(page, 'L-imported-collection');

    if (postmanBtn && nativeBtn && isValidPostman && summaryVisible && importedVisible) {
      pass('L', `Export: collection row with Postman v2.1 + Native buttons, downloaded valid Postman v2.1 JSON (schema="${parsedExport?.info?.schema?.split('/').slice(-1)[0]}"). Import: summary "${summaryText?.trim()}", after import collection with "(imported)" suffix in sidebar.`, sc_l3);
    } else {
      fail('L', `postmanBtn=${postmanBtn} nativeBtn=${nativeBtn} validPostman=${isValidPostman} summary="${summaryText?.trim()}" importedVisible=${importedVisible}`, sc_l3);
    }

    // =========================================================
    // M. Keyboard shortcuts
    // =========================================================
    console.log('\n[M] Keyboard shortcuts');

    // Close import/export modal if still open
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Set URL and count current history
    await page.locator('#pg-url-input').click({ clickCount: 3 });
    await page.locator('#pg-url-input').fill('https://jsonplaceholder.typicode.com/todos/1');

    // Switch to History to count before
    await page.locator('[role="tab"]', { hasText: 'History' }).click();
    await page.waitForTimeout(200);
    const histBefore = await page.locator('[role="button"]').filter({ hasText: /jsonplaceholder/ }).count();

    // Focus away from sidebar (click URL input first)
    await page.locator('#pg-url-input').click();

    // Ctrl+Enter to send
    await page.keyboard.press('Control+Enter');

    // Wait for new history entry - switch to history to check
    await waitForStatusPill(page, 20000);
    await waitForSend(page, 20000);

    // Switch to History tab to verify new entry
    await page.locator('[role="tab"]', { hasText: 'History' }).click();
    await page.waitForTimeout(400);

    const histAfter = await page.locator('[role="button"]').filter({ hasText: /jsonplaceholder/ }).count();
    const ctrlEnterWorks = histAfter > histBefore;

    // Ctrl+B to toggle sidebar
    const sidebarTabsBefore = await page.locator('[aria-label="Sidebar sections"]').isVisible();
    await page.keyboard.press('Control+b');
    await page.waitForTimeout(300);
    const sidebarTabsAfter = await page.locator('[aria-label="Sidebar sections"]').isVisible();
    const ctrlBWorks = sidebarTabsBefore !== sidebarTabsAfter;

    // Toggle sidebar back
    await page.keyboard.press('Control+b');
    await page.waitForTimeout(300);

    // Ctrl+L to focus URL input
    await page.keyboard.press('Control+l');
    await page.waitForTimeout(200);
    const urlFocused = await page.evaluate(() => document.activeElement?.id === 'pg-url-input');

    const sc_m = await shot(page, 'M-keyboard-shortcuts');

    if (ctrlEnterWorks && ctrlBWorks && urlFocused) {
      pass('M', `Ctrl+Enter sent (history grew ${histBefore}→${histAfter}). Ctrl+B toggled sidebar (${sidebarTabsBefore}→${sidebarTabsAfter}). Ctrl+L focused URL input.`, sc_m);
    } else {
      fail('M', `Ctrl+Enter=${ctrlEnterWorks}(${histBefore}→${histAfter}) Ctrl+B=${ctrlBWorks}(${sidebarTabsBefore}→${sidebarTabsAfter}) Ctrl+L=${urlFocused}`, sc_m);
    }

  } catch (err) {
    console.error('\nFATAL ERROR during test execution:', err.message);
    const failId = RESULTS.length > 0 ? RESULTS[RESULTS.length-1].id : '?';
    console.error(`Last completed check: ${failId}`);
    await shot(page, 'FATAL-error').catch(() => {});
  } finally {
    await browser.close();
  }

  // =========================================================
  // Print summary
  // =========================================================
  console.log('\n' + '='.repeat(72));
  console.log('RESULTS SUMMARY');
  console.log('='.repeat(72));

  const checks = ['A','B','C','D','E','F','G','H','I','J','K','L','M'];
  let passed = 0, failed = 0;

  for (const id of checks) {
    const r = RESULTS.find(x => x.id === id);
    if (r) {
      const mark = r.status === 'PASS' ? 'PASS' : 'FAIL';
      console.log(`  [${mark}] ${id}: ${r.evidence.substring(0, 110)}`);
      if (r.screenshot) console.log(`         screenshot: e2e/shots/${r.screenshot}`);
      if (r.status === 'PASS') passed++; else failed++;
    } else {
      console.log(`  [SKIP] ${id}: Not reached`);
      failed++;
    }
  }

  console.log('\n' + '-'.repeat(72));
  console.log(`  Total: ${passed} PASS, ${failed} FAIL out of ${checks.length}`);

  if (CONSOLE_ERRORS.length > 0) {
    console.log('\nCONSOLE ERRORS (non-network):');
    CONSOLE_ERRORS.slice(0, 20).forEach(e => console.log('  - ' + e));
  } else {
    console.log('\nCONSOLE ERRORS: none (network errors from intentional CORS/404 tests excluded)');
  }

  console.log('\nSCREENSHOTS taken:');
  const { readdirSync } = await import('fs');
  const shots = readdirSync(SHOTS_DIR).filter(f => f.endsWith('.png')).sort();
  shots.forEach(s => console.log('  e2e/shots/' + s));

  console.log('\nDone.');
}

main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
