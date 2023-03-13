from typing import List, Dict
from langchain.llms.openai import OpenAIChat, OpenAI

# from codegen.tools.documentation import ReadDocumentation
from codegen.env import EnvVar
from codegen.js_agent import create_js_agent
from codegen.prompt import PREFIX, SUFFIX
from codegen.tools.playground import create_playground_tools
from codegen.tools.javascript import JavascriptEvalTool
from database import Database


def generate_req_handler(
    db: Database,
    run_id: str,
    blocks: List[Dict],
    method: str,
    envs: List[EnvVar],
):
    playground_tools, playground = create_playground_tools(envs)

    executor = create_js_agent(
        db=db,
        run_id=run_id,
        llm=OpenAI(temperature=0, max_tokens=1000),
        # llm=OpenAI(temperature=0, model_name='code-davinci-002', max_tokens=1000),
        # llm=OpenAIChat(temperature=0, max_tokens=1000),
        tools=[
            # ReadDocumentation()
            # JavascriptEvalTool(),
            *playground_tools,
        ],
        verbose=True,
    )

    # Convert description of the body block to a Typescript interface declaration.
    body_block = next(block for block in blocks if block["type"] == "RequestBody")
    req_body_str = f"""interface RequestBody {{
        {body_block["prompt"]}
    }}
    """
    print("REQ BODY BLOCK")
    print(req_body_str)

    # Convert env vars to Javascript comments, each on its on line for each env var.
    envs_str = ""
    for env in envs:
        envs_str += f'// const {env["key"]} = `env.{env["key"]}`\n'

    prompt = PREFIX.format(method=method, envs=envs_str, request_body=req_body_str)

    for idx, block in enumerate(blocks):
        if block["type"] == "Basic":
            prompt = prompt + "\n" + "{}. ".format(idx + 1) + block["prompt"] + "\n"

    prompt = prompt + "\n" + SUFFIX.format(method=method)

    handler_code = executor.run(prompt).strip("`").strip()

    playground.close()

    return prompt, handler_code
