import psutil

ports_to_kill = [8000, 5173]

for conn in psutil.net_connections():
    if conn.laddr.port in ports_to_kill and conn.pid:
        try:
            p = psutil.Process(conn.pid)
            p.terminate()
            print(f"Terminated process {p.pid} on port {conn.laddr.port}")
        except Exception as e:
            print(f"Could not kill {conn.pid}: {e}")
