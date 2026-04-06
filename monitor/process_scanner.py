import psutil
import time

previous = {}

def scan_processes():
    report = []
    global previous

    for p in psutil.process_iter(['pid', 'name', 'memory_info']):
        pid = p.info['pid']
        name = p.info['name']
        mem = p.info['memory_info'].rss / (1024 * 1024)

        old = previous.get(pid, 0)
        diff = mem - old
        previous[pid] = mem

        if diff > 5:  # leak threshold
            report.append({
                'pid': pid,
                'name': name,
                'memory': round(mem, 2),
                'growth': round(diff, 2)
            })

    return report