---
title: "Experiência"
lang: pt
---

<!--
  The heading carries `id="experience"` explicitly: the home scene labels its
  experience section with `aria-labelledby="experience"` and the header and
  scene navigator link to `#experience`, so the anchor must survive the
  translation. `## Experiência` would slug to `experiência`.
-->
<h2 id="experience">Experiência</h2>

### Maggu — Remoto  
**Engenheiro de IA de Dados** · abr. 2026 – ago. 2026

- **Avaliação de LLM**  
  Subi a precisão da recomendação de medicamentos de 62% para 94% trocando um juiz LLM ingênuo por dois agentes adversariais apoiados num dataset feito à mão no MLflow, sobre Databricks.

- **Observabilidade e latência**  
  Acompanhei custo, latência, precisão e roteamento de saída dos LLMs no Databricks MLflow. Refiz o cache e o RAG para cortar o tempo até o primeiro token de 1.5 para 0.7 segundos.

- **Infraestrutura de dados e performance**  
  Provisionei pipelines reproduzíveis no Databricks com Terraform. Reduzi o upload no PostgreSQL de 2 horas para 15 minutos com batching e oito threads de upload; e cortei o gasto de compute no Databricks de $3.21 para $0.80 por DBU-hora otimizando particionamento, joins e arquivos pequenos no PySpark.

_Tecnologias: Databricks, PySpark, Delta Lake, MLflow, Terraform, Agno, GitHub Actions._

---

### Capgemini — Recife, Brasil (Híbrido)  
**Engenheiro de IA de Dados · contrato temporário** · jan. 2026 – abr. 2026

- **Avaliação de agentes**  
  Montei uma suíte de avaliação que confere escolha de ferramenta, argumentos e ordem das chamadas nos fluxos de agentes, pegando quatro regressões antes de chegarem ao cliente.

- **Capacitação do time e entrega ao cliente**  
  Dei workshops sobre design de agentes e LLM-as-a-judge para um time novo e dois gestores da Vivo. Cuidei da comunicação técnica com o cliente e orientei dois gestores de dados em avaliação de agentes.

_Tecnologias: Python, avaliação de LLM, frameworks de agentes, validação de tool-calling, RAG, Agile/Scrum._

---

### Triggo.ai — Remoto  
**Engenheiro de IA de Dados · contrato temporário** · dez. 2025 – jan. 2026

- **Controle da saída do LLM**  
  Usei self-consistency e tree-of-thoughts no prompt para manter o tom consistente. Ajustei as chamadas das APIs da Anthropic e da OpenAI para saídas em JSON, com limite de tamanho.

_Tecnologias: Python, Bruno, DocumentDB._

---

### Oncase — Recife, Brasil (Híbrido)  
**Engenheiro de Dados · contrato temporário** · ago. 2025 – nov. 2025

- **Inferência de visão computacional**  
  Mantive uma API de processamento de imagens em Flask, com upload para o S3, a serviço de um pipeline de inferência de visão computacional.

- **Orquestração**  
  Mantive DAGs do Airflow seguindo o padrão de branches do Gitflow, para nenhuma DAG quebrada chegar em produção. Hospedei o Airflow na EC2 para jobs contínuos de inferência e treino.

_Tecnologias: Python, Flask, PaddleOCR, Airflow, AWS, Terraform._

---

### Acaso — Recife, Brasil  
**Engenheiro de Machine Learning** · jan. 2025 – jun. 2025

- **Ingestão de documentos e RAG**  
  Automatizei a ingestão de documentos no Airflow e devolvi ao time cerca de 20% da semana. Construí um pipeline de RAG com Docling na leitura dos PDFs, LangChain na orquestração e PostgreSQL com pgvector no armazenamento.

- **Ingestão na nuvem e provas de conceito**  
  Cortei 60% da preparação manual de dados automatizando a ingestão no S3 com Python e Boto3. Entreguei provas de conceito de IA generativa em Streamlit e FastAPI para validação junto aos clientes.

_Tecnologias: Python, LangChain, PostgreSQL/pgvector, Docling, Apache Airflow, AWS S3, Boto3, FastAPI, Streamlit._

---

### Di2win — Recife, Brasil  
**Engenheiro de Machine Learning** · abr. 2024 – jan. 2025

- **Previsão de consumo de energia**  
  Cortei 20% do consumo de energia com previsões de LSTM e regressão regularizada ajustadas no Optuna, superando uma baseline SARIMA.

- **Entrega de modelos**  
  Troquei o retreino manual por pipelines event-driven no Airflow, disparados por atualização e deriva dos dados. Somei GitHub Actions e cobertura de testes em Pytest para o comportamento do modelo e os dados de entrada; e isolei treino e retreino em containers, longe dos projetos em produção.

_Tecnologias: Python, PyTorch, Optuna, Apache Airflow, Docker, GitHub Actions, Pytest, FastAPI._

---

### Valorian — Recife, Brasil (Remoto)  
**Cientista de Dados** · abr. 2023 – abr. 2024

- **Nuvem e automação de dados**  
  Reduzi os custos de hospedagem em 25% com conteinerização e instâncias reservadas. Automatizei ingestão e transformação de ponta a ponta, eliminando 30 horas de trabalho manual por mês.

- **Otimização em produção**  
  Melhorei em 12% a eficiência da produção de farinha de trigo com modelos XGBoost ajustados no Optuna.

_Tecnologias: Python, XGBoost, Optuna, Docker, AWS EC2/S3, Dash/Plotly._
