import { useEffect, useState } from "react";
import { WEBSOCKET_URL } from "../app/config";
import Cookies from "js-cookie";

export function useSocket() {
    const [loading, setLoading] = useState(true)
    const [socket, setsocket] = useState<WebSocket>()

    useEffect(() => {
      const token = Cookies.get("token")
      const ws = new WebSocket(`${WEBSOCKET_URL}?token=${token}`)
      ws.onopen = () => {
        setLoading(false);
        setsocket(ws)
      }
        
    
    }, [])
    
    return {
        socket
        ,loading
    }

    
}