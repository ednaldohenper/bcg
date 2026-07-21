import { StrategyBlock } from "@workspace/api-client-react";
import { EditableField } from "./EditableField";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BlockKey, FieldKey } from "@/hooks/use-strategy";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StrategyBlockCardProps {
  blockKey: BlockKey;
  blockData: StrategyBlock;
  onUpdate: (block: BlockKey, field: FieldKey, value: string | string[]) => void;
  onImprove: (block: BlockKey, field: FieldKey) => void;
  isImproving: Record<string, boolean>;
  delay?: number;
}

const themeMap: Record<BlockKey, { bg: string; border: string; text: string; iconBg: string }> = {
  star: { 
    bg: "bg-matrix-star-bg", 
    border: "border-matrix-star/30", 
    text: "text-matrix-star",
    iconBg: "bg-matrix-star/10"
  },
  cashCow: { 
    bg: "bg-matrix-cow-bg", 
    border: "border-matrix-cow/30", 
    text: "text-matrix-cow",
    iconBg: "bg-matrix-cow/10"
  },
  questionMark: { 
    bg: "bg-matrix-question-bg", 
    border: "border-matrix-question/30", 
    text: "text-matrix-question",
    iconBg: "bg-matrix-question/10"
  },
  pineapple: { 
    bg: "bg-matrix-pineapple-bg", 
    border: "border-matrix-pineapple/30", 
    text: "text-matrix-pineapple",
    iconBg: "bg-matrix-pineapple/10"
  },
};

const labelMap: Record<BlockKey, string> = {
  star: "Estrela",
  cashCow: "Vaca Leiteira",
  questionMark: "Interrogação",
  pineapple: "Abacaxi"
};

export function StrategyBlockCard({ 
  blockKey, 
  blockData, 
  onUpdate, 
  onImprove,
  isImproving,
  delay = 0
}: StrategyBlockCardProps) {
  const { toast } = useToast();
  const theme = themeMap[blockKey];

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(blockData.communicationTemplate);
    toast({
      title: "Copiado!",
      description: "Template de comunicação copiado para a área de transferência.",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={cn(
        "flex flex-col h-full rounded-2xl border-2 p-6 shadow-sm transition-all duration-300 hover:shadow-xl print-card",
        theme.bg,
        theme.border
      )}
    >
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-black/5 dark:border-white/5">
        <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl text-3xl shadow-inner", theme.iconBg)}>
          {blockData.icon}
        </div>
        <div>
          <div className={cn("text-xs font-bold uppercase tracking-wider mb-1 opacity-80", theme.text)}>
            Quadrante {labelMap[blockKey]}
          </div>
          <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            {blockData.title}
          </h3>
        </div>
      </div>

      <div className="flex-1 space-y-6">
        <EditableField
          label="Quem São Eles?"
          value={blockData.whoAreThey}
          onSave={(v) => onUpdate(blockKey, "whoAreThey", v)}
          onImprove={() => onImprove(blockKey, "whoAreThey")}
          isImproving={isImproving[`${blockKey}-whoAreThey`]}
        />
        
        <EditableField
          label="Estratégia Central"
          value={blockData.centralStrategy}
          onSave={(v) => onUpdate(blockKey, "centralStrategy", v)}
          onImprove={() => onImprove(blockKey, "centralStrategy")}
          isImproving={isImproving[`${blockKey}-centralStrategy`]}
        />
        
        <EditableField
          label="Plano Tático"
          value={blockData.tacticalPlan}
          isList
          onSave={(v) => onUpdate(blockKey, "tacticalPlan", v)}
          onImprove={() => onImprove(blockKey, "tacticalPlan")}
          isImproving={isImproving[`${blockKey}-tacticalPlan`]}
        />
        
        <EditableField
          label="MACs (Motivos p/ Abrir Conversa)"
          value={blockData.macs}
          isList
          onSave={(v) => onUpdate(blockKey, "macs", v)}
          onImprove={() => onImprove(blockKey, "macs")}
          isImproving={isImproving[`${blockKey}-macs`]}
        />

        <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5 relative">
          <EditableField
            label="Template de Comunicação"
            value={blockData.communicationTemplate}
            onSave={(v) => onUpdate(blockKey, "communicationTemplate", v)}
            onImprove={() => onImprove(blockKey, "communicationTemplate")}
            isImproving={isImproving[`${blockKey}-communicationTemplate`]}
          />
          <Button
            size="icon"
            variant="secondary"
            className="absolute -top-10 right-0 h-8 w-8 rounded-full shadow-sm no-print"
            onClick={handleCopyTemplate}
            title="Copiar Template"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
