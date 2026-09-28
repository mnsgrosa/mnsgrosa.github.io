// Structured work-experience data, rendered as cards on the portfolio page.
// Each role keeps 2–3 of the most relevant highlights (short phrases) plus the
// tech stack, instead of the full CV text.

export interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  highlights: string[];
  /** Optional tech tags shown on the card (plain strings). */
  stack?: string[];
}

export const experience: ExperienceItem[] = [
  {
    company: 'Maggu',
    role: 'Data AI Engineer',
    period: 'abr 2026 – ago 2026',
    highlights: [
      'Provisionei os pipelines do Databricks como infraestrutura-as-código com Terraform, tornando cada ambiente reproduzível a partir do versionamento.',
      'Reduzi a sobrecarga diária do PostgreSQL e o upload de dados de 2 h para 15 min com batch e threads de escrita; cortei o custo do Databricks de US$ 3,21 para US$ 0,80 por DBU otimizando jobs PySpark (particionamento, broadcast e small-file churn).',
      'Reescrevi o LLM judge como dois agentes adversariais, elevando a acurácia da recomendação de 62% para 94%, e rastreei custo, latência e acurácia no MLflow (Databricks).',
    ],
    stack: ['Databricks', 'PySpark', 'Delta Lake', 'Terraform', 'MLflow', 'GitHub Actions', 'Agno'],
  },
  {
    company: 'Capgemini',
    role: 'Data AI Engineer',
    period: 'jan 2026 – abr 2026',
    highlights: [
      'Escrevi a suíte de avaliação de workflows de agentes (ferramenta certa, argumentos e ordem), capturando 4 regressões antes de chegarem ao cliente.',
      'Conduzi workshops sobre LLM-as-a-judge para o time e gerentes da Vivo, padronizando métricas de avaliação compartilhadas.',
    ],
    stack: ['Python', 'LLM evaluation', 'Agent frameworks', 'RAG', 'Agile'],
  },
  {
    company: 'Triggo.ai',
    role: 'Data AI Engineer',
    period: 'dez 2025 – jan 2026',
    highlights: [
      'Engineerei prompts para manter o tom do LLM consistente usando self-consistency e tree-of-thoughts.',
      'Ajustei chamadas à Anthropic e à OpenAI para garantir saídas em JSON com limite de comprimento.',
    ],
    stack: ['Python', 'DocumentDB', 'Bruno'],
  },
  {
    company: 'Oncase',
    role: 'Data Engineer',
    period: 'ago 2025 – nov 2025',
    highlights: [
      'Mantive DAGs no Airflow com padrão Gitflow, evitando que DAGs quebrados chegassem à produção.',
      'Hospedei o Airflow na EC2 para jobs contínuos de inferência e treino de um pipeline de visão computacional.',
      'Mantive uma API Flask de processamento de imagens com uploads no S3 para o mesmo pipeline de visão.',
    ],
    stack: ['Airflow', 'AWS', 'Python', 'Terraform', 'Flask', 'PaddleOCR'],
  },
  {
    company: 'Acaso',
    role: 'Machine Learning Engineer',
    period: 'jan 2025 – jun 2025',
    highlights: [
      'Automatizei a ingestão de documentos no Airflow, devolvendo cerca de 20% da semana ao time.',
      'Cortei 60% da preparação manual de dados movendo a ingestão do S3 para Python/Boto3.',
      'Construí o pipeline de RAG (Docling, LangChain, pgvector) para ingestão e busca sobre documentos.',
    ],
    stack: ['Python', 'Airflow', 'AWS S3', 'Boto3', 'PostgreSQL/pgvector', 'Docling', 'LangChain', 'FastAPI'],
  },
  {
    company: 'Di2win',
    role: 'Machine Learning Engineer',
    period: 'abr 2024 – jan 2025',
    highlights: [
      'Substituí o retreino manual por pipelines no Airflow dirigidos por eventos de refresh e drift.',
      'Montei um stack conteinerizado (Docker) onde treino, fine-tuning e retreino rodam isolados dos projetos em produção.',
      'Reduzi o consumo de energia em 20% com previsões LSTM e regressão regularizada tunadas no Optuna.',
    ],
    stack: ['Python', 'Airflow', 'Docker', 'PyTorch', 'Optuna', 'FastAPI', 'GitHub Actions', 'Pytest'],
  },
  {
    company: 'Valorian',
    role: 'Data Scientist',
    period: 'abr 2023 – abr 2024',
    highlights: [
      'Automatizei a ingestão e a transformação de dados de ponta a ponta, eliminando cerca de 30 horas mensais de trabalho manual.',
      'Reduzi os custos de hospedagem em 25% containerizando cargas de trabalho e migrando para instâncias reservadas.',
      'Aumentei a eficiência da produção de farinha de trigo em 12% com modelos XGBoost tunados no Optuna.',
    ],
    stack: ['Python', 'Docker', 'AWS EC2/S3', 'XGBoost', 'Optuna', 'Dash/Plotly'],
  },
];
