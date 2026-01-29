---
title: "E se as LLMs escolhessem o que fazer?"
pubDate: 2026-01-30
description: "Padrão de rotas para LLMs"
lang: 'pt'
---

# Faça a LLM escolher

Primeiro, preciso dizer que este será meu segundo post em inglês. O primeiro se chama *stepback*, já que fui direto para servidores MCP sem construir uma boa base para o leitor, o que vou abordar neste post.

- Por que você deve quebrar tarefas para LLMs  
- Como quebrar em tarefas menores  
- Como implementar isso em código  

## Por que você deve quebrar tarefas para LLMs

Primeiro, o último post mostrou que LLMs escolhem a próxima palavra com base no prompt inicial e no que já foi produzido. Com isso, podemos criar uma intuição de que, se eu disser ao meu LLM que ele atuará como um revisor de código, o contexto e a pontuação para as próximas palavras não terão relação com chefs de cozinha, certo?

E essa é uma das principais razões pelas quais quebramos tarefas para cada LLM. Aqui vou mostrar um agente principal que irá rotear qual LLM deve responder. E vale dizer que isso não é exclusivo de agente para agente, mas também para decidir qual ferramenta usar e coisas do tipo. Isso é roteamento, e rotas podem ser usadas para chamar agentes, funções ou até agentes com ferramentas — você escolhe.

Mas deixando um pouco a teoria de lado, como eu implemento isso?

## Como quebrar em tarefas menores

Pergunte a si mesmo o mesmo que perguntaria para funções: essa parte do código faz apenas uma coisa ou é apenas um degrau intermediário?

Quero dizer: se eu posso criar outra função com uma parte do código e chamar essa função dentro de uma função maior, isso ainda seria legível?

Exemplo:

```python
def run_agent(prompt:str):
    validated_prompt = prompt.lower().split(" ").replace("'", "").join(" ")
    output = agent.run_sycn(validated_prompt)
    
    if isinstance(output, MyOutputClass):
        if output.attribute1 is None:
            return None
        elif "duh" in output.attribute2:
            return None
        elif ...
    return output
```

Se eu colocar o `if isinstance` em uma função separada:

```python
def guardrail(output):
    if isinstance(output, MyOutputClass):
        if output.attribute1 is None:
            return None
        elif "duh" in output.attribute2:
            return None
        elif ...
    return output
```

O código ficaria assim:

```python
def run_agent(prompt:str):
    validated_prompt = prompt.lower().split(" ").replace("'", "").join(" ")
    output = agent.run_sycn(validated_prompt)
    return guardrail(output)
```

## Como implementar isso em código?

Aqui estou usando `pydantic_ai` e `pydantic` pela simplicidade de uso e para mostrar uma nova possibilidade além de LangChain e LlamaIndex.

```python
from typing import Literal

from pydantic import BaseModel, Field
from pydantic_ai import Agent


class RouterOutput(BaseModel):
    category: Literal["finance", "db"] = Field(
        ..., description="Selecionar apenas finance ou db"
    )
    rewritten_prompt: str = Field(..., description="Prompt reescrito")
```

A definição do agente roteador:

```python
router_agent = Agent(
    "google-gla:gemini-flash-latest",
    system_prompt=(
        (
            "Você é um agente roteador e irá classificar se o usuário precisa do agente de finanças ou do agente de banco de dados",
            "Você retornará qual agente deve ser chamado e reescreverá o prompt se ele estiver muito vago",
            "O agente de finanças explica o conteúdo sob a perspectiva do mercado de ações",
            "O agente de notícias explica o conteúdo como um jornalista",
            "O agente de banco de dados explica se algo deve ser adicionado ao banco de dados ou não",
        )
    ),
    output_type=RouterOutput,
)
```

Chamando os subagentes:

```python
def run_workflow(prompt: str) -> str:
    topic = router_agent.run_sync(prompt).output
    function_dict = {"finance": finance_agent, "db": db_agent}
    return function_dict[topic.category].run_sync(topic.rewriten_prompt).output
```

Arquitetura:

![arquitetura de roteamento](https://mldump.com/untitled-2026-01-19-1539/)

Definição dos subagentes:

```python
finance_agent = Agent(
    "google-gla:gemini-flash-lite-latest",
    system_prompt="""
        Você é um agente especializado em notícias financeiras...
    """
)

db_agent = Agent(
    "google-gla:gemini-flash-latest",
    system_prompt="""
        Você é um agente especializado em operar o banco de dados...
    """
)
```
