# Plataforma de comparação de Virtual Offices — Especificação de produto e arquitetura

**Data:** 19 de agosto de 2026  
**Status:** desenho aprovado; aguardando revisão da especificação escrita  
**Idioma do produto no MVP:** inglês  
**Mercado inicial:** Flórida, Estados Unidos

## 1. Resumo

O produto será uma plataforma editorial e comparativa para pessoas que procuram Virtual Offices nos Estados Unidos. O MVP atenderá pequenas empresas, profissionais remotos e autônomos que buscam presença comercial ou separação entre o endereço residencial e o profissional.

A plataforma começará por Orlando, Tampa, Fort Lauderdale, Miami e Boca Raton. Ela comparará Regus, Opus Virtual Offices, Alliance Virtual Offices e Davinci Virtual quando houver oferta local verificável.

O diferencial do produto é resolver a ambiguidade da expressão “Virtual Office”. O mercado usa o mesmo termo para produtos diferentes: algumas ofertas são centradas em endereço e correspondência; outras incluem telefone e recepcionista; outras combinam os dois. A plataforma primeiro identifica a necessidade do usuário e só então compara ofertas funcionalmente equivalentes.

O modelo de receita será baseado em links afiliados. A relação comercial permanecerá tecnicamente isolada do domínio editorial e não poderá influenciar notas, pesos ou posições.

## 2. Objetivos

### 2.1 Objetivo do usuário

Permitir que uma pessoa:

1. Escolha uma cidade.
2. Entenda qual tipo de serviço procura.
3. Compare custos, inclusões, adicionais e limitações.
4. Receba uma recomendação explicável.
5. Acesse o provedor escolhido sem entregar dados pessoais à plataforma.

### 2.2 Objetivo do negócio

Gerar cliques afiliados qualificados por meio de comparações confiáveis, conteúdo orgânico útil e uma experiência que esclareça diferenças normalmente ocultas pela terminologia comercial dos provedores.

### 2.3 Métrica principal

A métrica principal será `qualified affiliate click`: um clique de saída realizado depois que o usuário escolheu uma cidade, identificou uma necessidade e visualizou resultados compatíveis.

### 2.4 Princípios

- Comparar produtos equivalentes antes de comparar preços.
- Explicar a recomendação, não apenas exibir uma nota.
- Separar fatos, análise editorial e monetização.
- Tratar desconhecido como desconhecido.
- Tornar fontes, atualização e metodologia visíveis.
- Não coletar dados pessoais quando eles não forem necessários.
- Não publicar mudanças de dados sem revisão humana.

## 3. Público inicial

O MVP prioriza:

- Pequenas empresas americanas buscando presença comercial em uma cidade da Flórida.
- Profissionais remotos e autônomos que querem privacidade e separação entre endereço pessoal e profissional.

Empreendedores estrangeiros, grandes empresas, compradores de múltiplas localidades e usuários que precisam de orientação jurídica personalizada não são o público prioritário do MVP.

## 4. Definição modular de Virtual Office

A plataforma não imporá uma única definição do termo. Ela modelará Virtual Office como uma composição de recursos.

### 4.1 Endereço e correspondência

- Business address.
- Mail receiving.
- Mail forwarding.
- Mail scanning.
- Local mail pickup.

### 4.2 Comunicação e operação

- Live receptionist.
- Business phone number.
- Call forwarding.
- Appointment scheduling.
- Business email.
- Administrative support.

### 4.3 Espaço e presença física

- Meeting rooms.
- Coworking access.
- Private office or day-office access.
- Reception or guest handling at the location.

### 4.4 Compliance e serviços relacionados

- Registered agent service.
- Company formation or registration assistance.

Registered agent é sempre tratado como serviço distinto de business address, mesmo quando vendido pelo mesmo provedor ou no mesmo checkout.

### 4.5 Estados de um recurso

Cada recurso de um plano terá exatamente um dos seguintes estados:

- `included`: incluído no preço-base.
- `paid_add_on`: disponível por custo adicional.
- `usage_based`: cobrado conforme uso.
- `not_available`: confirmado como indisponível.
- `not_confirmed`: não foi possível confirmar.

Um adicional nunca será apresentado como incluído. Ausência de evidência nunca será convertida automaticamente em indisponibilidade.

## 5. Três trilhas de comparação

### 5.1 Business Address & Mail

Para usuários que precisam de presença local, privacidade e gestão de correspondência.

### 5.2 Live Receptionist & Phone

Para usuários que priorizam atendimento humano, número comercial, encaminhamento e operação telefônica. Essa trilha poderá conter diferenças menos dependentes da cidade; a localização só influenciará o resultado quando afetar número local, disponibilidade ou preço.

### 5.3 Full Virtual Office

Para usuários que precisam de endereço e correspondência combinados com telefone e recepcionista.

### 5.4 Entrada “I’m not sure”

O usuário que não souber escolher responderá a perguntas curtas sobre:

- Necessidade de um endereço público.
- Recebimento de correspondência.
- Existência de chamadas comerciais não atendidas.
- Necessidade de uma pessoa atender em nome da empresa.
- Uso eventual de salas ou espaço.

As respostas determinam uma das três trilhas. Elas não criam um perfil permanente.

## 6. Jornada do usuário

```text
Choose city
→ identify primary need
→ answer optional refinement questions
→ view matched ranking
→ compare qualifying plans and locations
→ understand evidence and limitations
→ follow disclosed outbound link
```

O usuário também poderá entrar por um guia ou review:

```text
Guide → understands the category → chooses a city → compares
Provider review → sees local availability → opens city comparison
```

Não haverá cadastro, formulário de lead, checkout nem contratação dentro da plataforma.

## 7. Arquitetura de informação

```text
Home
├── Florida hub
│   ├── Orlando
│   ├── Tampa
│   ├── Fort Lauderdale
│   ├── Miami
│   └── Boca Raton
├── Provider reviews
│   ├── Regus
│   ├── Opus Virtual Offices
│   ├── Alliance Virtual Offices
│   └── Davinci Virtual
├── Guides
├── Methodology
├── Affiliate disclosure
├── Privacy policy
└── Corrections process
```

### 7.1 Página de cidade

A ordem recomendada é:

1. Contexto da cidade, cobertura e data de verificação.
2. Pergunta “What do you need most?”.
3. Resultados correspondentes à trilha.
4. Filtros adicionais.
5. Comparação de planos, custos e recursos.
6. Localizações por provedor.
7. Explicação de endereço, recepcionista e pacote completo.
8. Análise dos provedores.
9. Perguntas frequentes e guias relacionados.

Os resultados mostram o plano ou conjunto comprável que sustenta a posição do provedor. A página nunca combina benefícios de produtos incompatíveis como se fizessem parte de uma única oferta.

### 7.2 Review do provedor

Cada review explica:

- Modelo de produto.
- Cobertura.
- Estrutura de cobrança.
- Pontos fortes verificáveis.
- Limitações.
- Perfis adequados.
- Relação entre endereço, telefone e espaço.
- Links para as cidades onde há dados confirmados.

Preços locais permanecem nas páginas de cidade e são derivados dos dados estruturados.

## 8. Inventário editorial do MVP

### 8.1 Páginas comerciais

- Virtual Offices in Miami.
- Virtual Offices in Orlando.
- Virtual Offices in Tampa.
- Virtual Offices in Fort Lauderdale.
- Virtual Offices in Boca Raton.

### 8.2 Reviews

- Regus Review.
- Opus Virtual Offices Review.
- Alliance Virtual Offices Review.
- Davinci Virtual Review.

### 8.3 Guias iniciais

- What Is a Virtual Office?
- Business Address vs. Virtual Office.
- Business Address vs. Registered Agent.
- Mail Handling vs. Live Receptionist.
- Hidden Fees in Virtual Office Plans.
- Can You Use a Virtual Office Address for Your Business?
- How to Choose a Virtual Office in Florida.
- Virtual Office Checklist for Freelancers and Small Businesses.

Não serão geradas páginas para toda combinação possível de provedor, bairro e cidade. Uma página só será publicada quando houver conteúdo próprio e dados suficientes para responder a uma intenção distinta.

## 9. Modelo de dados conceitual

### 9.1 Provider

Representa a empresa e sua identidade editorial.

Campos conceituais:

- Identificador estável.
- Nome e slug.
- Site público.
- Descrição factual.
- Fontes gerais.
- Data da última revisão editorial.

Provider não contém programa afiliado, comissão, receita nem link rastreado.

### 9.2 Location

Representa um endereço físico comercializado por um provedor.

- Identificador estável.
- `providerId`.
- Cidade e estado.
- Endereço.
- Bairro ou área, quando útil.
- Tipo de prédio ou espaço, quando confirmado.
- Recursos físicos confirmados.
- Estado de disponibilidade.
- Evidências.

### 9.3 Plan

Representa um produto comprável.

- Identificador estável.
- `providerId`.
- Localizações aplicáveis.
- Nome comercial.
- Trilha ou trilhas elegíveis.
- Preço-base.
- Unidade e frequência de cobrança.
- Taxas obrigatórias.
- Depósito.
- Promoção e validade, quando houver.
- Prazo mínimo.
- Renovação.
- Cancelamento.
- Recursos e respectivos estados.
- Limites de uso.
- Evidências.

### 9.4 Evidence

- Identificador.
- Entidade e campo sustentados.
- URL.
- Data e horário da coleta.
- Valor observado.
- Trecho de suporte ou referência equivalente.
- Método de verificação.
- Nível de confiança: `high`, `medium` ou `low`.

### 9.5 Editorial assessment

- Perfil recomendado.
- Vantagens.
- Limitações.
- Explicação da recomendação.
- Autor ou revisor.
- Data da revisão.

Textos editoriais não são reescritos automaticamente quando um valor factual muda.

### 9.6 AffiliateLinks

Configuração comercial separada:

- `providerId`.
- Destino.
- Parâmetros de rastreamento.
- Estado ativo.
- Rótulo de disclosure.

Essa configuração só pode ser consultada pela camada de redirecionamento. O domínio de ranking recebe uma representação de dados que não contém campos comerciais.

## 10. Normalização de preço

A interface distingue:

- `advertisedBasePrice`: preço anunciado.
- `mandatoryUpfrontFees`: taxas iniciais obrigatórias.
- `mandatoryRecurringFees`: cobranças recorrentes obrigatórias fora do preço-base.
- `estimatedFirstMonthCost`: custo inicial verificável.
- `estimatedRecurringCost`: custo recorrente verificável.
- `optionalAddOns`: custos opcionais.
- `usageBasedFees`: custos dependentes de uso.
- `promotion`: desconto temporário e condições.

Quando um custo depender de volume ou cotação, a interface não inventará uma estimativa. Ela mostrará “usage-based”, “quote required” ou explicação equivalente.

Na trilha Full Virtual Office, componentes separados podem ser somados apenas quando forem comprovadamente compráveis juntos para o mesmo cliente e provedor. A composição será exibida explicitamente.

## 11. Elegibilidade e rankings

### 11.1 Elegibilidade básica

Uma oferta de Business Address & Mail precisa incluir business address e mail receiving.

Uma oferta de Live Receptionist & Phone precisa incluir atendimento humano e um meio verificável de receber ou encaminhar chamadas comerciais.

Uma oferta Full Virtual Office precisa satisfazer simultaneamente os requisitos das duas trilhas, em um plano ou composição comprável e claramente apresentada.

Uma oferta só recebe posição numérica quando existem dados suficientes para calcular todas as dimensões da trilha sem transformar desconhecidos em zero. Ofertas incompletas aparecem como “Insufficient verified data”.

### 11.2 Business Address & Mail

- Custo total comparável: 30%.
- Gestão de correspondência: 25%.
- Endereço e conveniência local: 20%.
- Flexibilidade contratual: 15%.
- Transparência e evidências: 10%.

### 11.3 Live Receptionist & Phone

- Custo total e franquia de minutos: 30%.
- Escopo do atendimento humano: 25%.
- Recursos telefônicos e encaminhamento: 20%.
- Flexibilidade contratual: 15%.
- Transparência e evidências: 10%.

### 11.4 Full Virtual Office

- Custo total do pacote: 25%.
- Endereço e correspondência: 20%.
- Telefone e live receptionist: 20%.
- Contrato e flexibilidade: 15%.
- Workspace e presença local: 10%.
- Transparência e evidências: 10%.

### 11.5 Overall provider rating

Esse ranking é secundário e avalia o provedor como plataforma, não como recomendação universal:

- Valor da linha de produtos: 25%.
- Cobertura das três necessidades: 20%.
- Flexibilidade: 15%.
- Presença e opções locais: 15%.
- Transparência e verificabilidade: 25%.

O ranking geral é calculado por cidade quando depende da presença local. Reviews nacionais podem resumir capacidades, mas não reutilizam uma nota local como se fosse universal.

### 11.6 Regras comuns

- Pesos ficam em configuração editorial versionada.
- Comissão e desempenho comercial são inacessíveis ao cálculo.
- Cada resultado aponta para a oferta que sustenta a nota.
- Promoções são distinguidas do preço regular.
- `not_confirmed` não pontua e não equivale a `not_available`.
- Resultados muito próximos são descritos como alternativas próximas; a explicação prevalece sobre falsa precisão decimal.
- A metodologia e sua versão são públicas.

## 12. Explicabilidade

Cada recomendação deverá responder:

- Para qual necessidade ela foi calculada?
- Qual plano ou composição foi usado?
- Qual custo foi considerado?
- Quais são as principais vantagens?
- Qual é a limitação mais relevante?
- Quais recursos são adicionais?
- Quando os dados foram verificados?

Exemplos de rótulos aceitáveis:

- “Best verified value for address and mail.”
- “Best match for businesses that need live call answering.”
- “Lowest verified recurring cost, but mail forwarding costs extra.”

Rótulos vagos ou não comprováveis, como “most trusted”, não serão usados.

## 13. Arquitetura do sistema

### 13.1 Apresentação

Uma aplicação Next.js renderiza:

- Páginas editoriais.
- Hubs e páginas de cidade.
- Questionário.
- Resultados e filtros.
- Tabelas comparativas.
- Detalhes de planos e localizações.
- Disclosures e redirecionamentos.

### 13.2 Domínio editorial

Módulos independentes cuidam de:

- Consulta ao catálogo.
- Normalização e composição de preços.
- Elegibilidade.
- Pontuação das três trilhas.
- Overall provider rating.
- Explicações de recomendação.

Esses módulos são puros e determinísticos: a mesma entrada produz a mesma saída.

### 13.3 Conteúdo versionado

O GitHub é a fonte aprovada para:

- Dados estruturados.
- Evidências publicáveis ou seus metadados.
- Avaliações editoriais.
- Reviews e guias.
- Configuração versionada da metodologia.

### 13.4 Fronteira comercial

`affiliateLinks` pertence a um módulo separado. Uma regra de dependência impede que módulos editoriais importem configurações comerciais. Se um provedor não tiver link afiliado, a saída aponta para sua página pública normal.

### 13.5 Publicação

```text
Approved repository state
→ schema and content checks
→ ranking tests
→ production build
→ deploy
```

No MVP inicial, dados podem ser pesquisados e inseridos manualmente. A automação n8n será implementada depois que o site, schemas e metodologia estiverem estabilizados.

## 14. Confiança e transparência

### 14.1 Fatos e análise

- Dados estruturados contêm fatos comparáveis.
- Editorial assessments contêm interpretação.
- AffiliateLinks contêm configuração comercial.

Uma camada não pode se passar por outra.

### 14.2 Datas

- “Last checked” indica a última verificação da fonte.
- “Last updated” indica a última alteração publicada.

Uma verificação sem mudança não altera artificialmente a data editorial.

### 14.3 Afirmações sensíveis

Afirmações sobre registro empresarial, banco, licenciamento, Google Business Profile, correspondência oficial ou registered agent exigem fonte específica e revisão humana. Quando a resposta depender da empresa, atividade ou jurisdição, a página explica a limitação e orienta o usuário a confirmar com o órgão ou profissional apropriado.

O produto não oferece aconselhamento jurídico.

### 14.4 Afiliados

O disclosure aparece:

- Antes ou junto do primeiro conjunto de resultados comerciais.
- Próximo aos botões de saída relevantes.
- Na metodologia.
- Em página própria.

Os textos finais de disclosure, privacidade e limitações jurídicas passam por revisão jurídica antes do lançamento.

### 14.5 Correções

Páginas oferecem um caminho para reportar erro. Uma correção exige evidência, revisão e publicação pelo mesmo processo editorial das demais mudanças.

## 15. Analytics e privacidade

### 15.1 Eventos

- `city_page_viewed`.
- `need_selected`.
- `ranking_viewed`.
- `comparison_opened`.
- `provider_location_viewed`.
- `affiliate_link_clicked`.
- `methodology_viewed`.
- `guide_to_city_clicked`.

Propriedades permitidas incluem cidade, trilha, provedor, plano, posição apresentada e contexto da página.

### 15.2 Limites

O MVP não coleta nome, e-mail, telefone nem respostas em um perfil central. Estado temporário do comparador pode permanecer na URL ou no navegador. A medição deve ser mínima, agregada, documentada e sujeita a retenção limitada e revisão jurídica.

### 15.3 Métricas secundárias

- Tráfego orgânico por cidade e guia.
- Seleção de necessidade.
- Conclusão do comparador.
- Uso por trilha.
- Abertura da metodologia.
- Cliques por página e contexto.
- Navegação de guias para páginas de cidade.
- Receita agregada reportada pelos programas afiliados.

Receita e conversão não podem alimentar rankings.

## 16. Experimentação

Pode ser testado:

- Texto das perguntas.
- Explicação das trilhas.
- Hierarquia e legibilidade da tabela.
- Visibilidade da metodologia.
- Clareza de custos, taxas e limitações.
- Texto e posição de chamadas para ação.

Não pode ser testado:

- Favorecimento de provedor por comissão.
- Reordenação editorial para maximizar receita.
- Ocultação de limitações.
- Redução da visibilidade do disclosure.
- Uso de desempenho afiliado na pontuação.

## 17. Tratamento de erros

- Schema inválido impede publicação.
- Referência inexistente entre plano, localização e provedor impede publicação.
- Oferta sem dados essenciais fica fora do ranking numerado.
- Campo desconhecido permanece `not_confirmed`.
- Promoção sem condições suficientes não substitui preço regular.
- Link afiliado ausente usa link público.
- Fonte indisponível não apaga dados aprovados.
- Erros de cálculo interrompem o build.
- Links quebrados são sinalizados antes do merge.
- Nenhum erro pode expor tokens, credenciais ou dados internos de afiliação.

## 18. Validação e testes

### 18.1 Dados

- Schemas e campos obrigatórios.
- Identificadores únicos.
- Relações entre entidades.
- Formato de datas, moedas, frequências e URLs.
- Coerência entre recursos e estados.

### 18.2 Domínio

- Elegibilidade por trilha.
- Normalização de preço.
- Composição permitida de pacotes.
- Pesos totalizando 100%.
- Ordenação determinística.
- Tratamento de desconhecidos.
- Explicações correspondentes aos fatores reais.

### 18.3 Independência editorial

- Módulos de ranking não importam `affiliateLinks`.
- Entradas de ranking não contêm comissão, receita ou conversão.
- Ausência de afiliação não remove provedor elegível.

### 18.4 Interface

- Jornada completa em desktop e celular.
- Navegação por teclado e acessibilidade essencial.
- Tabelas compreensíveis em telas pequenas.
- Disclosure visível.
- Datas, limitações e adicionais legíveis.
- Links e build de produção válidos.

## 19. Escopo do MVP

### 19.1 Incluído

- Aplicação Next.js em inglês.
- Home e Florida hub.
- Cinco páginas de cidade.
- Três trilhas de comparação.
- Overall provider rating secundário.
- Quatro reviews.
- Oito guias iniciais.
- Metodologia, affiliate disclosure, privacidade e correções.
- Dados e conteúdo versionados.
- AffiliateLinks isolados.
- Analytics mínimos.
- Preview e validações pré-publicação.

### 19.2 Adiado

- Automação executável no n8n.
- Versão em português.
- Expansão nacional.
- Contas e perfis.
- Formulários e venda de leads.
- Checkout interno.
- Reviews de usuários.
- Chat com IA.
- Painel administrativo próprio.
- Publicação sem aprovação.
- Orientação jurídica personalizada.

## 20. Critérios de aceite do MVP

O MVP é aceito quando um usuário consegue:

1. Escolher uma das cinco cidades.
2. Identificar uma das três necessidades, com ajuda quando necessário.
3. Entender por que ofertas chamadas de Virtual Office não são necessariamente equivalentes.
4. Ver custos iniciais, recorrentes, adicionais e condições conhecidas.
5. Comparar os quatro provedores quando houver oferta local confirmada.
6. Entender por que cada recomendação foi feita.
7. Consultar fonte, data e metodologia.
8. Abrir uma oferta por link claramente identificado.
9. Completar a jornada em desktop ou celular sem fornecer dados pessoais.

O produto também precisa passar pelos testes descritos na Seção 18 e produzir um build de produção válido.

## 21. Automação n8n como fase final

A automação será abordada somente depois da implementação e estabilização do MVP. Ela terá três responsabilidades:

1. Pesquisar e coletar dados.
2. Normalizar, comparar e validar.
3. Propor atualização por branch e pull request.

A aprovação ocorrerá fora do n8n, no GitHub. A automação não aprova, não faz merge e não publica.

O desenho conceitual detalhado está em [`docs/n8n-comparison-automation-concept.md`](../../n8n-comparison-automation-concept.md).

## 22. Referências de orientação

- [FTC Endorsement Guides: What People Are Asking](https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking)
- [GitHub REST API: Repository contents](https://docs.github.com/en/rest/repos/contents)
- [GitHub REST API: Pull requests](https://docs.github.com/en/rest/pulls/pulls)
- [GitHub protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [n8n documentation](https://docs.n8n.io/)

Estas referências apoiam princípios de divulgação e possibilidades operacionais. Elas não substituem revisão jurídica, termos de uso dos provedores nem decisões técnicas da implementação.

