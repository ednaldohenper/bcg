import { useRef } from "react";
import { Download, MessageSquare, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StrategyPlaybook } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useReactToPrint } from "react-to-print";

interface PlaybookExportBarProps {
  playbook: StrategyPlaybook;
  printRef: React.RefObject<HTMLDivElement | null>;
}

export function PlaybookExportBar({ playbook, printRef }: PlaybookExportBarProps) {
  const { toast } = useToast();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Playbook Estratégico de Clientes - Matriz BCG",
  });

  const buildBlockText = (icon: string, block: typeof playbook.star) => {
    const tactics = block.tacticalPlan.map((t) => `  • ${t}`).join("\n");
    const macs = block.macs.map((m) => `  • ${m}`).join("\n");
    return (
      `${icon} *${block.title}*\n` +
      `\n*Quem são:* ${block.whoAreThey}\n` +
      `\n*Estratégia:* ${block.centralStrategy}\n` +
      `\n*Plano tático:*\n${tactics}\n` +
      `\n*MACs (gatilhos de conversa):*\n${macs}\n` +
      `\n*Template de mensagem:*\n${block.communicationTemplate}`
    );
  };

  const buildSummaryText = () => {
    const divider = "\n\n" + "─".repeat(30) + "\n\n";
    return (
      `🗂️ *PLAYBOOK ESTRATÉGICO DE CLIENTES*\n_Matriz BCG de Clientes_` +
      divider +
      buildBlockText("⭐", playbook.star) +
      divider +
      buildBlockText("🐄", playbook.cashCow) +
      divider +
      buildBlockText("❓", playbook.questionMark) +
      divider +
      buildBlockText("🍍", playbook.pineapple)
    );
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(buildSummaryText());
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleCopyAll = () => {
    const text = `
TEMPLATE ESTRELA:
${playbook.star.communicationTemplate}

TEMPLATE VACA LEITEIRA:
${playbook.cashCow.communicationTemplate}

TEMPLATE INTERROGAÇÃO:
${playbook.questionMark.communicationTemplate}

TEMPLATE ABACAXI:
${playbook.pineapple.communicationTemplate}
    `.trim();
    
    navigator.clipboard.writeText(text);
    toast({
      title: "Templates Copiados!",
      description: "Todos os 4 templates foram copiados para a área de transferência.",
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 no-print"
    >
      <div className="glass-panel flex items-center gap-2 p-2 rounded-full shadow-2xl border border-slate-200 dark:border-slate-800 dark:bg-slate-900/90">
        <Button 
          variant="ghost" 
          className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 px-6 font-medium text-slate-700 dark:text-slate-300"
          onClick={() => handlePrint()}
        >
          <Download className="mr-2 h-4 w-4" />
          Baixar PDF
        </Button>
        
        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
        
        <Button 
          variant="ghost" 
          className="rounded-full hover:bg-[#25D366]/10 hover:text-[#25D366] px-6 font-medium text-slate-700 dark:text-slate-300"
          onClick={handleWhatsApp}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Compartilhar
        </Button>
        
        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
        
        <Button 
          variant="default" 
          className="rounded-full px-6 shadow-md bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900"
          onClick={handleCopyAll}
        >
          <Copy className="mr-2 h-4 w-4" />
          Copiar Templates
        </Button>
      </div>
    </motion.div>
  );
}
