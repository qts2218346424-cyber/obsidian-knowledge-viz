import re

path = r'e:\知识库项目\obsidian-viz\src\components\ImportResourceModal.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# 替换 handleCommitParsedQuestions
text = re.sub(
    r'const handleCommitParsedQuestions = async \(\) => \{[\s\S]*?alert\(\'保存失败: \' \+ err\.message\)[\s\S]*?\}',
    '''const handleCommitParsedQuestions = async () => {
    if (parsedPreviewQuestions.length === 0) return
    try {
      const count = parsedPreviewQuestions.length
      const data = await api.saveCustomQuestions(parsedPreviewQuestions)
      if (data.success) {
        setImportFeedback(`成功导入 ${count} 道题目进入做题中心！`)
        setParsedPreviewQuestions([])
        setRawQuestionText('')
        await loadCustomQuestions()
        onQuestionsUpdated?.()
        window.dispatchEvent(new CustomEvent('custom-questions-updated'))
        window.dispatchEvent(new CustomEvent('vault-notes-updated'))
      }
    } catch (err: any) {
      alert('保存失败: ' + err.message)
    }
  }''',
    text
)

# 替换 handleImportJson
text = re.sub(
    r'const handleImportJson = async \(\) => \{[\s\S]*?alert\(\'JSON 格式错误: \' \+ err\.message\)[\s\S]*?\}',
    '''const handleImportJson = async () => {
    try {
      const parsed = JSON.parse(jsonInput)
      const list = Array.isArray(parsed) ? parsed : [parsed]
      const data = await api.saveCustomQuestions(list)
      if (data.success) {
        setImportFeedback(`成功导入 ${list.length} 条 JSON 题目！`)
        setJsonInput('')
        await loadCustomQuestions()
        onQuestionsUpdated?.()
        window.dispatchEvent(new CustomEvent('custom-questions-updated'))
        window.dispatchEvent(new CustomEvent('vault-notes-updated'))
      }
    } catch (err: any) {
      alert('JSON 格式错误: ' + err.message)
    }
  }''',
    text
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)
print('Replaced both functions!')
