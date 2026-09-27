"""Standalone laboratory: controls, isolation, legal return and device sizes."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
root=Path(__file__).resolve().parent
url=os.environ.get('LAB_URL',(root/'labor.html').as_uri())
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe',headless=True)
    for width,height in [(1366,900),(820,1180),(390,844)]:
        page=browser.new_page(viewport={'width':width,'height':height})
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto(url,wait_until='networkidle')
        expect(page.locator('#lab')).to_be_visible()
        assert page.locator('[data-panel],#wheel,#compare,#problem,#rule').count()==0
        assert page.locator('.logo').evaluate('(i)=>i.complete && i.naturalWidth>0')
        expect(page.locator('#lab-chart .sample')).to_have_count(9)
        for rate,count in [('400',4),('250',3),('500',5),('1000',9)]:
            page.locator('[data-rate="'+rate+'"]').click()
            expect(page.locator('#lab-chart .sample')).to_have_count(count)
            if rate=='400':
                expect(page.locator('#alias-status')).to_contain_text('150 Hz')
                expect(page.locator('#lab-chart .alias')).to_have_count(1)
        page.locator('[data-rate="500"]').click()
        page.locator('#offset').select_option('1')
        expect(page.locator('#lab-chart .sample')).to_have_count(4)
        page.locator('#frequency').fill('600')
        expect(page.locator('#frequency-output')).to_have_text('600 Hz')
        page.locator('#lab-original').uncheck()
        expect(page.locator('#lab-chart .signal')).to_have_count(0)
        page.locator('#show-alias').uncheck()
        expect(page.locator('#lab-chart .alias')).to_have_count(0)
        page.locator('#lab-reset').click()
        expect(page.locator('#rate')).to_have_value('1000')
        expect(page.locator('#window')).to_have_value('8')
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
        page.screenshot(path=str(root/'tmp'/f'labor-{width}.png'),full_page=True)
        page.get_by_role('link',name='Impressum / Rechtliches').click()
        page.get_by_role('link',name='Zurück zum Aliasinglabor').click()
        expect(page.locator('#lab')).to_be_visible()
        assert not errors,errors
        page.close()
    browser.close()
print('Standalone lab passed: desktop, tablet, phone; controls, isolation, legal return.')
