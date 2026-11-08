# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

file_path = r'e:\知识库项目\obsidian-viz\src\components\AIAssistantModal.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 修复 interface AIAssistantModalProps
target_props = """interface AIAssistantModalProps {
  isOpen: boolean
  onClose: () => void
  pagePath: string
}"""

repl_props = """interface AIAssistantModalProps {
  isOpen: boolean
  onClose: () => void
  pagePath?: string
  initialContextPrompt?: string | null
  initialDefaultInput?: string | null
}"""

if target_props in content:
    content = content.replace(target_props, repl_props, 1)
    print("成功更新 AIAssistantModalProps 接口")
else:
    print("警告：未找到 target_props")

# 2. 注入 handleSwitchFastModelAndRetry
target_active = """  const activeSession = useMemo(
    () => workspace.sessions.find(session => session.id === workspace.activeSessionIdByProject[activeProject?.id || ''])
      || workspace.sessions.find(session => session.projectId === activeProject?.id),
    [workspace, activeProject],
  )"""

repl_active = """  const activeSession = useMemo(
    () => workspace.sessions.find(session => session.id === workspace.activeSessionIdByProject[activeProject?.id || ''])
      || workspace.sessions.find(session => session.projectId === activeProject?.id),
    [workspace, activeProject],
  )

  const handleSwitchFastModelAndRetry = () => {
    if (abortRef.current) {
      abortRef.current.abort()
    }
    setLoading(false)
    const curSessionId = activeSession?.id || workspace.activeSessionIdByProject[activeProject?.id || '']
    if (curSessionId) {
      updateSession(curSessionId, session => ({
        ...session,
        model: 'deepseek-v3',
      }))
    }
    setTimeout(() => {
      if (lastUserPromptRef.current) {
        void sendMessage(lastUserPromptRef.current)
      }
    }, 200)
  }"""

if target_active in content:
    content = content.replace(target_active, repl_active, 1)
    print("成功注入 handleSwitchFastModelAndRetry")
else:
    print("警告：未找到 target_active")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("AIAssistantModal.tsx 精确修复完成！")
