# WEB页面启动
# 访问 http://127.0.0.1:8898
# 打包: 将Core.py内容全部复制到此处并删除第八行import
# pyinstaller --add-data "templates:templates" -F app.py
import gc
import json
import logging
import os
import threading
import time
import uuid
import traceback
import tracemalloc
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from multiprocessing import shared_memory

from flask import (
    Flask,
    Response,
    jsonify,
    redirect,
    request,
    stream_with_context,
)
from flask_cors import CORS

from Core import *

# --- 初始化速率限制模块 ---
if "gunicorn" in os.environ.get("SERVER_SOFTWARE", ""):
    # Gunicorn 环境: 导入共享内存配置
    print("Detected Gunicorn, using shared memory for rate limiting.")
    IS_GUNICORN = True
    from gunicorn_config import SHARED_MEM_NAME, ip_limit_lock
else:
    # 非 Gunicorn 环境 (例如，直接运行): 使用本地回退方案
    print("Not running with Gunicorn, using local threading for rate limiting.")
    IS_GUNICORN = False
    ip_limit_lock = threading.Lock()
    ip_last_search_time = {}

# --- Flask 应用设置 ---
lock = threading.Lock()  # 这个锁用于log文件写入，与速率限制无关
app = Flask(__name__)
CORS(app)
app.secret_key = uuid.uuid4()

# 启动内存追踪
tracemalloc.start()

# --- 速率限制常量 ---
SEARCH_INTERVAL_SECONDS = 15
IP_CACHE_MAX_SIZE = 100000
IP_CACHE_ENTRY_TTL = 15
IP_CACHE_CLEANUP_INTERVAL = 3600
last_cleanup_execution_time = 0.0

def cleanup_ip_cache(data_dict):
    """在一个可变字典上执行清理操作"""
    global last_cleanup_execution_time
    current_time = time.time()

    # 仅在达到清理周期或缓存大小超出限制时执行
    if (current_time - last_cleanup_execution_time > IP_CACHE_CLEANUP_INTERVAL) or (
        len(data_dict) > IP_CACHE_MAX_SIZE
    ):
        keys_to_remove = [
            key
            for key, last_access_time in list(data_dict.items())
            if (current_time - last_access_time) > IP_CACHE_ENTRY_TTL
        ]
        for key_to_remove in keys_to_remove:
            data_dict.pop(key_to_remove, None)
        # 更新最后清理时间
        last_cleanup_execution_time = current_time
    return data_dict

log = logging.getLogger("werkzeug")

def search_log(ip: str, searchgame: str, ua: str = "unknow"):
    now = datetime.now()
    logstr = now.strftime("%Y-%m-%d %H:%M:%S") + " " + ip
    logstr += " " + ua
    logstr += " 搜索: " + searchgame
    print(logstr)
    with lock:
        with open("log.txt", "a", encoding="utf-8") as f:
            f.write(logstr + "\n")

def request_log(ip: str, ua: str, method, url):
    now = datetime.now()
    logstr = now.strftime("%Y-%m-%d %H:%M:%S") + f" {ip} {ua} {method} 访问 {url}"
    print(logstr)
    with lock:
        with open("log.txt", "a", encoding="utf-8") as f:
            f.write(logstr + "\n")

@app.route("/")
def index():
    rip = request.headers.get("X-Real-Ip", request.remote_addr)
    ua = request.headers.get("Sec-Ch-Ua-Platform", "unknow").strip('"')
    if rip != "127.0.0.1":
        request_log(rip, ua, request.method, request.base_url)
    return redirect(f"https://searchgal.homes?api={request.base_url}")

def search_platform(platform, game, *args, **kwargs):
    """执行单个平台的搜索"""
    try:
        if platform["name"] == "紫缘Gal":
            result = platform["func"](game, False)
        else:
            result = platform["func"](game)

        try:
            error = str(result[3])
            if "Read timed out." in error:
                error = "Search API 请求超时"
            if (
                ("Search API 请求超时" in error)
                or ("Network is unreachable" in error)
                or ("Expecting value:" in error)
                or ("EOF occurred in violation of protocol" in error)
                or (
                    ("Search API 响应状态码为 " in error)
                    and ("400" in error or "403" in error)
                )
            ):
                error += "<br/>(该平台搜索可能需要魔法, 而搜索后端暂未接入魔法)"
            if ("Expecting value:" in error) or (
                error[0] in ("'", '"') and error[-1] in ("'", '"')
            ):
                error += "<br/>(站点搜索API改变, 或正则失效)"
            if ("Search API 响应状态码为 " in error) and (
                "503" in error or "502" in error or "500" in error
            ):
                error += "<br/>(目标站点服务器故障)"
            if "Connection aborted" in error:
                error += "<br/>(尝试重新搜索, 如同样报错则可能是魔法问题, 或平台站点服务器故障)"
            elif error == "":
                error = "搜索过程中遇到未知错误"
            print(platform["func"]("", True), "搜索错误:", error.replace("<br/>", " "))
        except:
            error = ""

        if (result[1] > 0) or error:
            return {
                "name": result[2],
                "color": "red" if error else platform["color"],
                "items": [
                    {"name": i["name"], "url": i["url"]}
                    for i in result[0][:MAX_RESULTS]
                ],
                "error": error,
            }
    except Exception:
        print(f"搜索失败：{platform['func']('', True)} - {traceback.format_exc()}")
    return None

def _handle_search_request(request, PLATFORMS, game, use_magic, *args, **kwargs):
    if not game:
        return jsonify({"error": "游戏名称不能为空"}), 400

    ip_address = request.headers.get("X-Real-Ip", request.remote_addr)
    current_time = time.time()

    with ip_limit_lock:
        # --- START of atomic rate-limiting block ---
        if IS_GUNICORN:
            # Gunicorn 环境：直接操作共享内存
            try:
                shm = shared_memory.SharedMemory(name=SHARED_MEM_NAME)
            except FileNotFoundError:
                # 这是一个严重错误，说明 master 进程的共享内存不见了
                print("[CRITICAL]!!!: Shared memory block not found. This indicates a problem with the Gunicorn master process.")
                return jsonify({"error": "服务器内部状态错误，请稍后重试或联系管理员。"}), 500
            try:
                # 读取和解析
                # shm.buf 是一个 memoryview，没有 find 方法，需要先转换为 bytes
                buf_bytes = shm.buf.tobytes()
                null_pos = buf_bytes.find(b'\x00')
                json_str = buf_bytes[:null_pos].decode('utf-8') if null_pos != -1 else '{}'
                data = json.loads(json_str)

                # 检查速率
                last_search = data.get(ip_address)
                if last_search and (current_time - last_search) < SEARCH_INTERVAL_SECONDS:
                    return jsonify({"error": f"搜索过于频繁, 请 {SEARCH_INTERVAL_SECONDS - int(current_time - last_search)} 秒后再试"}), 429

                # 更新和清理
                data[ip_address] = current_time
                data = cleanup_ip_cache(data)

                # 写回共享内存
                json_bytes = json.dumps(data).encode('utf-8')
                if len(json_bytes) + 1 > shm.size:
                    print("ERROR: Shared memory is full!")
                else:
                    shm.buf[:len(json_bytes)] = json_bytes
                    shm.buf[len(json_bytes)] = 0
            finally:
                shm.close()
        else:
            # 非 Gunicorn 环境：操作普通字典
            global ip_last_search_time
            last_search = ip_last_search_time.get(ip_address)
            if last_search and (current_time - last_search) < SEARCH_INTERVAL_SECONDS:
                return jsonify({"error": f"搜索过于频繁, 请 {SEARCH_INTERVAL_SECONDS - int(current_time - last_search)} 秒后再试"}), 429
            
            ip_last_search_time[ip_address] = current_time
            ip_last_search_time = cleanup_ip_cache(ip_last_search_time)
        # --- END of atomic rate-limiting block ---

    ua = request.headers.get("Sec-Ch-Ua-Platform", "unknow").strip('"')
    search_log(ip_address, game, ua)

    # 打印内存使用情况
    current, peak = tracemalloc.get_traced_memory()
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] PID:{os.getpid()} Memory: current={current / 1024**2:.2f}MB, peak={peak / 1024**2:.2f}MB")

    def generate():
        # 在函数内部创建线程池，以避免与 Gunicorn 的 fork 模型冲突
        with ThreadPoolExecutor(max_workers=20) as executor:
            futures = {
                executor.submit(search_platform, platform, game, *args, **kwargs): platform
                for platform in PLATFORMS
                if use_magic or not platform["magic"]
            }
            total = len(futures)
            completed = 0

            yield json.dumps({"total": total}) + "\n"

            for future in as_completed(futures):
                completed += 1
                result = future.result()
                if result:
                    yield (
                        json.dumps(
                            {
                                "progress": {"completed": completed, "total": total},
                                "result": result,
                            }
                        )
                        + "\n"
                    )
                else:
                    yield (
                        json.dumps({"progress": {"completed": completed, "total": total}})
                        + "\n"
                    )
                del future
                gc.collect()

            # 清理 future 列表
            futures.clear()
            gc.collect()

            # 发送完成信号
            yield json.dumps({"done": True}) + "\n"

    return Response(stream_with_context(generate()), mimetype="text/event-stream")

@app.route("/gal", methods=["POST"])
def searchgal():
    game = request.form.get("game", "").strip()
    use_magic = request.form.get("magic", "false") == "true"
    return _handle_search_request(
        request, PLATFORMS_GAL, game, use_magic
    )

@app.route("/patch", methods=["POST"])
def searchpatch():
    game = request.form.get("game", "").strip()
    use_magic = request.form.get("magic", "false") == "true"
    return _handle_search_request(
        request, PLATFORMS_PATCH, game, use_magic
    )

if __name__ == "__main__":
    print(
        "搜索器运行中，请勿关闭该黑框，浏览器访问 http://127.0.0.1:8898 进入 Web 搜索"
    )
    app.run(host="0.0.0.0", port=8898, threaded=True, debug=False)
