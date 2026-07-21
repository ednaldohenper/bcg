import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

const LOADING_MESSAGES = [
  "Analisando seu negócio...",
  "Identificando perfis de clientes...",
  "Montando as Estrelas do seu negócio...",
  "Definindo suas Vacas Leiteiras...",
  "Avaliando os pontos de Interrogação...",
  "Mapeando os Abacaxis...",
  "Gerando estratégias personalizadas...",
  "Criando templates de comunicação...",
  "Finalizando seu playbook...",
];

const BLOCK_SKELETONS = [
  { icon: "⭐", label: "Estrela", color: "var(--matrix-star)", bgColor: "var(--matrix-star-bg)" },
  { icon: "🐄", label: "Vaca Leiteira", color: "var(--matrix-cow)", bgColor: "var(--matrix-cow-bg)" },
  { icon: "❓", label: "Interrogação", color: "var(--matrix-question)", bgColor: "var(--matrix-question-bg)" },
  { icon: "🍍", label: "Abacaxi", color: "var(--matrix-pineapple)", bgColor: "var(--matrix-pineapple-bg)" },
];

export function GeneratingLoader() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-24 pt-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/5 border border-primary/10 mb-6">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <AnimatePresence mode="wait">
            <motion.span
              key={messageIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="text-base font-medium text-slate-700 dark:text-slate-300"
            >
              {LOADING_MESSAGES[messageIndex]}
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="w-64 mx-auto h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 25, ease: "linear" }}
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {BLOCK_SKELETONS.map((block, index) => (
          <motion.div
            key={block.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
            className="rounded-2xl border-2 p-6 relative overflow-hidden"
            style={{
              borderColor: `hsl(${block.color} / 0.2)`,
              backgroundColor: `hsl(${block.bgColor})`,
            }}
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">{block.icon}</span>
              <div
                className="h-5 rounded-md animate-pulse"
                style={{
                  width: "60%",
                  backgroundColor: `hsl(${block.color} / 0.15)`,
                }}
              />
            </div>

            <div className="space-y-3">
              {[80, 95, 70, 85].map((w, i) => (
                <div
                  key={i}
                  className="h-3 rounded animate-pulse"
                  style={{
                    width: `${w}%`,
                    backgroundColor: `hsl(${block.color} / 0.1)`,
                    animationDelay: `${i * 200}ms`,
                  }}
                />
              ))}
            </div>

            <div className="mt-5 space-y-2">
              {[60, 75, 55].map((w, i) => (
                <div
                  key={i}
                  className="h-2.5 rounded animate-pulse"
                  style={{
                    width: `${w}%`,
                    backgroundColor: `hsl(${block.color} / 0.08)`,
                    animationDelay: `${(i + 4) * 200}ms`,
                  }}
                />
              ))}
            </div>

            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/5"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
