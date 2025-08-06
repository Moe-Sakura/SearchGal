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
    如果之前存在，先清理掉。
    """
    print(f"Master process {os.getpid()} is setting up shared memory block...")
    try:
        # 尝试清理任何可能残留的旧共享内存块
        shared_memory.SharedMemory(name=SHARED_MEM_NAME).unlink()
        print(f"Successfully unlinked pre-existing shared memory block '{SHARED_MEM_NAME}'.")
    except FileNotFoundError:
        # 这是正常情况，说明没有残留
        pass

    try:
        # 创建一个新的共享内存块
        shm = shared_memory.SharedMemory(name=SHARED_MEM_NAME, create=True, size=SHARED_MEM_SIZE)
        # 在内存块的开头写入一个空的 JSON 字典 '{}'，并以 null 结尾
        shm.buf[:3] = b'{}\x00'
        shm.close()
        print(f"Shared memory block '{SHARED_MEM_NAME}' created successfully.")
    except Exception as e:
        server.log.error(f"Failed to create shared memory: {e}")
        raise

def on_exit(server):
    """
    当 Gunicorn 关闭时，清理共享内存块。
    这个钩子在 master 进程退出时被调用。
    """
    print("Gunicorn is shutting down. Unlinking shared memory.")
    try:
        shared_memory.SharedMemory(name=SHARED_MEM_NAME).unlink()
        print(f"Shared memory block '{SHARED_MEM_NAME}' unlinked.")
    except FileNotFoundError:
        print(f"Shared memory block '{SHARED_MEM_NAME}' was not found, no need to unlink.")

def post_fork(server, worker):
    worker.log.info(f"Worker {worker.pid} forked. Shared memory is accessible.")