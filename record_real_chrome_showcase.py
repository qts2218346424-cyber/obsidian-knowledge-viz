# -*- coding: utf-8 -*-
"""
CoreForge 研核 · 真实前台 Chrome OBS 宣传录屏引擎
完全基于当前桌面上真实可见、最大化的 Google Chrome 前台窗口：
1. OBS 开始录屏
2. 新建标签页/高亮地址栏 -> 打字机效果逐字键入 http://127.0.0.1:3001 -> 回车进入
3. 鼠标沿真实贝塞尔曲线在屏幕上平滑滑动，点击学科胶囊 (政治/英语/数学/408)
4. 平滑滚屏展示 408 核心真题与实景联动
5. 点击进入完整工作台 Dashboard，展示各学科研学舱
6. 逐一巡视：做题中心、考研政治时空轴、英语批改、知识图谱、Markdown 双栏笔记、工作流画布
7. 回到首页定格，OBS 停止录屏并落盘验证！
"""

import os
import sys
import time
import math
import json
import ctypes
import websocket
from datetime import datetime

# 兼容控制台编码
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

user32 = ctypes.windll.user32
OBS_WS_URI = "ws://127.0.0.1:4455"
OUTPUT_DIR = r"C:\Users\QTS的天选\Videos"
timeline = []

# Windows API 常量
MOUSEEVENTF_LEFTDOWN = 0x0002
MOUSEEVENTF_LEFTUP = 0x0004
MOUSEEVENTF_WHEEL = 0x0800
KEYEVENTF_KEYUP = 0x0002
VK_RETURN = 0x0D
VK_CONTROL = 0x11
VK_L = 0x4C
VK_T = 0x54

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

def smooth_move(start_x, start_y, end_x, end_y, steps=25, duration=0.5):
    """三次方贝塞尔缓动物理光标平滑移动"""
    dt = duration / steps
    for i in range(steps + 1):
        t = i / steps
        ease = 4 * t * t * t if t < 0.5 else 1 - math.pow(-2 * t + 2, 3) / 2
        cur_x = int(start_x + (end_x - start_x) * ease)
        cur_y = int(start_y + (end_y - start_y) * ease)
        user32.SetCursorPos(cur_x, cur_y)
        time.sleep(dt)

def real_click(x, y):
    """物理点击指定坐标"""
    user32.SetCursorPos(int(x), int(y))
    time.sleep(0.05)
    user32.mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
    time.sleep(0.08)
    user32.mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)
    time.sleep(0.2)

def real_scroll(delta_wheel, steps=15, duration=0.6):
    """平滑滚轮滚屏 (delta_wheel 负数向下，正数向上)"""
    dt = duration / steps
    step_wheel = int(delta_wheel / steps)
    for _ in range(steps):
        user32.mouse_event(MOUSEEVENTF_WHEEL, 0, 0, step_wheel, 0)
        time.sleep(dt)

def press_shortcut(vk1, vk2):
    """模拟两键快捷键 (如 Ctrl + L)"""
    user32.keybd_event(vk1, 0, 0, 0)
    time.sleep(0.05)
    user32.keybd_event(vk2, 0, 0, 0)
    time.sleep(0.05)
    user32.keybd_event(vk2, 0, KEYEVENTF_KEYUP, 0)
    user32.keybd_event(vk1, 0, KEYEVENTF_KEYUP, 0)
    time.sleep(0.2)

def type_string(text, delay=0.08):
    """打字机效果输入字符串"""
    for char in text:
        # 使用 SendInput 注入 Unicode 字符，避免输入法中英文状态干扰
        class KEYBDINPUT(ctypes.Structure):
            _fields_ = [
                ("wVk", ctypes.c_ushort),
                ("wScan", ctypes.c_ushort),
                ("dwFlags", ctypes.c_ulong),
                ("time", ctypes.c_ulong),
                ("dwExtraInfo", ctypes.POINTER(ctypes.c_ulong)),
            ]
        class INPUT(ctypes.Structure):
            _fields_ = [("type", ctypes.c_ulong), ("ki", KEYBDINPUT), ("padding", ctypes.c_ubyte * 8)]
        
        KEYEVENTF_UNICODE = 0x0004
        # Key down
        inp_down = INPUT()
        inp_down.type = 1 # INPUT_KEYBOARD
        inp_down.ki.wScan = ord(char)
        inp_down.ki.dwFlags = KEYEVENTF_UNICODE
        user32.SendInput(1, ctypes.byref(inp_down), ctypes.sizeof(INPUT))
        time.sleep(0.02)
        # Key up
        inp_up = INPUT()
        inp_up.type = 1
        inp_up.ki.wScan = ord(char)
        inp_up.ki.dwFlags = KEYEVENTF_UNICODE | KEYEVENTF_KEYUP
        user32.SendInput(1, ctypes.byref(inp_up), ctypes.sizeof(INPUT))
        time.sleep(delay)

def press_enter():
    user32.keybd_event(VK_RETURN, 0, 0, 0)
    time.sleep(0.05)
    user32.keybd_event(VK_RETURN, 0, KEYEVENTF_KEYUP, 0)
    time.sleep(0.3)

def activate_chrome():
    """查找并强制置顶 Chrome 窗口"""
    def enum_proc(hwnd, lParam):
        if user32.IsWindowVisible(hwnd):
            length = user32.GetWindowTextLengthW(hwnd)
            if length > 0:
                buff = ctypes.create_unicode_buffer(length + 1)
                user32.GetWindowTextW(hwnd, buff, length + 1)
                title = buff.value
                if "Chrome" in title:
                    user32.ShowWindow(hwnd, 3) # SW_MAXIMIZE
                    user32.BringWindowToTop(hwnd)
                    user32.SetForegroundWindow(hwnd)
                    print(f"   [前台激活] 已将 Chrome 置于桌面顶层: {title}")
        return True
    WNDENUMPROC = ctypes.WINFUNCTYPE(ctypes.c_bool, ctypes.c_void_p, ctypes.c_void_p)
    user32.EnumWindows(WNDENUMPROC(enum_proc), 0)

class OBSControllerSync:
    def __init__(self, uri=OBS_WS_URI):
        self.uri = uri
        self.ws = None

    def connect(self):
        self.ws = websocket.create_connection(self.uri, timeout=8)
        self.ws.recv() # Hello
        self.ws.send(json.dumps({"op": 1, "d": {"rpcVersion": 1}}))
        self.ws.recv() # Identified
        print(" [OBS] WebSocket 连接成功！")

    def start_record(self):
        req = {"op": 6, "d": {"requestType": "StartRecord", "requestId": "req_start"}}
        self.ws.send(json.dumps(req))
        res = json.loads(self.ws.recv())
        print(" [OBS] 开始录制:", res.get("d", {}).get("requestStatus"))

    def stop_record(self):
        req = {"op": 6, "d": {"requestType": "StopRecord", "requestId": "req_stop"}}
        self.ws.send(json.dumps(req))
        try:
            res = json.loads(self.ws.recv())
            print(" [OBS] 停止录制:", res.get("d", {}).get("requestStatus"))
        except Exception as e:
            print(" [OBS] 停止响应:", e)

    def close(self):
        if self.ws:
            try:
                self.ws.close()
            except Exception:
                pass

def main():
    print("==================================================")
    print(" 启动 CoreForge 研核 真实前台 Chrome 自动化录屏流程")
    print("==================================================")

    # 1. 连接 OBS
    obs = OBSControllerSync()
    try:
        obs.connect()
    except Exception as e:
        print(f" [错误] 无法连接 OBS WebSocket: {e}")
        return

    # 2. 激活并置顶前台 Chrome
    activate_chrome()
    time.sleep(1.0)

    try:
        # 3. OBS 开始录屏！
        print(" [录制] 触发 OBS 开始录屏...")
        obs.start_record()
        time.sleep(1.2)
        log_scene.start_time = time.time()

        # ========================================================
        # 幕 1：在浏览器搜索栏输入网址并回车进入官网 (00:00 ~ 00:15)
        # ========================================================
        log_scene(
            title="浏览器地址栏输入与搜索进入",
            desc="鼠标滑向 Chrome 地址栏，打字机输入 http://127.0.0.1:3001 并回车进入 CoreForge 研核官网",
            voiceover="欢迎来到 CoreForge 研核——专为 408 与考研数学打造的智能双核研学工作台。"
        )
        # 光标从屏幕中央平滑移向 Chrome 地址栏
        smooth_move(960, 540, 500, 82, steps=30, duration=0.6)
        real_click(500, 82)
        time.sleep(0.3)
        # 全选地址栏并输入网址
        press_shortcut(VK_CONTROL, VK_L)
        time.sleep(0.2)
        type_string("http://127.0.0.1:3001", delay=0.06)
        time.sleep(0.5)
        press_enter()
        time.sleep(3.0) # 等待网页刷出

        # ========================================================
        # 幕 2：四大学科胶囊交互切换 (00:15 ~ 00:30)
        # ========================================================
        log_scene(
            title="四大考研学科矩阵切换",
            desc="鼠标依次点击切换 408、数学、政治、英语胶囊，展示多学科考研研学方案",
            voiceover="平台全面涵盖 408 统考、考研数学、考研英语与考研政治，打通知识整理、智能做题与 AI 伴学全链路。"
        )
        # 点击考研政治 (962, 284)
        smooth_move(500, 82, 962, 284, steps=25, duration=0.5)
        real_click(962, 284)
        time.sleep(1.8)

        # 点击考研英语 (1069, 284)
        smooth_move(962, 284, 1069, 284, steps=20, duration=0.4)
        real_click(1069, 284)
        time.sleep(1.8)

        # 点击考研数学 (851, 284)
        smooth_move(1069, 284, 851, 284, steps=20, duration=0.4)
        real_click(851, 284)
        time.sleep(1.8)

        # 点击 408 计算机 (730, 284)
        smooth_move(851, 284, 730, 284, steps=20, duration=0.4)
        real_click(730, 284)
        time.sleep(1.8)

        # ========================================================
        # 幕 3：下滚查看 408 核心真题与实景联动 (00:30 ~ 00:45)
        # ========================================================
        log_scene(
            title="408 核心真题与考点实景联动",
            desc="平滑滚屏展示二叉平衡树 AVL 旋转、PV 原语、Cache 组相连映射与真题即时批改实景",
            voiceover="支持 AVL 树、PV 原语、Cache 映射等 408 高频难点题型即时交互作答与错因归因。"
        )
        # 鼠标移至内容区平滑滚屏
        smooth_move(730, 284, 960, 550, steps=20, duration=0.4)
        real_scroll(-600, steps=25, duration=0.9)
        time.sleep(2.5)

        # 鼠标在真题交互区悬停巡视
        smooth_move(960, 550, 750, 620, steps=25, duration=0.6)
        time.sleep(1.5)
        smooth_move(750, 620, 1150, 620, steps=25, duration=0.6)
        time.sleep(1.8)

        # ========================================================
        # 幕 4：点击“在完整工作台中打开”进入研学驾驶舱 (00:45 ~ 01:05)
        # ========================================================
        log_scene(
            title="进入研学主驾驶舱 Dashboard",
            desc="点击进入工作台，全景掌控知识库健康度、笔记总数、掌握度卡片与学科舱联动",
            voiceover="进入主驾驶舱，知识库健康评分、每日掌握度、待办复习进度一目了然，支持快速切换各科目研学舱。"
        )
        # 滚回顶部或直接点击顶部“免费体验”/“登录账号” (1426, 181)
        real_scroll(800, steps=20, duration=0.7)
        time.sleep(1.0)
        smooth_move(1150, 620, 1426, 181, steps=25, duration=0.5)
        real_click(1426, 181)
        time.sleep(2.5)

        # 鼠标在 Dashboard 数据卡片区巡视
        smooth_move(1426, 181, 400, 240, steps=25, duration=0.6)
        time.sleep(1.2)
        smooth_move(400, 240, 800, 240, steps=25, duration=0.6)
        time.sleep(1.5)

        # 平滑向下滚屏查看近期研学动态与卡片
        real_scroll(-350, steps=20, duration=0.6)
        time.sleep(2.0)
        real_scroll(350, steps=20, duration=0.6)
        time.sleep(1.0)

        # ========================================================
        # 幕 5：做题中心与真题精练 (01:05 ~ 01:20)
        # ========================================================
        log_scene(
            title="做题中心与考研真题深度解析",
            desc="点击顶部导航栏做题中心，真题精练、即时判分、名师考点深度剖析与错题归纳本",
            voiceover="做题中心汇聚 408 与公共课真题，支持即时判题与考点深度剖析，错题自动沉淀复习，让刷题更高效。"
        )
        # 顶部导航栏“做题中心”通常在 (310, 82) 左右
        # 直接通过地址栏快速导航或点击导航项
        press_shortcut(VK_CONTROL, VK_L)
        time.sleep(0.2)
        type_string("http://127.0.0.1:3001/quiz", delay=0.04)
        press_enter()
        time.sleep(2.5)

        # 鼠标在真题列表浏览
        smooth_move(500, 82, 800, 350, steps=25, duration=0.5)
        time.sleep(1.2)
        real_scroll(-250, steps=15, duration=0.5)
        time.sleep(2.0)

        # ========================================================
        # 幕 6：考研政治全景时空轴专区 (01:20 ~ 01:32)
        # ========================================================
        log_scene(
            title="考研政治专区与史纲时空轴",
            desc="导航进入考研政治专区，展示近代史全景时空轴与肖秀荣 1000 题专项突破",
            voiceover="政治专区配备全屏时空轴与肖秀荣 1000 题专项突破，历史脉络与考点纵览清晰无遗漏。"
        )
        press_shortcut(VK_CONTROL, VK_L)
        time.sleep(0.2)
        type_string("http://127.0.0.1:3001/politics", delay=0.04)
        press_enter()
        time.sleep(2.5)

        smooth_move(800, 350, 960, 400, steps=25, duration=0.6)
        time.sleep(1.5)
        real_scroll(-300, steps=15, duration=0.5)
        time.sleep(1.8)

        # ========================================================
        # 幕 7：3D 知识图谱立体脉络探索 (01:32 ~ 01:46)
        # ========================================================
        log_scene(
            title="3D 知识图谱立体脉络网络",
            desc="导航进入知识图谱，力导向星空拓扑展开，拖拽核心节点，考点动态穿透",
            voiceover="知识图谱将碎片化考点连接成一张立体的知识星图，力导向聚类与双链穿透，助你建立体系化的认知网络。"
        )
        press_shortcut(VK_CONTROL, VK_L)
        time.sleep(0.2)
        type_string("http://127.0.0.1:3001/graph", delay=0.04)
        press_enter()
        time.sleep(3.0)

        # 鼠标在图谱中央拖拽节点
        smooth_move(960, 400, 960, 540, steps=25, duration=0.5)
        time.sleep(0.5)
        user32.mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
        smooth_move(960, 540, 1080, 480, steps=25, duration=0.8)
        user32.mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)
        time.sleep(2.0)

        # ========================================================
        # 幕 8：双栏沉浸式 Markdown 笔记 (01:46 ~ 02:00)
        # ========================================================
        log_scene(
            title="双栏沉浸式考研笔记编辑",
            desc="导航进入笔记编辑，展示 KaTeX 数学公式渲染、代码高亮与考点大纲",
            voiceover="内置强大的 Markdown 编辑器，实时渲染 KaTeX 高等数学公式、代码高亮与考点大纲，带来专注的沉浸学习质感。"
        )
        press_shortcut(VK_CONTROL, VK_L)
        time.sleep(0.2)
        type_string("http://127.0.0.1:3001/editor", delay=0.04)
        press_enter()
        time.sleep(2.5)

        smooth_move(1080, 480, 850, 400, steps=25, duration=0.6)
        time.sleep(1.0)
        real_scroll(-300, steps=20, duration=0.6)
        time.sleep(2.0)

        # ========================================================
        # 幕 9：知识库治理工作流画布 (02:00 ~ 02:12)
        # ========================================================
        log_scene(
            title="知识库整理与工作流画布",
            desc="导航进入知识库整理，可视化节点治理、断链自动检测修复与体系重构",
            voiceover="工作流画布提供可视化知识库体检与整理能力，自动化修复断链与孤立笔记，让知识库持久保持生机。"
        )
        press_shortcut(VK_CONTROL, VK_L)
        time.sleep(0.2)
        type_string("http://127.0.0.1:3001/workflow", delay=0.04)
        press_enter()
        time.sleep(2.5)

        smooth_move(850, 400, 750, 450, steps=25, duration=0.6)
        time.sleep(2.0)

        # ========================================================
        # 幕 10：华丽定格收官 (02:12 ~ 02:22)
        # ========================================================
        log_scene(
            title="回归驾驶舱与华丽收官",
            desc="平滑切换回主驾驶舱，鼠标平稳移至下方中央，全屏定格呈现专业考研科技品牌形象",
            voiceover="CoreForge 研核，用科技重塑考研研学，助你一战成硕！"
        )
        press_shortcut(VK_CONTROL, VK_L)
        time.sleep(0.2)
        type_string("http://127.0.0.1:3001/dashboard", delay=0.04)
        press_enter()
        time.sleep(2.5)

        smooth_move(750, 450, 960, 800, steps=30, duration=0.9)
        time.sleep(4.0)

    finally:
        # 停止 OBS 录制
        print("\n [完成] 演示结束，向 OBS 发送停止录制命令...")
        obs.stop_record()
        time.sleep(3.0)
        obs.close()

    # 4. 检查生成的录屏文件并抽帧校验
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
                std_val = frame.std()
                print(f" [画质校验] 第一帧均值: {mean_val:.2f}, 标准差: {std_val:.2f} (画面状态: {'正常丰富画面' if std_val > 10 else '纯色单调画面'})")
            cap.release()
        except Exception as e:
            print(" [画质校验提示]", e)
    print("==================================================")

    # 5. 保存分镜台本
    script_meta_path = os.path.join(os.path.dirname(__file__), "showcase_timeline.json")
    with open(script_meta_path, "w", encoding="utf-8") as f:
        json.dump(timeline, f, indent=2, ensure_ascii=False)
    print(f" 分镜台本数据已导出至: {script_meta_path}")

if __name__ == "__main__":
    main()
