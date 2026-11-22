# RunCoach

Plataforma web para gestão de atletas, planilhas de corrida/atletismo e preparação para TAF.
React + TypeScript + Vite + Tailwind CSS • Supabase (PostgreSQL + Auth + RLS) • Recharts • Lucide • PWA • GitHub Pages.

## O que o sistema faz

**Professor**
- Dashboard: atletas (total/ativos), treinos programados/concluídos/pendentes, próximos treinos, gráficos de evolução, atletas que precisam de acompanhamento, últimos resultados.
- Atletas: cadastro completo (inclui observações **privadas** que o atleta não consegue ler), categorias, grupos, situação ativo/inativo.
- Planilhas diárias/semanais/mensais/personalizadas, com todos os campos de treino pedidos; **copiar semana** (na planilha e na agenda de um atleta); atribuir a atletas individuais **ou grupos** (o atleta é notificado).
- Treinamentos: biblioteca de modelos reutilizáveis (aplicar a atletas/grupos em uma data).
- Calendário mensal e semanal (treinos, competições, avaliações, TAF, eventos).
- Resultados: treino planejado × realizado, marcas pessoais (PB) e competições; modalidades/provas extras cadastráveis.
- Relatórios individuais com filtros de período e modalidade, gráficos, comparação entre períodos, % de conclusão, metas — **exportação em PDF**.
- Módulo TAF: concursos/editais, testes, **índices mínimos informados por você** (nenhum índice oficial é embutido), metas individuais, painel por atleta e histórico.
- Mensagens: orientações, avisos, comentários; notificação automática de novas planilhas/treinos.

**Atleta**: treinos do dia e da semana, registro do treino realizado (distância, tempo, ritmo calculado, esforço 1–10, observações, situação), histórico, gráficos de evolução, marcas, painel TAF (somente leitura), calendário próprio, mensagens.

## Início rápido

1. Configure o Supabase: **`docs/GUIA_SUPABASE.md`** (onde rodar cada script SQL, autorizar o seu e-mail de professor, URLs de redirecionamento).
2. Rode localmente ou publique: **`docs/PUBLICACAO.md`**.

```bash
npm install
cp .env.example .env      # VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY
npm run dev
```

## Estrutura

```
src/
  components/     UI reutilizável (ui/), formulários, gráficos, calendário, painel TAF, relatório, conversa
  pages/          auth/, professor/, athlete/
  layouts/        AppShell (menu lateral/gaveta/abas), ProfessorLayout, AthleteLayout
  contexts/       Auth, Theme (claro/escuro), Toast
  hooks/          useAsync, usePWA (instalação e atualização)
  services/       acesso a dados (athletes, training, results, taf, communication)
  integrations/supabase/client.ts
  types/  utils/ (formatação, TAF, relatórios, PDF)  styles/
supabase/migrations/   001 tabelas • 002 funções/triggers • 003 RLS
supabase/seed_demo.sql dados fictícios opcionais (marcados como EXEMPLO)
public/                manifest.json, sw.js, ícones
.github/workflows/     deploy.yml (testes + build + Pages)
scripts/               test-rls.mjs (testa o SQL/RLS), generate-icons.mjs
```

## Segurança (como funciona de fato)

- **RLS em todas as tabelas.** Professor só acessa linhas com seu `professor_id`; atleta só lê o que é seu e só escreve seus registros de treino, marcas, comentários e "lida" nas mensagens. `anon` não tem acesso a nada.
- **Papéis definidos no banco**, nunca pelo navegador. O cadastro público só funciona para e-mails em `professor_allowlist` (professor) ou cadastrados por um professor (atleta); qualquer outro é recusado por um trigger.
- Triggers impedem alterar papel/e-mail do perfil, trocar o dono de um atleta e apontar registros para dados de outro professor.
- Observações do professor ficam em tabela separada (`athlete_notes`) sem política de leitura para atleta.
- Só a URL e a *Publishable key* vão para o frontend. Nunca use a *Secret/service_role key*.
- Validação de formulários (zod + regras próprias), tratamento de erros com mensagens claras, rotas protegidas por papel (a proteção real é o RLS).

## Testes e verificação

```bash
npm test          # 11 testes unitários (formatação, TAF, relatórios)
npm run build     # typecheck + build
# RLS/SQL num Postgres local (não toca no seu Supabase):
npm i --no-save @electric-sql/pglite && node scripts/test-rls.mjs
```

O que foi verificado ao entregar: build e testes passando; 39 verificações de SQL/RLS num Postgres local (isolamento entre atletas e entre professores, cadastro bloqueado para e-mail não autorizado, escalada de privilégio bloqueada, funções `assign_sheet`/`copy_week`, TAF, mensagens, notas privadas); todas as telas de professor e atleta abertas em navegador real (Chromium) sem erros de execução e sem rolagem horizontal em 390 px; recarregar a página em rota interna funciona (HashRouter).

## Limitações — leia

- **Conexão com o Supabase real não foi testada** por quem gerou o projeto (sem acesso à rede do seu projeto nem à Publishable key). A interface foi testada com o Supabase simulado e o SQL, num Postgres local. Faça o primeiro teste ponta a ponta: criar professor → cadastrar atleta → criar a conta do atleta em "Primeiro acesso" → atribuir uma planilha → registrar treino.
- **Recuperação de senha**: depende das URLs de redirecionamento do Supabase e (por usar PKCE) o link precisa ser aberto **no mesmo navegador** em que foi pedido. Teste uma vez após publicar.
- **Contas de atletas**: o professor cadastra o e-mail e o atleta define a própria senha em "Primeiro acesso" (o professor não vê nem define senhas).
- **Atleta inativo** continua conseguindo entrar (a situação serve para organização e filtros). Para bloquear o acesso de fato, remova o usuário em Authentication → Users. Excluir um atleta no app apaga os dados dele, mas não o usuário de login.
- **PDF**: contém indicadores e tabelas (sem imagens dos gráficos).
- **Mensagens/notificações** são dentro do app (atualizam a cada 30–60 s e ao voltar à aba); não há notificação push nem e-mail.
- **Offline**: o app abre offline, mas todos os dados exigem internet.
- Escala: consultas paginam automaticamente (limite de 1.000 linhas do Supabase), mas não houve teste de carga com centenas de atletas.
- Calendário do professor mostra os treinos de todos os atletas em contagem por dia; use o filtro por atleta para ver o detalhe.
- Não há publicação nas lojas de aplicativos: o objetivo é uma PWA instalável.
