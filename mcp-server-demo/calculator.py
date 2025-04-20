from mcp.server.fastmcp import FastMCP
import time
from typing import List, Dict, Any

# Initialize MCP server
mcp = FastMCP("StreamServer")

@mcp.tool()
def create_stream(recipient: str, deposit_amount: int, start_time: int = None, 
                 stop_time: int = None, interval: int = 60, is_fa: bool = False,
                 coin_type: str = "0x1::aptos_coin::AptosCoin") -> Dict[str, Any]:
    """Create a new payment stream"""
    if start_time is None:
        start_time = int(time.time()) + 300
    if stop_time is None:
        stop_time = start_time + interval * 60 * 12
        
    # Mock response
    return {
        "hash": "0x123...abc",
        "success": True
    }

@mcp.tool() 
def pause_stream(stream_id: str, is_fa: bool = False) -> Dict[str, Any]:
    """Pause an existing stream"""
    return {
        "hash": "0x456...def",
        "success": True
    }

@mcp.tool()
def resume_stream(stream_id: str, is_fa: bool = False) -> Dict[str, Any]:
    """Resume a paused stream"""
    return {
        "hash": "0x789...ghi", 
        "success": True
    }

@mcp.tool()
def close_stream(stream_id: str, is_fa: bool = False) -> Dict[str, Any]:
    """Close an existing stream"""
    return {
        "hash": "0xabc...123",
        "success": True
    }

@mcp.tool()
def extend_stream(stream_id: str, extend_time: int, 
                 coin_type: str = "0x1::aptos_coin::AptosCoin") -> Dict[str, Any]:
    """Extend the duration of a stream"""
    return {
        "hash": "0xdef...456",
        "success": True
    }

@mcp.tool()
def withdraw_stream(stream_id: str, 
                   coin_type: str = "0x1::aptos_coin::AptosCoin") -> Dict[str, Any]:
    """Withdraw from a stream"""
    return {
        "hash": "0xghi...789",
        "success": True
    }

@mcp.tool()
def batch_create_streams(recipients: List[str], deposit_amounts: List[int], 
                        names: List[str], is_fa: bool = False) -> Dict[str, Any]:
    """Create multiple streams in one transaction"""
    return {
        "hash": "0x321...xyz",
        "success": True
    }

@mcp.tool()
def batch_withdraw_streams(stream_ids: List[str], is_fa: bool = False,
                         coin_type: str = "0x1::aptos_coin::AptosCoin") -> Dict[str, Any]:
    """Withdraw from multiple streams"""
    return {
        "hash": "0x654...uvw",
        "success": True
    }

@mcp.tool()
def get_stream_info(stream_id: str) -> Dict[str, Any]:
    """Get information about a stream"""
    return {
        "id": stream_id,
        "sender": "0xsender...",
        "recipient": "0xrecipient...", 
        "deposit_amount": 10000000,
        "start_time": int(time.time()),
        "stop_time": int(time.time()) + 3600,
        "interval": 60,
        "status": "active"
    }

# Start server
if __name__ == "__main__":
    mcp.run()