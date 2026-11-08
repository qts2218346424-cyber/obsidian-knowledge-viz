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

        # 访问云端登录页
        cloud_url = "http://113.45.136.45"
        try:
            page.goto(f"{cloud_url}/login", timeout=15000)
            time.sleep(1.0)
            p_login = os.path.join(ARTIFACT_DIR, "cloud_live_login_verified.png")
            page.screenshot(path=p_login)
            print("1. Cloud login verified saved, size:", os.path.getsize(p_login))

            # 注入鉴权
            page.evaluate(f"""() => {{
                localStorage.setItem('coreforge_auth_token', '{ADMIN_TOKEN}');
                localStorage.setItem('coreforge_onboarding_dismissed', 'true');
                localStorage.setItem('coreforge_tour_skipped', 'true');
                localStorage.setItem('coreforge_user_guide_seen', 'true');
            }}""")

            # 访问云端英语页
            page.goto(f"{cloud_url}/english", timeout=15000)
            time.sleep(1.5)
            p_eng = os.path.join(ARTIFACT_DIR, "cloud_live_english_verified.png")
            page.screenshot(path=p_eng)
            print("2. Cloud english verified saved, size:", os.path.getsize(p_eng))

            # 访问云端政治页
            page.goto(f"{cloud_url}/politics", timeout=15000)
            time.sleep(1.5)
            p_pol = os.path.join(ARTIFACT_DIR, "cloud_live_politics_verified.png")
            page.screenshot(path=p_pol)
            print("3. Cloud politics verified saved, size:", os.path.getsize(p_pol))

        except Exception as e:
            print("Cloud verify warning:", e)
        finally:
            browser.close()

if __name__ == "__main__":
    main()
