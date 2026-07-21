import { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowRight, Sparkles, LayoutGrid, Check, ChevronsUpDown, RotateCcw, Cloud, CloudOff, History, Trash2, Pencil, X } from "lucide-react";
import { useUser } from "@clerk/react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { useStrategyManager } from "@/hooks/use-strategy";
import { usePlaybooks, useSavePlaybook, useDeletePlaybook, useRenamePlaybook, fetchPlaybook } from "@/hooks/use-playbooks";
import { isFocoSession, notifyFoco } from "@/lib/foco360";
import { StrategyBlockCard } from "@/components/StrategyBlockCard";
import { PlaybookExportBar } from "@/components/PlaybookExportBar";
import { GeneratingLoader } from "@/components/GeneratingLoader";
import Header from "@/components/Header";

const INDUSTRIES = [
  "Tecnologia",
  "E-commerce",
  "Serviços",
  "Saúde",
  "Educação",
  "Manufatura",
  "Financeiro",
  "Consultoria",
  "Outro"
];

const formSchema = z.object({
  industry: z.string().trim().min(1, "Selecione uma área de atuação"),
  targetAudience: z.string().min(5, "Descreva seu público-alvo (mín. 5 caracteres)"),
  mainProduct: z.string().min(3, "Descreva seu produto ou serviço (mín. 3 caracteres)"),
  macContext: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function buildFocoReport(industry: string, targetAudience: string, mainProduct: string): string {
  return `Playbook BCG gerado — Setor: ${industry}. Público: ${targetAudience.slice(0, 100)}. Produto: ${mainProduct.slice(0, 100)}.`;
}

function buildFocoStrategies(pb: NonNullable<ReturnType<typeof useStrategyManager>["playbook"]>): string[] {
  const items: string[] = [];
  const blocks = [
    { label: "Estrelas", block: pb.star },
    { label: "Vacas Leiteiras", block: pb.cashCow },
    { label: "Interrogações", block: pb.questionMark },
    { label: "Abacaxis", block: pb.pineapple },
  ] as const;
  for (const { label, block } of blocks) {
    const tactic = block.tacticalPlan?.[0];
    if (tactic) items.push(`${label}: ${tactic}`);
  }
  return items;
}

export default function Home() {
  const printRef = useRef<HTMLDivElement>(null);
  const focoNotifiedRef = useRef(false);
  const [industryOpen, setIndustryOpen] = useState(false);
  const [industrySearch, setIndustrySearch] = useState("");
  const [savedId, setSavedId] = useState<number | null>(null);
  const [viewingId, setViewingId] = useState<number | null>(null);
  const [savePending, setSavePending] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState("");

  const { isSignedIn, isLoaded } = useUser();
  const { data: savedPlaybooks } = usePlaybooks();
  const savePlaybook = useSavePlaybook();
  const deletePlaybook = useDeletePlaybook();
  const renamePlaybook = useRenamePlaybook();

  const {
    playbook,
    context,
    isGenerating,
    isImproving,
    generatePlaybook,
    updateField,
    clearPlaybook,
    loadExternalPlaybook,
    improveFieldWithAI,
  } = useStrategyManager();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      industry: context?.industry ?? "",
      targetAudience: context?.targetAudience ?? "",
      mainProduct: context?.mainProduct ?? "",
      macContext: context?.macContext ?? "",
    },
  });

  useEffect(() => {
    if (playbook && isSignedIn && !savedId && !savePending) {
      const values = form.getValues();
      setSavePending(true);
      const title =
        values.industry && values.targetAudience
          ? `${values.industry} — ${values.targetAudience.slice(0, 40)}`
          : "Playbook sem título";
      savePlaybook.mutate(
        {
          title,
          industry: values.industry,
          targetAudience: values.targetAudience,
          mainProduct: values.mainProduct,
          macContext: values.macContext ?? "",
          playbookData: playbook as Record<string, unknown>,
        },
        {
          onSuccess: (data) => {
            setSavedId(data.id);
            setSavePending(false);
          },
          onError: () => {
            setSavePending(false);
          },
        }
      );
    }
  }, [playbook, isSignedIn]);

  useEffect(() => {
    if (!playbook || !isFocoSession() || viewingId !== null || focoNotifiedRef.current) return;
    const values = form.getValues();
    const report = buildFocoReport(values.industry, values.targetAudience, values.mainProduct);
    const strategies = buildFocoStrategies(playbook);
    const extraData = { industry: values.industry, targetAudience: values.targetAudience };

    if (isSignedIn) {
      if (!savedId) return;
      focoNotifiedRef.current = true;
      const resultUrl = `${window.location.origin}${basePath}/?playbook=${savedId}`;
      notifyFoco({ report, strategies, resultUrl, extraData }).catch(() => {});
    } else {
      focoNotifiedRef.current = true;
      notifyFoco({ report, strategies, extraData }).catch(() => {});
    }
  }, [playbook, isSignedIn, savedId, viewingId]);

  const currentSavedPlaybookId = savedId ?? viewingId;
  const currentTitle = savedPlaybooks?.find((p) => p.id === currentSavedPlaybookId)?.title ?? "";

  const handleLoadFromHistory = async (id: number) => {
    setLoadingId(id);
    try {
      const full = await fetchPlaybook(id);
      loadExternalPlaybook(full.playbook_data as any);
      setSavedId(null);
      setViewingId(id);
      setTimeout(() => {
        document.getElementById("playbook-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch {
    } finally {
      setLoadingId(null);
    }
  };

  const handleSaveTitle = () => {
    if (!currentSavedPlaybookId || !editingTitle.trim()) return;
    renamePlaybook.mutate({ id: currentSavedPlaybookId, title: editingTitle.trim() });
    setIsTitleEditing(false);
  };

  const startTitleEdit = () => {
    setEditingTitle(currentTitle);
    setIsTitleEditing(true);
  };

  const handleClear = () => {
    setSavedId(null);
    setViewingId(null);
    setSavePending(false);
    setIsTitleEditing(false);
    clearPlaybook();
  };

  const onSubmit = (data: FormValues) => {
    setSavedId(null);
    setViewingId(null);
    setSavePending(false);
    setIsTitleEditing(false);
    focoNotifiedRef.current = false;
    const payload = {
      industry: data.industry,
      targetAudience: data.targetAudience,
      mainProduct: data.mainProduct,
      ...(data.macContext?.trim() ? { macContext: data.macContext.trim() } : {}),
    };
    generatePlaybook(payload);
  };

  return (
    <main className="min-h-screen relative overflow-hidden pb-32">
      <Header />

      {/* Dark gold background */}
      <div className="absolute inset-0 -z-10 no-print bg-zinc-950">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-gold/10 blur-[120px] pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(212,166,54,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(212,166,54,0.6) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-zinc-950 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 pb-12">

        {/* HERO */}
        <div className="max-w-3xl mx-auto text-center mb-14 no-print">
          <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-zinc-900 border border-gold/30 shadow-[0_0_30px_rgba(212,166,54,0.15)]">
            <LayoutGrid className="w-8 h-8 text-gold" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-white">
            Estratégia de Clientes{" "}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-[#e8be50] to-gold">
              Impulsionada por IA
            </span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Descubra quem são suas Estrelas, Vacas Leiteiras, Interrogações e
            Abacaxis. Gere um playbook tático e templates de comunicação em
            segundos.
          </p>
        </div>

        {/* INPUT FORM */}
        <div className="max-w-2xl mx-auto no-print">
          <div className="relative rounded-[2rem] bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-24 bg-gold/5 blur-2xl pointer-events-none" />
            <div className="p-6 md:p-10">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-sm font-semibold text-zinc-300 mb-1">
                          Qual é a sua área de atuação?
                        </FormLabel>
                        <Popover open={industryOpen} onOpenChange={(open) => {
                            setIndustryOpen(open);
                            if (!open) setIndustrySearch("");
                          }}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                type="button"
                                variant="outline"
                                role="combobox"
                                aria-expanded={industryOpen}
                                className={cn(
                                  "h-12 rounded-xl text-base bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:border-gold/50 justify-between font-normal transition-colors",
                                  !field.value && "text-zinc-500"
                                )}
                              >
                                {field.value || "Selecione ou digite um setor..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-xl bg-zinc-900 border-zinc-700" align="start">
                            <Command className="bg-zinc-900" shouldFilter={false}>
                              <CommandInput
                                placeholder="Buscar ou digitar setor..."
                                value={industrySearch}
                                onValueChange={setIndustrySearch}
                                className="text-white placeholder:text-zinc-500"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && industrySearch.trim()) {
                                    const match = INDUSTRIES.find(
                                      (ind) => ind.toLowerCase() === industrySearch.trim().toLowerCase()
                                    );
                                    if (!match) {
                                      e.preventDefault();
                                      field.onChange(industrySearch.trim());
                                      setIndustrySearch("");
                                      setIndustryOpen(false);
                                    }
                                  }
                                }}
                              />
                              <CommandList>
                                <CommandEmpty
                                  className="py-3 px-2 text-sm cursor-pointer text-zinc-300 hover:bg-zinc-800"
                                  onClick={() => {
                                    field.onChange(industrySearch.trim());
                                    setIndustrySearch("");
                                    setIndustryOpen(false);
                                  }}
                                >
                                  Usar "{industrySearch}"
                                </CommandEmpty>
                                <CommandGroup>
                                  {INDUSTRIES
                                    .filter((ind) =>
                                      ind.toLowerCase().includes(industrySearch.toLowerCase())
                                    )
                                    .map((ind) => (
                                      <CommandItem
                                        key={ind}
                                        value={ind}
                                        className="text-base py-3 text-zinc-200 hover:bg-zinc-800 aria-selected:bg-zinc-800"
                                        onSelect={() => {
                                          field.onChange(ind);
                                          setIndustrySearch("");
                                          setIndustryOpen(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4 text-gold",
                                            field.value === ind ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        {ind}
                                      </CommandItem>
                                    ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="targetAudience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-zinc-300">
                          Descreva seu público-alvo em uma frase:
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Diretores de RH em médias empresas que buscam reter talentos..."
                            className="h-12 rounded-xl text-base bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:border-gold/60 focus-visible:ring-gold/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mainProduct"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-zinc-300">
                          Qual é o seu principal produto/serviço?
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: Plataforma SaaS de gestão de benefícios corporativos com app mobile..."
                            className="min-h-[100px] resize-none rounded-xl text-base p-4 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:border-gold/60 focus-visible:ring-gold/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="macContext"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-zinc-300">
                          Quais gatilhos você usa para abrir conversa com clientes?{" "}
                          <span className="text-xs font-normal text-zinc-500">(opcional)</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: Datas comemorativas, lançamentos de produto, renovação de contrato, pós-venda..."
                            className="min-h-[80px] resize-none rounded-xl text-base p-4 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:border-gold/60 focus-visible:ring-gold/20"
                            {...field}
                          />
                        </FormControl>
                        <p className="text-xs text-zinc-500 mt-1">
                          Descreva os motivos que você considera bons para iniciar contato. A IA usará isso como base para gerar os MACs de cada segmento.
                        </p>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isGenerating}
                    className="w-full h-14 text-base font-bold rounded-xl bg-gold hover:bg-gold/90 text-zinc-950 shadow-[0_0_30px_rgba(212,166,54,0.3)] hover:shadow-[0_0_40px_rgba(212,166,54,0.5)] hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0 border-0"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Gerando sua estratégia (pode levar alguns segundos)...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Gerar Minha Estratégia de Clientes
                        <ArrowRight className="ml-2 h-5 w-5 opacity-70" />
                      </>
                    )}
                  </Button>

                  {isLoaded && !isSignedIn && (
                    <p className="text-center text-xs text-zinc-500 -mt-4 flex items-center justify-center gap-1.5">
                      <CloudOff className="h-3.5 w-3.5 text-zinc-600" />
                      Faça login para salvar seus playbooks na nuvem
                    </p>
                  )}

                </form>
              </Form>
            </div>
          </div>

          {/* SAVED PLAYBOOKS HISTORY (only when signed in and there are saved playbooks) */}
          {isSignedIn && savedPlaybooks && savedPlaybooks.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3 px-1">
                <History className="h-4 w-4 text-zinc-500" />
                <span className="text-sm font-medium text-zinc-400">Seus playbooks salvos</span>
              </div>
              <div className="space-y-2">
                {savedPlaybooks.slice(0, 5).map((p) => (
                  <div
                    key={p.id}
                    className={cn(
                      "group flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors cursor-pointer",
                      viewingId === p.id
                        ? "bg-gold/10 border-gold/40 hover:border-gold/60"
                        : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/60"
                    )}
                    onClick={() => handleLoadFromHistory(p.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-200 truncate">{p.title}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {new Date(p.updated_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {loadingId === p.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); deletePlaybook.mutate(p.id); }}
                          className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                          title="Excluir"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* LOADING STATE */}
        {isGenerating && <GeneratingLoader />}

        {/* RESULTS - BCG PLAYBOOK */}
        {playbook && !isGenerating && (
          <div id="playbook-results" ref={printRef} className="mt-24 pt-10 scroll-mt-10">

            <div className="text-center mb-12 print-only hidden">
              <h1 className="text-4xl font-bold font-display text-slate-900 mb-2">Playbook Estratégico de Clientes</h1>
              <p className="text-slate-500">Matriz BCG de Clientes</p>
            </div>

            {/* Toolbar: title + save status + nova estratégia */}
            <div className="flex flex-col gap-3 mb-8 no-print">
              {/* Title row */}
              {currentSavedPlaybookId && currentTitle ? (
                <div className="flex items-center gap-2">
                  {isTitleEditing ? (
                    <>
                      <input
                        autoFocus
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveTitle();
                          if (e.key === "Escape") setIsTitleEditing(false);
                        }}
                        onBlur={handleSaveTitle}
                        className="flex-1 bg-zinc-800 border border-gold/40 rounded-lg px-3 py-1.5 text-sm font-semibold text-white focus:outline-none focus:border-gold"
                      />
                      <button
                        onMouseDown={(e) => { e.preventDefault(); handleSaveTitle(); }}
                        className="p-1.5 rounded-lg text-gold hover:bg-gold/10 transition-colors"
                        title="Salvar"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onMouseDown={(e) => { e.preventDefault(); setIsTitleEditing(false); }}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors"
                        title="Cancelar"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-semibold text-zinc-300 truncate max-w-sm">{currentTitle}</span>
                      <button
                        onClick={startTitleEdit}
                        className="p-1 rounded text-zinc-600 hover:text-zinc-300 transition-colors"
                        title="Renomear"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              ) : null}

              {/* Actions row */}
              <div className="flex items-center justify-between">
                <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                  {isSignedIn && (
                    savePending ? (
                      <><Loader2 className="h-3 w-3 animate-spin" /> Salvando na nuvem...</>
                    ) : savedId || viewingId ? (
                      <><Cloud className="h-3 w-3 text-gold" /> Salvo na nuvem</>
                    ) : null
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="gap-2 text-zinc-400 border-zinc-700 bg-zinc-900 hover:bg-zinc-800 hover:text-white hover:border-zinc-600"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Nova Estratégia
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print-grid">
              <StrategyBlockCard
                blockKey="star"
                blockData={playbook.star}
                onUpdate={updateField}
                onImprove={improveFieldWithAI}
                isImproving={isImproving}
                delay={0.1}
              />
              <StrategyBlockCard
                blockKey="cashCow"
                blockData={playbook.cashCow}
                onUpdate={updateField}
                onImprove={improveFieldWithAI}
                isImproving={isImproving}
                delay={0.2}
              />
              <StrategyBlockCard
                blockKey="questionMark"
                blockData={playbook.questionMark}
                onUpdate={updateField}
                onImprove={improveFieldWithAI}
                isImproving={isImproving}
                delay={0.3}
              />
              <StrategyBlockCard
                blockKey="pineapple"
                blockData={playbook.pineapple}
                onUpdate={updateField}
                onImprove={improveFieldWithAI}
                isImproving={isImproving}
                delay={0.4}
              />
            </div>

            <PlaybookExportBar playbook={playbook} printRef={printRef} />
          </div>
        )}

      </div>
    </main>
  );
}
