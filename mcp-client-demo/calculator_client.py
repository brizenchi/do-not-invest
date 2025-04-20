import requests
import json

def main():
    server_url = "http://localhost:6274"  # 替换为你的 MCP Server 地址

    try:
        # 查询可用工具
        response = requests.get(f"{server_url}/tools")
        tools = response.json()
        print("Available tools:", json.dumps(tools, indent=2))

        # 调用 add 工具
        add_payload = {"tool": "add", "parameters": {"a": 5, "b": 3}}
        response = requests.post(f"{server_url}/call", json=add_payload)
        add_result = response.json()
        print("Result of add(5, 3):", add_result)

        # 调用 sqrt 工具
        sqrt_payload = {"tool": "sqrt", "parameters": {"a": 16}}
        response = requests.post(f"{server_url}/call", json=sqrt_payload)
        sqrt_result = response.json()
        print("Result of sqrt(16):", sqrt_result)

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()