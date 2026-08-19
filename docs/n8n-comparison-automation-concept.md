# Automação de atualização dos comparativos com n8n

## Propósito

Esta automação tem como objetivo manter atualizados os dados usados pela plataforma para comparar provedores de Virtual Office nos Estados Unidos. No MVP, ela acompanhará Regus, Opus Virtual Offices, Alliance Virtual Offices e Davinci Virtual nas cidades de Orlando, Tampa, Fort Lauderdale, Miami e Boca Raton.

A automação deve detectar mudanças nas ofertas dos provedores, transformar informações comerciais diferentes em uma estrutura comparável e propor alterações auditáveis no repositório do site. Ela não deve decidir sozinha o que será publicado.

O princípio central é:

> O n8n pesquisa, estrutura e propõe. Uma pessoa revisa e aprova. O site publica apenas conteúdo aprovado.

## Resultado esperado

Ao concluir uma execução bem-sucedida, a automação deverá produzir um pull request no GitHub contendo:

- Os arquivos estruturados que precisam ser atualizados.
- A diferença entre os valores publicados e os valores encontrados.
- As fontes e evidências que sustentam cada mudança.
- A data e o horário da coleta.
- O grau de confiança de cada extração.
- Alertas sobre dados ausentes, contraditórios ou ambíguos.
- A relação de páginas, comparações e rankings potencialmente afetados.

O pull request é uma proposta editorial, não uma autorização de publicação.

## Escopo funcional

A automação deverá acompanhar, quando disponíveis:

- Provedores e localizações.
- Endereços oferecidos em cada cidade.
- Planos e nomes comerciais.
- Preços recorrentes e períodos de cobrança.
- Taxas de ativação, depósitos e outros custos obrigatórios.
- Prazo mínimo, renovação e cancelamento.
- Serviços incluídos, adicionais, cobrados por uso ou indisponíveis.
- Limites de correspondência, chamadas, minutos e uso de espaço.
- Promoções temporárias e respectivas condições.
- URLs de contratação ou consulta pública.

Os serviços comparáveis incluem:

- Business address.
- Mail receiving.
- Mail forwarding.
- Mail scanning.
- Local mail pickup.
- Live receptionist.
- Business phone number.
- Call forwarding.
- Appointment scheduling.
- Business email.
- Meeting rooms.
- Coworking access.
- Administrative support.
- Registered agent service.

Registered agent deve permanecer conceitualmente separado de business address, mesmo quando ambos forem vendidos pelo mesmo provedor.

## O que a automação não fará

A automação não deverá:

- Aprovar ou fazer merge de pull requests.
- Publicar diretamente no ambiente de produção.
- Alterar a proteção da branch principal.
- Modificar pesos ou regras editoriais de ranking.
- Acessar links, comissões ou resultados de programas afiliados.
- Usar receita ou desempenho comercial para influenciar recomendações.
- Transformar ausência de informação em `not_available`.
- Fazer afirmações legais sobre o uso de um endereço sem evidência específica e revisão humana.
- Substituir dados confirmados por valores vazios devido a uma falha de coleta.

## Fronteiras de responsabilidade

O processo possui quatro etapas principais:

```text
1. Research & collect        -> n8n
2. Normalize & validate      -> n8n
3. Propose repository update -> n8n
4. Review & approve          -> pessoa no GitHub
```

Após o merge aprovado, a plataforma de hospedagem poderá executar o build e o deploy automaticamente. Essa publicação pós-merge não depende de uma decisão tomada pelo n8n.

## Etapa 1: pesquisa e coleta

O n8n executará workflows separados por provedor. Essa separação reduz o impacto de mudanças no layout ou funcionamento de um único site.

Cada coleta deverá registrar:

- `providerId`.
- URL consultada.
- Data e horário da consulta.
- Cidade e localização relacionadas, quando aplicável.
- Conteúdo relevante encontrado.
- Método usado para obter o conteúdo.
- Status da resposta.
- Identificador da execução do workflow.

Quando uma página não puder ser acessada, a execução deve registrar a falha e preservar os dados publicados anteriormente.

## Etapa 2: normalização, comparação e validação

Os dados coletados serão transformados para a taxonomia comum da plataforma. Cada recurso deverá receber um dos seguintes estados:

- `included`: incluído no preço-base do plano.
- `paid_add_on`: disponível por preço adicional definido ou consultável.
- `usage_based`: cobrado conforme consumo.
- `not_available`: confirmado como indisponível.
- `not_confirmed`: não foi possível confirmar com as evidências disponíveis.

Valores monetários deverão preservar:

- Moeda.
- Unidade de cobrança.
- Frequência.
- Condições promocionais.
- Custos obrigatórios adicionais.
- Data de validade conhecida.

Depois da normalização, o n8n comparará o resultado com a versão atual dos arquivos no GitHub. Uma mudança só será proposta quando houver diferença material entre o dado publicado e o dado coletado.

### Validações mínimas

Antes de criar uma proposta, o workflow deve verificar:

- Presença dos identificadores obrigatórios.
- Relacionamento válido entre provedor, localização e plano.
- Formato de preços, datas e URLs.
- Existência de evidência para campos alterados.
- Coerência entre preço-base, adicionais e custo total calculado.
- Ausência de combinação indevida de recursos pertencentes a planos diferentes.
- Cobertura mínima de dados para qualquer ranking afetado.

Mudanças ambíguas deverão ser marcadas para revisão, não resolvidas por suposição.

## Etapa 3: proposta de atualização no GitHub

Quando houver alterações válidas, o n8n deverá:

1. Criar uma branch com nome identificável e único.
2. Atualizar somente os arquivos necessários.
3. Adicionar ou atualizar as evidências da execução.
4. Executar ou solicitar as validações disponíveis.
5. Abrir um pull request contra a branch principal.
6. Preencher o pull request com um resumo adequado para revisão humana.

### Conteúdo esperado no pull request

O resumo deverá apresentar:

- Provedor e cidades afetados.
- Valores anteriores e propostos.
- Serviços adicionados, removidos ou reclassificados.
- Links para as fontes.
- Nível de confiança.
- Falhas parciais ocorridas durante a coleta.
- Rankings e páginas potencialmente alterados.
- Checklist de revisão humana.

Alterações de alta confiança ainda exigem aprovação humana.

## Etapa 4: revisão e aprovação humana

A revisão acontecerá no GitHub, fora do n8n. A branch principal deverá exigir pull request, testes aprovados e pelo menos uma aprovação humana antes do merge.

Exigem atenção explícita do revisor:

- Mudanças de preço ou taxa.
- Mudanças contratuais.
- Endereços adicionados, removidos ou alterados.
- Mudanças entre `included` e qualquer outra classificação.
- Afirmações relacionadas a registro empresarial, licenciamento, banco, Google Business Profile ou registered agent.
- Mudanças capazes de alterar a ordem de um ranking.
- Evidências de baixa confiança ou fontes contraditórias.

O merge representa a autorização editorial para publicação. Se novos commits forem adicionados após uma aprovação, uma nova revisão deverá ser exigida.

## Independência editorial e afiliação

Os dados de afiliação ficarão em uma configuração separada, como `affiliateLinks`. Essa configuração não fará parte dos dados de Provider e não poderá ser acessada pelo algoritmo de ranking nem pelos workflows de pesquisa e normalização.

O n8n não deverá receber credenciais ou dados sobre:

- Percentuais e valores de comissão.
- Receita por provedor.
- Taxa de conversão de links afiliados.
- Campanhas comerciais usadas para favorecer um provedor.

Somente a camada responsável pelo redirecionamento do usuário consultará a configuração de links afiliados.

## Evidência e confiança

Cada alteração proposta deverá apontar para uma evidência. Conceitualmente, uma evidência contém:

```yaml
evidenceId: unique-id
providerId: provider-id
sourceUrl: https://example.com/source
collectedAt: 2026-08-18T00:00:00Z
workflowExecutionId: n8n-execution-id
extractionMethod: structured-data-or-page-content
field: recurringPrice
observedValue: 99
supportingExcerpt: relevant source fragment
confidence: high
```

Os níveis de confiança poderão ser:

- `high`: valor explícito e diretamente associado ao plano correto.
- `medium`: valor extraído com contexto suficiente, mas com alguma ambiguidade.
- `low`: associação incompleta, conteúdo contraditório ou inferência necessária.

Baixa confiança nunca autoriza publicação automática e deve receber destaque no pull request.

## Tratamento de erros

O processo deverá falhar de forma segura:

- Uma falha em um provedor não interrompe obrigatoriamente os demais.
- Uma página indisponível não apaga dados existentes.
- Uma mudança de layout gera alerta de extração.
- Um preço fora de uma faixa plausível recebe revisão obrigatória.
- Uma execução repetida com os mesmos dados não cria outro pull request.
- Duas execuções concorrentes não devem sobrescrever a mesma atualização.
- Credenciais e tokens nunca aparecem em logs, arquivos de evidência ou pull requests.

Falhas devem permanecer visíveis no histórico de execução do n8n e gerar uma notificação operacional quando impedirem a atualização de um provedor ou cidade.

## Segurança e permissões

A credencial do GitHub usada pelo n8n deverá seguir privilégio mínimo. Ela poderá criar branches, commits e pull requests, mas não poderá:

- Fazer merge.
- Enviar alterações diretamente para a branch principal.
- Administrar o repositório.
- Alterar rulesets ou proteção de branches.
- Aprovar a própria alteração.

A branch principal deverá bloquear bypass da automação e exigir verificações antes do merge.

## Observabilidade

Cada execução deverá permitir responder:

- Quando cada fonte foi consultada pela última vez?
- Quais páginas falharam?
- Quais valores mudaram?
- Qual workflow e execução produziram a mudança?
- Que evidência sustenta cada campo?
- Quem aprovou a atualização?
- Quando a alteração foi publicada?

O Git registra o histórico editorial aprovado; o n8n registra o histórico operacional da coleta e transformação.

## Critérios de sucesso

A automação será considerada confiável quando:

- Detectar mudanças reais sem publicar automaticamente.
- Produzir propostas compreensíveis para revisão humana.
- Preservar a origem de cada dado alterado.
- Evitar alterações duplicadas ou destrutivas.
- Manter dados de afiliação fora do domínio editorial.
- Permitir recuperar o estado anterior pelo histórico do Git.
- Reduzir o trabalho manual sem remover a responsabilidade editorial.

## Implementação futura no n8n

Este documento define a intenção e as fronteiras, mas não prescreve ainda os nodes, credenciais, expressões ou frequência final dos workflows.

Na etapa de implementação, deverão ser definidos:

- Onde o n8n será hospedado.
- Frequência de execução por provedor.
- Método de coleta permitido para cada fonte.
- Formato definitivo dos arquivos de dados e evidências.
- Credencial de menor privilégio para o GitHub.
- Estratégia de idempotência e controle de concorrência.
- Limites e critérios numéricos para confiança e anomalias.
- Canal de notificação para falhas e pull requests criados.
- Políticas aplicáveis aos termos de uso, robots.txt e limites de acesso de cada fonte.

Essas decisões serão transformadas em um plano técnico antes da configuração dos workflows no n8n.

## Referências

- [n8n documentation](https://docs.n8n.io/)
- [GitHub REST API: repository contents](https://docs.github.com/en/rest/repos/contents)
- [GitHub REST API: pull requests](https://docs.github.com/en/rest/pulls/pulls)
- [GitHub protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [FTC Endorsement Guides: What People Are Asking](https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking)

