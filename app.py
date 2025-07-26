# WEB页面启动
# 访问 http://127.0.0.1:8898
# 打包: 将Core.py内容全部复制到此处并删除第八行import
# pyinstaller --add-data "templates:templates" -F app.py
import gc
import threading
import time
import traceback
import tracemalloc
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime

from flask import (
    Flask,
    Response,
    jsonify,
    redirect,
    request,
    stream_with_context,
)
from flask_cors import CORS  # 导入 Flask-Cors

from Core import *

lock = threading.Lock()
app = Flask(__name__)
CORS(app)
app.secret_key = "your_secret_key_here"
executor = ThreadPoolExecutor(max_workers=20)

# 用于存储IP和最后访问时间
ip_last_search_time = {}
ip_limit_lock = threading.Lock()
SEARCH_INTERVAL_SECONDS = 15  # 搜索等待时间
IP_CACHE_MAX_SIZE = 100000  # 缓存中IP的最大数量
IP_CACHE_ENTRY_TTL = 15  # IP条目在缓存中的存活时间 (15秒)
IP_CACHE_CLEANUP_INTERVAL = 3600  # 清理IP缓存的周期 (1小时)
last_cleanup_execution_time = 0.0  # 上次清理执行时间


def cleanup_ip_cache():
    global last_cleanup_execution_time
    current_time = time.time()

    # 检查是否需要执行清理（达到清理周期 或 缓存大小超出限制）
    if (current_time - last_cleanup_execution_time > IP_CACHE_CLEANUP_INTERVAL) or (
        len(ip_last_search_time) > IP_CACHE_MAX_SIZE
    ):
        # 筛选出需要移除的条目（存活时间超过TTL的）
        # 使用 list(ip_last_search_time.items()) 来获取当前条目的快照进行迭代
        keys_to_remove = [
            key
            for key, last_access_time in list(ip_last_search_time.items())
            if (current_time - last_access_time) > IP_CACHE_ENTRY_TTL
        ]

        # 由于此函数在 ip_limit_lock 锁的保护下调用
        for key_to_remove in keys_to_remove:
            ip_last_search_time.pop(key_to_remove, None)

        last_cleanup_execution_time = current_time  # 更新最后清理时间


import logging

log = logging.getLogger("werkzeug")
# log.setLevel(logging.ERROR)


def search_log(ip: str, searchgame: str, ua: str = "unknow"):
    now = datetime.now()
    logstr = now.strftime("%Y-%m-%d %H:%M:%S") + " " + ip
    logstr += " " + ua
    logstr += " 搜索: " + searchgame
    print(logstr)
    with lock:  # 获取锁，确保只有一个线程能写
        with open("log.txt", "a", encoding="utf-8") as f:
            f.write(logstr + "\n")


def request_log(ip: str, ua: str, method, url):
    now = datetime.now()
    logstr = now.strftime("%Y-%m-%d %H:%M:%S") + f" {ip} {ua} {method} 访问 {url}"
    print(logstr)
    with lock:  # 获取锁，确保只有一个线程能写
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
    zypassword = kwargs.get("zypassword", "")
    try:
        # 特殊平台密码处理
        if platform["name"] == "紫缘Gal":
            result = platform["func"](game, False, zypassword)
        else:
            result = platform["func"](game)

        try:
            # 错误简单输出
            error = str(result[3])
            if "Read timed out." in error:
                error = "Search API 请求超时"
            if ("Expecting value:" in error) or ("EOF occurred in violation of protocol" in error):
                error += "<br/>(该平台搜索可能需要魔法, 而搜索后端暂未接入魔法)"
            if ("Expecting value:" in error) or (error[0] in ("'",'"') and error[-1] in ("'",'"')):
                error += "<br/>(站点搜索API改变, 或正则失效)"
            elif error == "":
                error = "搜索过程中遇到未知错误"
            print(platform["func"]("",True), "搜索错误:",error)
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
        print(f"搜索失败：{platform['func']('',True)} - {traceback.format_exc()}")
    return None


def _handle_search_request(request, PLATFORMS, game, use_magic, *args, **kwargs):
    if not game:
        return jsonify({"error": "游戏名称不能为空"}), 400

    ip_address = request.headers.get("X-Real-Ip", request.remote_addr)
    current_time = time.time()

    with ip_limit_lock:
        last_search_time = ip_last_search_time.get(ip_address)
        if (
            last_search_time
            and (current_time - last_search_time) < SEARCH_INTERVAL_SECONDS
        ):
            return jsonify(
                {
                    "error": f"搜索过于频繁, 请 {SEARCH_INTERVAL_SECONDS - int(current_time - last_search_time)} 秒后再试"
                }
            ), 429
        ip_last_search_time[ip_address] = current_time
        cleanup_ip_cache()

    # 日志记录
    ua = request.headers.get("Sec-Ch-Ua-Platform", "unknow").strip('"')
    search_log(ip_address, game, ua)

    def generate():
        futures = {
            executor.submit(search_platform, platform, game, *args, **kwargs): platform
            for platform in PLATFORMS
            if use_magic or not platform["magic"]
        }
        total = len(futures)
        completed = 0

        # 先发送总平台数
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

            # 显式释放已完成的 future
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
    zypassword = request.form.get("zypassword", "").strip()
    return _handle_search_request(
        request, PLATFORMS_GAL, game, use_magic, zypassword=zypassword
    )


@app.route("/patch", methods=["POST"])
def searchpatch():
    game = request.form.get("game", "").strip()
    use_magic = request.form.get("magic", "false") == "true"
    zypassword = request.form.get("zypassword", "").strip()
    return _handle_search_request(
        request, PLATFORMS_PATCH, game, use_magic, zypassword=zypassword
    )


if __name__ == "__main__":
    # 开发: flask run -h 0.0.0.0 -p 8898
    # 生产: nice -n 19 gunicorn --threads 4 --bind 0.0.0.0:8898 app:app
    print(
        "搜索器运行中，请勿关闭该黑框，浏览器访问 http://127.0.0.1:8898 进入 Web 搜索"
    )
    tracemalloc.start()
    app.run(host="0.0.0.0", port=8898, threaded=True, debug=False)
