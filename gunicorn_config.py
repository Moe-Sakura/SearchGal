# gunicorn_config.py
import os
import atexit
from multiprocessing import Lock, shared_memory

# ---------------------------------------------------------------------
# Gunicorn aiohttp 多进程共享IP速率限制 (基于 shared_memory)
# 启动: gunicorn -c gunicorn_config.py app:app --preload
# ---------------------------------------------------------------------

# 进程超时时间
timeout = 60

# 进程数
workers = 4

# 绑定端口
bind = "0.0.0.0:8898"

# 共享内存的名称和大小
# 注意：大小需要估算，如果字典变得太大，这里可能会成为瓶颈
# 假设平均每个条目（IP + 时间戳）占用 50 字节，100,000 个条目就是 5MB
SHARED_MEM_NAME = 'searchgal_rate_limit'
SHARED_MEM_SIZE = 5 * 1024 * 1024  # 5 MB

# 全局锁
ip_limit_lock = Lock()

def on_starting(server):
    """
    在主进程中创建共享内存块。
    """
    print(f"Master process {os.getpid()} is creating shared memory block...")
    try:
        # 尝试创建一个新的共享内存块
        shm = shared_memory.SharedMemory(name=SHARED_MEM_NAME, create=True, size=SHARED_MEM_SIZE)
        # 在内存块的开头写入一个空的 JSON 字典 '{}'，并以 null 结尾
        shm.buf[:3] = b'{}\x00'
        shm.close()
        print(f"Shared memory block '{SHARED_MEM_NAME}' created.")
    except FileExistsError:
        print(f"Shared memory block '{SHARED_MEM_NAME}' already exists. No action needed.")

def when_ready(server):
    """
    在服务器完全启动后，注册一个清理钩子，以确保在 Gunicorn 退出时删除共享内存块。
    """
    def _cleanup():
        print("Master process is shutting down. Unlinking shared memory.")
        try:
            # 只需要 unlink，不需要 close，因为我们没有在这里打开它
            shared_memory.SharedMemory(name=SHARED_MEM_NAME).unlink()
        except FileNotFoundError:
            pass
    
    atexit.register(_cleanup)

def post_fork(server, worker):
    worker.log.info(f"Worker {worker.pid} forked. Shared memory is accessible.")