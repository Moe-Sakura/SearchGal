# WEB页面启动
# 访问 http://127.0.0.1:8898
# 打包: 将Core.py内容全部复制到此处并删除第八行import
# pyinstaller --add-data "templates:templates" -F app.py
from flask import (
    Flask,
    render_template,
    request,
    make_response,
    jsonify,
    Response,
    stream_with_context,
)
from concurrent.futures import ThreadPoolExecutor, as_completed
import traceback
import tracemalloc
from Core import *
from datetime import datetime
import gc
import threading
import time
import redis
from flask_cors import CORS # 导入 Flask-Cors

lock = threading.Lock()
app = Flask(__name__)
CORS(app)
app.secret_key = "your_secret_key_here"
executor = ThreadPoolExecutor(max_workers=20)

SEARCH_INTERVAL_SECONDS = 15  # 搜索等待时间

# 读取 Redis 密码
def get_redis_password(file_path="redis-password.key"):
    try:
        with open(file_path, "r") as f:
            return f.read().strip()
    except FileNotFoundError:
        print(f"错误：未找到 Redis 密码文件 '{file_path}'。")
        return None

redis_password = get_redis_password()

# 初始化 Redis 客户端
if redis_password:
    try:
        redis_client = redis.Redis(host='redis.searchgal.homes', port=6379, db=0, password=redis_password, decode_responses=True)
        redis_client.ping() # 测试连接
        print("成功连接到 Redis。")
    except Exception as e:
        print(f"无法连接到 Redis: {e}")
else:
    print("未设置 Redis 密码")
    redis_client = None


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


@app.route("/gamepad-solid.svg")
def serve_gamepad_solid():
    return app.send_static_file("gamepad-solid.svg")


@app.route("/main.js")
def serve_main():
    return app.send_static_file("main.js")


@app.route("/style.css")
def serve_style():
    return app.send_static_file("style.css")


@app.route("/")
def index():
    rip = request.headers.get("X-Real-Ip", request.remote_addr)
    ua = request.headers.get("Sec-Ch-Ua-Platform", "unknow").strip('"')
    if rip != "127.0.0.1":
        request_log(rip, ua, request.method, request.base_url)
    seen_splash = request.cookies.get("seen_splash")
    response = make_response(render_template("index.html"))
    if not seen_splash:
        response.set_cookie("seen_splash", "1", max_age=365 * 24 * 60 * 60)
    return response


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
            elif error == "":
                error = "Unknow Error 未知错误"
            print(error)
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
    except Exception as e:
        print(f"搜索失败：{platform['func'].__name__} - {traceback.format_exc()}")
    return None


def _handle_search_request(request, PLATFORMS, game, use_magic, *args, **kwargs):
    if not game:
        return jsonify({"error": "游戏名称不能为空"}), 400

    ip_address = request.headers.get("X-Real-Ip", request.remote_addr)
    current_time = time.time()

    # --- 新的 Redis 限流逻辑 ---
    try:
        if redis_client:
            redis_key = f"{ip_address}"

            # 检查 IP 是否在限制期内
            # .exists() 比 .get() 更快，因为它只检查键是否存在
            if redis_client.exists(redis_key):
                ttl = redis_client.ttl(redis_key)
                return jsonify(
                    {
                        "error": f"操作过于频繁，请 {ttl or SEARCH_INTERVAL_SECONDS} 秒后再试"
                    }
                ), 429

            # 如果不在限制期内，则设置新的限制，并让它在指定秒数后自动过期
            redis_client.set(redis_key, "locked", ex=SEARCH_INTERVAL_SECONDS)
    except Exception:
        pass
    # --- Redis 限流逻辑结束 ---

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


@app.route("/search-gal", methods=["POST"])
def searchgal():
    game = request.form.get("game", "").strip()
    use_magic = request.form.get("magic", "false") == "true"
    zypassword = request.form.get("zypassword", "").strip()
    return _handle_search_request(
        request, PLATFORMS_GAL, game, use_magic, zypassword=zypassword
    )


@app.route("/search-patch", methods=["POST"])
def searchpatch():
    game = request.form.get("game", "").strip()
    use_magic = request.form.get("magic", "false") == "true"
    zypassword = request.form.get("zypassword", "").strip()
    return _handle_search_request(
        request, PLATFORMS_PATCH, game, use_magic, zypassword=zypassword
    )


if __name__ == "__main__":
    # 开发: flask run -p 8898
    # 生产: nice -n 19 gunicorn -w 4 --bind 0.0.0.0:8898 app:app
    print("搜索器运行中，请勿关闭该黑框，浏览器访问 http://127.0.0.1:8898 进入 Web 搜索")
    tracemalloc.start()
    app.run(host="0.0.0.0", port=8898, threaded=True, debug=False)
