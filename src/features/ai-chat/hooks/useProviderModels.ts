import { useState, useEffect, useCallback } from 'react'
import { api, type LocalAgentStatus } from '@/services/api'
import { useAIStudioStore, PROVIDER_PRESET_MODELS } from '../store/useAIStudioStore'

export function useProviderModels() {
  const { provider, setProvider, selectedModel, setSelectedModel } = useAIStudioStore()
  const [localAgents, setLocalAgents] = useState<LocalAgentStatus[]>([])
  const [isDetecting, setIsDetecting] = useState(false)
  const [availableModels, setAvailableModels] = useState<string[]>(PROVIDER_PRESET_MODELS[provider] || [])

  const detectStatus = useCallback(async () => {
    setIsDetecting(true)
    try {
      const res = await api.getLocalAgentStatus()
      if (res && res.agents) {
        setLocalAgents(res.agents)
        const matched = res.agents.find((a) => a.provider === provider)
        if (matched && matched.models && matched.models.length > 0) {
          setAvailableModels(matched.models)
          if (!matched.models.includes(selectedModel)) {
            setSelectedModel(matched.defaultModel || matched.models[0])
          }
        } else {
          setAvailableModels(PROVIDER_PRESET_MODELS[provider] || [])
        }
      }
    } catch {
      setAvailableModels(PROVIDER_PRESET_MODELS[provider] || [])
    } finally {
      setIsDetecting(false)
    }
  }, [provider, selectedModel, setSelectedModel])

  useEffect(() => {
    detectStatus()
  }, [detectStatus])

  return {
    provider,
    setProvider,
    selectedModel,
    setSelectedModel,
    localAgents,
    isDetecting,
    availableModels,
    refreshStatus: detectStatus,
  }
}

export default useProviderModels
