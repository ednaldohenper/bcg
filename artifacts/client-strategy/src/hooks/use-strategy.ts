import { useState, useEffect, useCallback } from "react";
import { useGenerateStrategy, useImproveText } from "@workspace/api-client-react";
import type { 
  StrategyPlaybook, 
  GenerateStrategyRequest,
  StrategyBlock 
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export type BlockKey = keyof StrategyPlaybook;
export type FieldKey = keyof Omit<StrategyBlock, "icon" | "title">;

const STORAGE_KEY_PLAYBOOK = "strategy_playbook_v1";
const STORAGE_KEY_CONTEXT  = "strategy_context_v1";

function loadFromStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage might be full or unavailable — silently ignore
  }
}

export function useStrategyManager() {
  const [playbook, setPlaybookState] = useState<StrategyPlaybook | null>(
    () => loadFromStorage<StrategyPlaybook>(STORAGE_KEY_PLAYBOOK)
  );
  const [context, setContextState] = useState<GenerateStrategyRequest | null>(
    () => loadFromStorage<GenerateStrategyRequest>(STORAGE_KEY_CONTEXT)
  );
  const [isImproving, setIsImproving] = useState<Record<string, boolean>>({});
  
  const generateMutation = useGenerateStrategy();
  const improveMutation = useImproveText();
  const { toast } = useToast();

  // Keep localStorage in sync whenever playbook or context changes
  useEffect(() => {
    if (playbook) {
      saveToStorage(STORAGE_KEY_PLAYBOOK, playbook);
    } else {
      localStorage.removeItem(STORAGE_KEY_PLAYBOOK);
    }
  }, [playbook]);

  useEffect(() => {
    if (context) {
      saveToStorage(STORAGE_KEY_CONTEXT, context);
    } else {
      localStorage.removeItem(STORAGE_KEY_CONTEXT);
    }
  }, [context]);

  const generatePlaybook = async (data: GenerateStrategyRequest) => {
    setContextState(data);
    try {
      const result = await generateMutation.mutateAsync({ data });
      setPlaybookState(result);
      toast({
        title: "Estratégia Gerada com Sucesso! 🚀",
        description: "Seu playbook personalizado está pronto.",
      });
      
      setTimeout(() => {
        document.getElementById("playbook-results")?.scrollIntoView({ 
          behavior: "smooth",
          block: "start" 
        });
      }, 100);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao gerar estratégia",
        description: "Ocorreu um problema ao conectar com a IA. Tente novamente.",
      });
    }
  };

  const updateField = (blockType: BlockKey, fieldType: FieldKey, newValue: string | string[]) => {
    if (!playbook) return;
    
    setPlaybookState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [blockType]: {
          ...prev[blockType],
          [fieldType]: newValue,
        }
      };
    });
  };

  const clearPlaybook = useCallback(() => {
    setPlaybookState(null);
    setContextState(null);
  }, []);

  const loadExternalPlaybook = useCallback((pb: StrategyPlaybook) => {
    setPlaybookState(pb);
  }, []);

  const improveFieldWithAI = async (blockType: BlockKey, fieldType: FieldKey) => {
    if (!playbook || !context) return;
    
    const currentVal = playbook[blockType][fieldType];
    const textToImprove = Array.isArray(currentVal) ? currentVal.join('\n') : currentVal as string;
    
    const macPart = context.macContext ? ` Gatilhos preferidos: ${context.macContext}.` : "";
    const contextString = `Indústria: ${context.industry}. Público: ${context.targetAudience}. Produto: ${context.mainProduct}.${macPart}`;
    const actionId = `${blockType}-${fieldType}`;
    
    setIsImproving(prev => ({ ...prev, [actionId]: true }));
    
    try {
      const result = await improveMutation.mutateAsync({
        data: {
          text: textToImprove,
          context: contextString,
          blockType,
          fieldType
        }
      });
      
      let finalValue: string | string[] = result.improvedText;
      
      if (Array.isArray(currentVal)) {
        finalValue = result.improvedText
          .split('\n')
          .map(s => s.replace(/^- /, '').trim())
          .filter(Boolean);
      }
      
      updateField(blockType, fieldType, finalValue);
      
      toast({
        title: "Texto melhorado! ✨",
        description: "A IA refinou seu conteúdo.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha na melhoria",
        description: "Não foi possível melhorar o texto agora.",
      });
    } finally {
      setIsImproving(prev => ({ ...prev, [actionId]: false }));
    }
  };

  return {
    playbook,
    context,
    isGenerating: generateMutation.isPending,
    isImproving,
    generatePlaybook,
    updateField,
    clearPlaybook,
    loadExternalPlaybook,
    improveFieldWithAI,
  };
}
