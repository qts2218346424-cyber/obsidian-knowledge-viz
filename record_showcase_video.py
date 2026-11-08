# -*- coding: utf-8 -*-
"""
CoreForge 研核 · 自动化 OBS 录屏与宣传视频演示引擎
功能清单：
1. OBS WebSocket 同步自动控制 (连接/最小化OBS/StartRecord/StopRecord)
2. Playwright 1920x1080 原生浏览器真实可见拟人化操作
3. 10 大核心宣传分镜演示：
   - 01: 从零打开浏览器访问官网 LandingPage
   - 02: 考研四大科目矩阵交互
   - 03: 登录进入研学驾驶舱 Dashboard (健康度/学科舱联动)
   - 04: 双栏沉浸式 Markdown 笔记 (408考研库/公式/代码高亮)
   - 05: 3D/2D 知识图谱星空探索 (力导向/考点关联穿透)
   - 06: 做题中心 (考研真题精练/即时判分/名师解析)
   - 07: 考研政治专区 (全景时空轴/肖秀荣1000题)
   - 08: 考研英语专区 (高分写作模板/AI智能批改)
   - 09: 知识库整理工作流画布
   - 10: 回归主驾驶舱全景定格收官
4. 精确毫秒级时间戳记录与字幕分镜生成
"""

import os
import sys
import time
import math
import json
import ctypes
import websocket
from datetime import datetime
from playwright.sync_api import sync_playwright

# 兼容 Windows 控制台输出编码
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

ADMIN_TOKEN = "3d8fc6e053b2b791a4a2b13aed00435bc6fafe7d39c9935ec4b27f76c90fe910"
OBS_WS_URI = "ws://127.0.0.1:4455"
BASE_URL = "http://127.0.0.1:3001"
OUTPUT_DIR = r"C:\Users\QTS的天选\Videos"

timeline = []

def minimize_obs_window():
    """最小化桌面上的 OBS 窗口，防止遮挡录屏画面"""
    user32 = ctypes.windll.user32
    def enum_proc(hwnd, lParam):
        if user32.IsWindowVisible(hwnd):
            length = user32.GetWindowTextLengthW(hwnd)
            if length > 0:
                buff = ctypes.create_unicode_buffer(length + 1)
                user32.GetWindowTextW(hwnd, buff, length + 1)
                title = buff.value
                if "OBS" in title and "Studio" in title:
                    user32.ShowWindow(hwnd, 6) # SW_MINIMIZE
                    print(f"   [窗口管理] 已将 OBS 窗口最小化: {title}")
        return True
    
    WNDENUMPROC = ctypes.WINFUNCTYPE(ctypes.c_bool, ctypes.c_void_p, ctypes.c_void_p)
    user32.EnumWindows(WNDENUMPROC(enum_proc), 0)

def log_scene(title, desc="", voiceover=""):
    now = time.time()
    elapsed = now - log_scene.start_time if hasattr(log_scene, 'start_time') else 0.0
    m, s = divmod(int(elapsed), 60)
    time_str = f"{m:02d}:{s:02d}"
    print(f"\n[分镜镜头 {time_str}] === {title} ===")
    if desc:
        print(f"   [画面动作] {desc}")
    if voiceover:
        print(f"   [建议解说] {voiceover}")
    timeline.append({
        "time_str": time_str,
        "seconds": round(elapsed, 1),
        "title": title,
        "desc": desc,
        "voiceover": voiceover
    })

def smooth_move(page, start_x, start_y, end_x, end_y, steps=25, duration=0.6):
    """三次方贝塞尔缓动拟人化鼠标移动"""
    dt = duration / steps
    for i in range(steps + 1):
        t = i / steps
        ease = 4 * t * t * t if t < 0.5 else 1 - math.pow(-2 * t + 2, 3) / 2
        cur_x = start_x + (end_x - start_x) * ease
        cur_y = start_y + (end_y - start_y) * ease
        page.mouse.move(cur_x, cur_y)
        time.sleep(dt)

def smooth_scroll(page, delta_y, steps=20, duration=0.7):
    """平滑缓动滚屏"""
    dt = duration / steps
    for i in range(steps):
        t = (i + 1) / steps
        step_delta = delta_y * math.sin(t * math.pi / 2) / (steps / 2)
        page.mouse.wheel(0, step_delta)
        time.sleep(dt)

class OBSControllerSync:
    def __init__(self, uri=OBS_WS_URI):
        self.uri = uri
        self.ws = None

    def connect(self):
        self.ws = websocket.create_connection(self.uri, timeout=8)
        self.ws.recv() # Hello
        self.ws.send(json.dumps({"op": 1, "d": {"rpcVersion": 1}}))
        self.ws.recv() # Identified
        print(" [OBS 控制器] 已成功连接到 OBS WebSocket 服务！")

    def start_record(self):
        req = {"op": 6, "d": {"requestType": "StartRecord", "requestId": "req_start"}}
        self.ws.send(json.dumps(req))
        res = json.loads(self.ws.recv())
        print(" [OBS 控制器] 已触发开始录制:", res.get("d", {}).get("requestStatus"))

    def stop_record(self):
        req = {"op": 6, "d": {"requestType": "StopRecord", "requestId": "req_stop"}}
        self.ws.send(json.dumps(req))
        try:
            res = json.loads(self.ws.recv())
            print(" [OBS 控制器] 已触发停止录制:", res.get("d", {}).get("requestStatus"))
            if "responseData" in res.get("d", {}):
                output_path = res["d"]["responseData"].get("outputPath")
                if output_path:
                    print(" [OBS 控制器] 视频保存路径:", output_path)
        except Exception as e:
            print(" [OBS 控制器] 停止事件响应:", e)

    def close(self):
        if self.ws:
            try:
                self.ws.close()
            except Exception:
                pass

def run_automation():
    print("==================================================")
    print(" 启动 CoreForge 研核 自动化录屏演示流程")
    print("==================================================")

    # 1. 最小化 OBS 窗口
    minimize_obs_window()

    # 2. 连接 OBS WebSocket
    obs = OBSControllerSync()
    try:
        obs.connect()
    except Exception as e:
        print(f" [错误] 无法连接 OBS WebSocket: {e}")
        return

    # 3. 启动 Playwright 可见浏览器
    with sync_playwright() as p:
        print(" [浏览器] 正在启动真实 Chrome 浏览器 (1920x1080 全屏)...")
        browser = p.chromium.launch(
            headless=False,
            args=[
                "--start-maximized",
                "--disable-infobars",
                "--no-default-browser-check",
            ]
        )
        context = browser.new_context(
            no_viewport=True,
            locale="zh-CN"
        )
        page = context.new_page()

        try:
            # 打开初始空白页
            page.goto("about:blank")
            time.sleep(1.5)

            # 4. 触发 OBS 开始录屏！
            print(" [录制] 触发 OBS 开始录屏...")
            obs.start_record()
            time.sleep(1.0)
            log_scene.start_time = time.time()

            # ========================================================
            # 幕 1：从零在浏览器输入并打开官网 LandingPage (00:00 ~ 00:16)
            # ========================================================
            log_scene(
                title="从零打开官网首页",
                desc="浏览器从空白标签页进入 CoreForge 研核官网，展示极具现代感的暗黑科技主视觉",
                voiceover="欢迎来到 CoreForge 研核——专为 408 与考研数学打造的智能双核研学工作台。"
            )
            page.goto(f"{BASE_URL}/")
            page.wait_for_load_state("domcontentloaded")
            time.sleep(2.5)

            # 鼠标平滑移动展示四大学科胶囊
            for btn in page.locator("button").all():
                txt = btn.text_content() or ""
                if "考研政治" in txt:
                    box = btn.bounding_box()
                    if box:
                        smooth_move(page, 960, 480, box['x'] + box['width']/2, box['y'] + box['height']/2, steps=25)
                        time.sleep(0.4)
                        btn.click()
                        time.sleep(1.5)
                    break

            for btn in page.locator("button").all():
                txt = btn.text_content() or ""
                if "考研英语" in txt:
                    box = btn.bounding_box()
                    if box:
                        smooth_move(page, box['x'], box['y'], box['x'] + box['width']/2, box['y'] + box['height']/2, steps=20)
                        time.sleep(0.4)
                        btn.click()
                        time.sleep(1.5)
                    break

            # ========================================================
            # 幕 2：四大考研学科矩阵卡片展示 (00:16 ~ 00:30)
            # ========================================================
            log_scene(
                title="四大考研学科矩阵卡片",
                desc="平滑下滚查看政治、英语、数学、408 核心特色卡片与全科备考方案",
                voiceover="平台全面涵盖 408 统考、考研数学、考研英语与考研政治，打通知识整理、智能做题与 AI 伴学全链路。"
            )
            subjects_sec = page.locator("#subjects")
            if subjects_sec.count() > 0:
                subjects_sec.scroll_into_view_if_needed()
            else:
                smooth_scroll(page, 500, steps=25, duration=0.8)
            time.sleep(3.0)

            # ========================================================
            # 幕 3：进入研学驾驶舱 Dashboard (00:30 ~ 00:52)
            # ========================================================
            log_scene(
                title="研学主驾驶舱 Dashboard",
                desc="登录进入控制台，全景掌握知识库健康度、掌握度卡片、每日学习进度与学科舱联动",
                voiceover="进入主驾驶舱，知识库健康度、每日掌握度、待办复习进度一目了然，支持快速切换各科目研学舱。"
            )
            page.goto(f"{BASE_URL}/login")
            page.evaluate(f"""() => {{
                localStorage.setItem('coreforge_auth_token', '{ADMIN_TOKEN}');
                localStorage.setItem('coreforge_onboarding_dismissed', 'true');
                localStorage.setItem('coreforge_tour_skipped', 'true');
                localStorage.setItem('coreforge_user_guide_seen', 'true');
            }}""")
            page.goto(f"{BASE_URL}/dashboard")
            page.wait_for_load_state("domcontentloaded")
            time.sleep(2.5)

            # 鼠标巡视数据看板
            smooth_move(page, 300, 220, 650, 240, steps=30, duration=0.8)
            time.sleep(1.2)

            # 点击切换政治舱
            for btn in page.locator("button").all():
                txt = btn.text_content() or ""
                if "考研政治" in txt:
                    box = btn.bounding_box()
                    if box:
                        smooth_move(page, 650, 240, box['x'] + box['width']/2, box['y'] + box['height']/2, steps=25)
                        time.sleep(0.3)
                        btn.click()
                        time.sleep(2.0)
                    break

            # 点击切换英语舱
            for btn in page.locator("button").all():
                txt = btn.text_content() or ""
                if "考研英语" in txt:
                    box = btn.bounding_box()
                    if box:
                        smooth_move(page, box['x'], box['y'], box['x'] + box['width']/2, box['y'] + box['height']/2, steps=20)
                        time.sleep(0.3)
                        btn.click()
                        time.sleep(2.0)
                    break

            # 平滑向下滚动查看今日任务与卡片
            smooth_scroll(page, 320, steps=20, duration=0.7)
            time.sleep(2.0)
            smooth_scroll(page, -320, steps=20, duration=0.7)
            time.sleep(1.2)

            # ========================================================
            # 幕 4：双栏沉浸式 Markdown 笔记与考研资料库 (00:52 ~ 01:14)
            # ========================================================
            log_scene(
                title="双栏沉浸式考研笔记编辑",
                desc="展示 KaTeX 数学公式、语法高亮代码块、结构大纲树与多栏沉浸排版",
                voiceover="内置强大的 Markdown 编辑器，实时渲染 KaTeX 高等数学公式、代码高亮与考点大纲，带来专注的沉浸学习质感。"
            )
            page.goto(f"{BASE_URL}/editor")
            page.wait_for_load_state("domcontentloaded")
            time.sleep(2.5)

            # 尝试打开一篇重点笔记
            for item in page.locator("div, span, button").all():
                txt = item.text_content() or ""
                if "完全使用手册" in txt or "知识库总索引" in txt or "408" in txt:
                    box = item.bounding_box()
                    if box and box['y'] > 100:
                        smooth_move(page, 200, 300, box['x'] + box['width']/2, box['y'] + box['height']/2, steps=25)
                        time.sleep(0.4)
                        item.click()
                        time.sleep(1.5)
                        break

            # 鼠标在内容区平滑滚动浏览
            smooth_move(page, 250, 400, 850, 450, steps=25, duration=0.7)
            time.sleep(1.0)
            smooth_scroll(page, 350, steps=25, duration=0.8)
            time.sleep(2.0)
            smooth_scroll(page, -350, steps=25, duration=0.8)
            time.sleep(1.2)

            # ========================================================
            # 幕 5：3D/2D 知识图谱立体脉络探索 (01:14 ~ 01:36)
            # ========================================================
            log_scene(
                title="3D 知识图谱立体脉络网络",
                desc="力导向星空拓扑展开、考点动态关联、节点拖拽与双向链笔记穿透",
                voiceover="知识图谱将碎片化考点连接成一张立体的知识星图，力导向聚类与双链穿透，助你建立体系化的认知网络。"
            )
            page.goto(f"{BASE_URL}/graph")
            page.wait_for_load_state("domcontentloaded")
            time.sleep(3.0)

            # 鼠标在图谱中央交互拖拽
            center_x, center_y = 960, 540
            smooth_move(page, 750, 400, center_x, center_y, steps=25, duration=0.6)
            time.sleep(0.5)
            page.mouse.down()
            smooth_move(page, center_x, center_y, center_x + 100, center_y - 50, steps=25, duration=0.8)
            page.mouse.up()
            time.sleep(2.5)

            # ========================================================
            # 幕 6：考研做题中心与名师解析 (01:36 ~ 01:58)
            # ========================================================
            log_scene(
                title="做题中心与考研真题深度解析",
                desc="真题精练、选项交互、即时判分反馈与错题归纳本",
                voiceover="做题中心汇聚 408 与公共课真题，支持即时判题与考点深度剖析，错题自动沉淀复习，让刷题更高效。"
            )
            page.goto(f"{BASE_URL}/quiz")
            page.wait_for_load_state("domcontentloaded")
            time.sleep(2.5)

            # 模拟点击一道题目的选项
            options = page.locator("button, div[role='button']").all()
            clicked = False
            for opt in options:
                txt = opt.text_content() or ""
                if any(k in txt for k in ["A.", "B.", "C.", "D.", "A ", "B "]):
                    box = opt.bounding_box()
                    if box and box['y'] > 200:
                        smooth_move(page, 960, 400, box['x'] + box['width']/2, box['y'] + box['height']/2, steps=25)
                        time.sleep(0.4)
                        opt.click()
                        clicked = True
                        time.sleep(2.0)
                        break
            if not clicked:
                time.sleep(2.0)

            smooth_scroll(page, 280, steps=20, duration=0.7)
            time.sleep(2.5)

            # ========================================================
            # 幕 7：考研政治全景时空轴专区 (01:58 ~ 02:14)
            # ========================================================
            log_scene(
                title="考研政治专区与史纲时空轴",
                desc="全景时空轴串联近代史大事记、肖秀荣 1000 题与高频考点速查",
                voiceover="政治专区配备全屏时空轴与肖秀荣 1000 题专项突破，历史脉络与考点纵览清晰无遗漏。"
            )
            page.goto(f"{BASE_URL}/politics")
            page.wait_for_load_state("domcontentloaded")
            time.sleep(2.5)
            smooth_move(page, 500, 320, 1050, 420, steps=30, duration=0.8)
            time.sleep(1.5)
            smooth_scroll(page, 320, steps=20, duration=0.7)
            time.sleep(2.0)

            # ========================================================
            # 幕 8：考研英语高分写作与 AI 批改 (02:14 ~ 02:30)
            # ========================================================
            log_scene(
                title="考研英语写作批改与大纲词库",
                desc="真题精读、高分写作模板、AI 智能语法批改与大纲核心词汇学习",
                voiceover="英语专区涵盖高分作文模板与 AI 语法批改，配合历年真题精读与大纲词库，全方位攻破英语难关。"
            )
            page.goto(f"{BASE_URL}/english")
            page.wait_for_load_state("domcontentloaded")
            time.sleep(2.5)
            smooth_move(page, 450, 300, 950, 360, steps=30, duration=0.8)
            time.sleep(1.5)
            smooth_scroll(page, 300, steps=20, duration=0.7)
            time.sleep(2.0)

            # ========================================================
            # 幕 9：知识库治理与工作流画布 (02:30 ~ 02:44)
            # ========================================================
            log_scene(
                title="知识库整理与工作流画布",
                desc="可视化节点治理、断链自动检测修复、孤立卡片治理与知识体系重构",
                voiceover="工作流画布提供可视化知识库体检与整理能力，自动化修复断链与孤立笔记，让知识库持久保持生机。"
            )
            page.goto(f"{BASE_URL}/workflow")
            page.wait_for_load_state("domcontentloaded")
            time.sleep(2.5)
            smooth_move(page, 480, 420, 850, 460, steps=25, duration=0.8)
            time.sleep(2.0)

            # ========================================================
            # 幕 10：华丽定格收官 (02:44 ~ 02:54)
            # ========================================================
            log_scene(
                title="回归驾驶舱与华丽收官",
                desc="平滑切换回主驾驶舱，鼠标平稳移至下方中央，全屏定格呈现专业考研科技品牌形象",
                voiceover="CoreForge 研核，用科技重塑考研研学，助你一战成硕！"
            )
            page.goto(f"{BASE_URL}/dashboard")
            page.wait_for_load_state("domcontentloaded")
            time.sleep(1.5)
            smooth_move(page, 960, 400, 960, 800, steps=30, duration=1.0)
            time.sleep(4.0)

        finally:
            # 5. 确保在任何情况下停止 OBS 录屏与释放资源
            print("\n [完成] 演示结束，向 OBS 发送停止录制命令...")
            try:
                obs.stop_record()
            except Exception as e:
                print(" [停止提示]", e)
            time.sleep(2.5)
            obs.close()

            try:
                browser.close()
                print(" [浏览器] 浏览器已安全关闭！")
            except Exception:
                pass

    # 6. 查找最新生成的录屏文件
    print("\n==================================================")
    print(" 检查生成的录屏视频文件:")
    files = [os.path.join(OUTPUT_DIR, f) for f in os.listdir(OUTPUT_DIR) if f.endswith(".mp4")]
    files.sort(key=lambda x: os.path.getmtime(x), reverse=True)
    if files:
        latest = files[0]
        size_mb = os.path.getsize(latest) / (1024 * 1024)
        mtime = datetime.fromtimestamp(os.path.getmtime(latest)).strftime("%Y-%m-%d %H:%M:%S")
        print(f" 最新录屏文件已生成: {latest}")
        print(f" 文件大小: {size_mb:.2f} MB")
        print(f" 录制时间: {mtime}")
        try:
            import cv2
            cap = cv2.VideoCapture(latest)
            ret, frame = cap.read()
            if ret:
                mean_val = frame.mean()
                print(f" [画质校验] 第一帧像素均值: {mean_val:.2f} (画面状态: {'正常彩色画面' if mean_val > 5.0 else '异常纯黑屏'})")
            cap.release()
        except Exception as e:
            print(" [画质校验提示]", e)
    print("==================================================")

    # 7. 保存分镜台本 JSON
    script_meta_path = os.path.join(os.path.dirname(__file__), "showcase_timeline.json")
    with open(script_meta_path, "w", encoding="utf-8") as f:
        json.dump(timeline, f, indent=2, ensure_ascii=False)
    print(f" 分镜台本数据已导出至: {script_meta_path}")

if __name__ == "__main__":
    run_automation()
