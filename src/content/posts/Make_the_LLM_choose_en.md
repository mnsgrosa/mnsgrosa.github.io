First i must say that this will be my second english post the first one is called stepback since i went heads first on MCP servers without making a good foundation for the reader, what i will dive into in this one

- Why you should break tasks for LLMs
- How to break it in smaller tasks
- How to implement it in code

## Why you should break tasks for LLMs

First the last post has shown that LLMs choose the next word based on the base prompt and what they have produced, by this we can create an intuition based that if i have stated to my LLM that he will act as a code reviewer the context the score for next words wont be something related to cooking chefs, right? And that's one big reason why we break tasks for each LLM, here i will show one main agent that will route which LLM must answer, and i must say that this isn't exclusive for agent to agent but to which tool to user and stuff like this, this is routing, and routes can be used for calling agents, functions, or even agents with tools you name it.

But letting go of more theoretical stuff how i implement it?

## How to break into samller tasks

Ask yourself the same as functions, is this part of the code doing one purpose or is it a stepping stone?

i mean if i can create another function with one part of code and throw this function call at a bigger function, would it still be readable?

Example:
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

If i placed the `if isintance` in a function as bellow

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

The code would look as follows:

```python
def run_agent(prompt:str):
	validated_prompt = prompt.lower().split(" ").replace("'", "").join(" ")
	output = agent.run_sycn(validated_prompt)
	return guardrail(output)
```

So, can i abstract it from what im reading? if so it can be broken into smaller one for conquering

## How to implement it in code?

 Here im using `pydantic_ai` and `pydantic` becuase of simplicity of usage and showing a new possibility besides langchain and LamaIndex

```python
from typing import Literal

from pydantic import BaseModel, Field
from pydantic_ai import Agent


class RouterOutput(BaseModel):
    category: Literal["finance", "db"] = Field(
    ..., description="Selection finance or db only"
    )
    rewritten_prompt: str = Field(..., description="Rewritten prompt")
```

The code above does the imports and creates one class, this class keeps the router LLM on track to either answer finance or db it also makes the rewritten prompt if the main llm notices a incosistent prompt.

Now the definition of the router agent goes by:
```python
router_agent = Agent(
    "google-gla:gemini-flash-latest",
    system_prompt=(
        (
        "You are a router agent you will classify if either the user need the finance agent or db agent",
        "You will return which agent to call and rewrite it's prompt if it is too vague",
        "The finance agent explains the content based at the stock perspective",
        "The news explains the content as a journalist",
        "the db agent explains whether it should bne added to the db or not",
        )
    ),
    output_type=RouterOutput,
)

```

Here i've chosen the LLM behind the decision making for example sake the model doesn't make a difference here, the important part is actually the output_type parameter i've set it to answer only as the RouterOutput class, which enforces to choose whether should choose the finance or db one and rewrites the prompt so the next LLM works better, so lets dive in how to call the other two agents, than i will show the creation of both LLMs

```python
def run_workflow(prompt: str) -> str:
    topic = router_agent.run_sync(prompt).output
    function_dict = {"finance": finance_agent, "db": db_agent}
    return function_dict[topic.category].run_sync(topic.rewriten_prompt).output
```

Here i made a bit messier but showing how to avoid if and else for longer routing.
1) I've given the prompt and the output will be the object with category and prompt
2) Than i create a dictionary with the the LLMs stored
3) Lastly i return the output from the LLM responsible for the route

Here the main agent chooses which one is the responsible one for the task and outputs the agent responsible and a prompt making it easier for him to understand what the user wants.
The architecture drawing goes by as follows

![routing architecture](https://mldump.com/untitled-2026-01-19-1539/)


And the last bit is the definition of subagents:

```python
finance_agent = Agent(
    "google-gla:gemini-flash-lite-latest",
    system_prompt="""
        You are an agent that is specialized into financial news, if the user sends any news related
        to the stock market you will answer based on what he provided and asked, and tell facts about
        news and what motivates this change

        <\prompt example>:
            "Nvidia stocks went up after the announcement of a new round of data center being built in
            february of 2026"

        <\output example>:
            "Nvidia is the dominant company that provides gpus for data centers this move creates expectations
            on more usage of nvidia gpus in this data centers"
    """,
)

db_agent = Agent(
    "google-gla:gemini-flash-latest",
    system_prompt="""
        You are an agent that specialized into operating the database you are going to tell if the data sent
        is worth storing or not, you must accept if follows the following schema

        <\schema>\:
            name: str
            age: int
    """,
)
```

Here we can solve the issue from a generalist LLM to specialists so they solve the problem smoother