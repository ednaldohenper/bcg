import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { ZodError } from "zod";
import {
  GenerateStrategyBody,
  GenerateStrategyResponse,
  ImproveTextBody,
  ImproveTextResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/strategy/generate", async (req, res) => {
  try {
    const body = GenerateStrategyBody.parse(req.body);

    const systemPrompt = `Você é um consultor estratégico de negócios especializado em gestão de carteira de clientes usando a Matriz BCG adaptada. Seu papel é gerar um playbook estratégico completo e personalizado com base no contexto do negócio do usuário.

Você DEVE responder em português brasileiro, usando linguagem profissional mas acessível.

Gere um playbook com 4 blocos estratégicos no seguinte formato JSON:
{
  "star": { "icon": "⭐", "title": "ESTRELA - Seus Clientes de Alto Valor", "whoAreThey": "...", "centralStrategy": "...", "tacticalPlan": ["...", "...", "..."], "macs": ["...", "...", "..."], "communicationTemplate": "..." },
  "cashCow": { "icon": "🐄", "title": "VACA LEITEIRA - Clientes Recorrentes e Estáveis", "whoAreThey": "...", "centralStrategy": "...", "tacticalPlan": ["...", "...", "..."], "macs": ["...", "...", "..."], "communicationTemplate": "..." },
  "questionMark": { "icon": "❓", "title": "INTERROGAÇÃO - Clientes em Potencial ou Inativos", "whoAreThey": "...", "centralStrategy": "...", "tacticalPlan": ["...", "...", "..."], "macs": ["...", "...", "..."], "communicationTemplate": "..." },
  "pineapple": { "icon": "🍍", "title": "ABACAXI - Clientes Problemáticos", "whoAreThey": "...", "centralStrategy": "...", "tacticalPlan": ["...", "...", "..."], "macs": ["...", "...", "..."], "communicationTemplate": "..." }
}

Para cada bloco:
- "whoAreThey": Descreva quem são esses clientes de forma clara e prática, personalizada para o negócio do usuário.
- "centralStrategy": Defina o objetivo principal com esses clientes em 1-2 frases.
- "tacticalPlan": Liste 3-4 ações práticas e diretas.
- "macs": Liste 3-4 "Motivos para Abrir Conversa" - ganchos para iniciar contato.
- "communicationTemplate": Escreva um template de mensagem completo, informal e persuasivo, com [Nome do Cliente] como placeholder. Use emojis quando apropriado.

IMPORTANTE: Responda APENAS com o JSON válido, sem markdown, sem código, sem explicações.`;

    const macSection = body.macContext
      ? `\n- Gatilhos de conversa preferidos pelo empresário: ${body.macContext}`
      : "";

    const macInstruction = body.macContext
      ? `\n\nATENÇÃO ESPECIAL PARA OS MACs: O empresário descreveu os seguintes gatilhos/motivos que considera relevantes para abrir conversa com clientes: "${body.macContext}". Use essas informações como base principal para gerar os MACs de cada bloco, adaptando-os ao perfil de cada segmento.`
      : "";

    const userPrompt = `Contexto do negócio:
- Área de atuação: ${body.industry}
- Público-alvo: ${body.targetAudience}
- Principal produto/serviço: ${body.mainProduct}${macSection}
${macInstruction}
Gere o playbook estratégico completo personalizado para este negócio.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      res.status(500).json({ error: "No response from AI" });
      return;
    }

    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      res.status(500).json({ error: "Failed to parse AI response" });
      return;
    }

    const validated = GenerateStrategyResponse.parse(parsed);
    res.json(validated);
  } catch (error: unknown) {
    console.error("Strategy generation error:", error);
    if (error instanceof ZodError) {
      res.status(400).json({ error: "Invalid request data", details: error.issues });
      return;
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
});

router.post("/strategy/improve", async (req, res) => {
  try {
    const body = ImproveTextBody.parse(req.body);

    const blockLabels: Record<string, string> = {
      star: "Estrela (Clientes de Alto Valor)",
      cashCow: "Vaca Leiteira (Clientes Recorrentes)",
      questionMark: "Interrogação (Clientes em Potencial)",
      pineapple: "Abacaxi (Clientes Problemáticos)",
    };

    const fieldLabels: Record<string, string> = {
      whoAreThey: "Descrição de quem são os clientes",
      centralStrategy: "Estratégia central",
      tacticalPlan: "Plano tático",
      macs: "Motivos para abrir conversa",
      communicationTemplate: "Template de comunicação",
    };

    const systemPrompt = `Você é um consultor estratégico especializado em comunicação empresarial. Seu trabalho é melhorar textos de estratégias de clientes, tornando-os mais persuasivos, claros e acionáveis.

Mantenha o mesmo formato e estilo do texto original (se for uma lista, mantenha como lista; se for um template de mensagem, mantenha como template).
Responda APENAS com o texto melhorado, sem explicações adicionais.
Use português brasileiro.`;

    const userPrompt = `Melhore o seguinte texto do bloco "${blockLabels[body.blockType] || body.blockType}" na seção "${fieldLabels[body.fieldType] || body.fieldType}".

Contexto do negócio: ${body.context}

Texto atual:
${body.text}

Retorne apenas o texto melhorado.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 4096,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const improvedText = completion.choices[0]?.message?.content;
    if (!improvedText) {
      res.status(500).json({ error: "No response from AI" });
      return;
    }

    const validated = ImproveTextResponse.parse({ improvedText: improvedText.trim() });
    res.json(validated);
  } catch (error: unknown) {
    console.error("Text improvement error:", error);
    if (error instanceof ZodError) {
      res.status(400).json({ error: "Invalid request data", details: error.issues });
      return;
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
});

export default router;
