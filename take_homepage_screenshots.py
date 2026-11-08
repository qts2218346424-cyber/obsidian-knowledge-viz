# -*- coding: utf-8 -*-
import os
import time
from playwright.sync_api import sync_playwright

ARTIFACT_DIR = r"C:\Users\QTS的天选\.gemini\antigravity\brain\8ec219dc-2af1-4dc4-8f06-56b00d9b7ba2"
ADMIN_TOKEN = "3d8fc6e053b2b791a4a2b13aed00435bc6fafe7d39c9935ec4b27f76c90fe910"

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 960})
        page = context.new_page()

        # 1. 官网首页 LandingPage
        page.goto("http://localhost:5173/")
        time.sleep(1.0)

        # 点击切换到“考研政治”
        for btn in page.locator("button").all():
            txt = btn.text_content() or ""
            if "考研政治" in txt:
                btn.click()
                break
        time.sleep(0.8)
        p1 = os.path.join(ARTIFACT_DIR, "landing_politics_pill.png")
        page.screenshot(path=p1)
        print("1. Saved landing_politics_pill.png")

        # 点击切换到“考研英语”
        for btn in page.locator("button").all():
            txt = btn.text_content() or ""
            if "考研英语" in txt:
                btn.click()
                break
        time.sleep(0.8)
        p2 = os.path.join(ARTIFACT_DIR, "landing_english_pill.png")
        page.screenshot(path=p2)
        print("2. Saved landing_english_pill.png")

        # 滚动查看 #subjects 四大科目卡片
        subjects_sec = page.locator("#subjects")
        if subjects_sec.count() > 0:
            subjects_sec.scroll_into_view_if_needed()
            time.sleep(0.8)
            p3 = os.path.join(ARTIFACT_DIR, "landing_four_subjects.png")
            page.screenshot(path=p3)
            print("3. Saved landing_four_subjects.png")

        # 2. 登录工作台首页 Dashboard
        page.goto("http://localhost:5173/login")
        page.evaluate(f"""() => {{
            localStorage.setItem('coreforge_auth_token', '{ADMIN_TOKEN}');
            localStorage.setItem('coreforge_onboarding_dismissed', 'true');
            localStorage.setItem('coreforge_tour_skipped', 'true');
            localStorage.setItem('coreforge_user_guide_seen', 'true');
        }}""")
        page.goto("http://localhost:5173/dashboard")
        time.sleep(1.5)

        # 切换到考研政治舱
        for btn in page.locator("button").all():
            txt = btn.text_content() or ""
            if "考研政治" in txt:
                btn.click()
                break
        time.sleep(0.8)
        p4 = os.path.join(ARTIFACT_DIR, "dashboard_politics_hero.png")
        page.screenshot(path=p4)
        print("4. Saved dashboard_politics_hero.png")

        # 切换到考研英语舱
        for btn in page.locator("button").all():
            txt = btn.text_content() or ""
            if "考研英语" in txt:
                btn.click()
                break
        time.sleep(0.8)
        p5 = os.path.join(ARTIFACT_DIR, "dashboard_english_hero.png")
        page.screenshot(path=p5)
        print("5. Saved dashboard_english_hero.png")

        browser.close()
        print("Done capturing homepage updates!")

if __name__ == "__main__":
    main()
