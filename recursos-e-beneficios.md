# Gerador de Estratégia de Clientes — Recursos e Benefícios

## O que é

Ferramenta de IA que aplica a **Matriz BCG ao relacionamento com clientes**. O usuário informa o setor, público-alvo e produto principal; a IA segmenta os clientes em quatro perfis e entrega um playbook completo com estratégias, táticas e templates de comunicação prontos para uso.

---

## Segmentação BCG de Clientes

A ferramenta classifica automaticamente a base de clientes em quatro quadrantes:

| Quadrante | Perfil | Foco estratégico |
|-----------|--------|-----------------|
| **Estrelas** | Clientes de alto valor e alto potencial | Expandir, fidelizar, transformar em cases |
| **Vacas Leiteiras** | Clientes estáveis com receita recorrente | Rentabilizar, proteger, aprofundar relacionamento |
| **Interrogações** | Clientes com potencial não explorado ou inativos | Reativar, qualificar, testar novas ofertas |
| **Abacaxis** | Clientes problemáticos ou de baixa margem | Renegociar, reeducar ou descontinuar |

---

## Recursos

### Geração de Playbook com IA
- Análise contextualizada com base no **setor**, **público-alvo**, **produto principal** e **gatilhos de conversa** fornecidos pelo usuário
- Para cada quadrante, a IA gera:
  - **Quem são eles** — descrição específica do perfil para aquele negócio
  - **Estratégia central** — objetivo primário para o segmento
  - **Plano tático** — 3 a 4 ações concretas e priorizadas
  - **MACs (Motivos para Abrir Conversa)** — gatilhos específicos para iniciar abordagem
  - **Template de comunicação** — mensagem pronta para envio ao cliente

### Edição e Refinamento Inteligente
- Todos os campos do playbook são **editáveis diretamente na tela** após a geração
- Botão de **melhoria por IA** em cada campo: reescreve o conteúdo tornando-o mais persuasivo ou profissional sem perder o contexto
- Edição de listas item a item (táticas, MACs) com adição e remoção dinâmica

### Salvamento e Histórico
- Playbooks salvos automaticamente no banco de dados para usuários autenticados
- **Histórico de playbooks** acessível a qualquer momento — recarregar, renomear ou excluir
- Cache local para proteger o trabalho em caso de perda de conexão

### Exportação e Compartilhamento
- **Exportar como PDF** com formatação profissional otimizada para impressão
- **Copiar template** de comunicação com um clique para área de transferência
- Layout de impressão limpo, sem elementos de interface, pronto para apresentações

### Autenticação e Segurança
- Login seguro via **Clerk** (suporte a e-mail e provedores sociais)
- Interface em **Português do Brasil** com tema visual personalizado
- Cada usuário acessa apenas seus próprios playbooks

### Integração com FOCO360
- Ao concluir um playbook, a ferramenta **notifica automaticamente o portal FOCO360** via webhook
- Envia resumo da estratégia, táticas geradas e URL de resultado
- Integração SSO: recebe token da sessão do aluno pela URL e repassa ao webhook sem exposição no chat

---

## Benefícios

### Para o negócio
- Elimina horas de análise manual de carteira de clientes
- Padroniza o processo de segmentação em toda a equipe comercial
- Gera estratégias adaptadas ao contexto real do negócio, não genéricas
- Reduz o tempo entre diagnóstico e ação: do input ao plano tático em minutos

### Para o time de vendas e CS
- Templates de comunicação prontos eliminam o "não sei o que falar" para cada perfil
- MACs contextuais facilitam a abertura de conversa com clientes difíceis ou inativos
- Playbook exportável vira material de referência para reuniões e onboarding

### Para a plataforma de ensino (FOCO360)
- Ferramenta prática que conecta aprendizado teórico (Matriz BCG) à aplicação real
- Progresso do aluno registrado automaticamente via webhook ao concluir o playbook
- Experiência integrada: aluno entra pelo portal FOCO360 via SSO e retorna ao fluxo sem fricção

---

## Fluxo de uso

```
1. Aluno acessa via FOCO360 (SSO automático)
        ↓
2. Informa: setor · público-alvo · produto principal · gatilhos de conversa
        ↓
3. IA gera o playbook BCG completo (4 quadrantes × 5 seções)
        ↓
4. Aluno edita, refina com IA e copia templates prontos
        ↓
5. Exporta como PDF ou salva no histórico
        ↓
6. FOCO360 recebe notificação automática de conclusão
```

---

## Requisitos de acesso

| Item | Detalhe |
|------|---------|
| Autenticação | Clerk (e-mail ou social) |
| Idioma | Português do Brasil |
| Plataformas suportadas | Web (desktop e mobile) |
| Integração externa | FOCO360 via webhook (configurável) |
