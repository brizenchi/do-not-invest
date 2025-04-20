from mcp.server.fastmcp import FastMCP
import math

# 初始化 MCP 服务器
mcp = FastMCP("CalculatorServer")

# 定义工具：加法
@mcp.tool()
def add(a: int, b: int) -> int:
    """Add two numbers"""
    return int(a + b)

# 定义工具：平方根
@mcp.tool()
def sqrt(a: int) -> float:
    """Calculate the square root of a number"""
    return float(math.sqrt(a))

# 启动服务器
if __name__ == "__main__":
    mcp.run()