# WEB页面启动
# 访问 http://127.0.0.1:8898
# 打包: 将Core.py内容全部复制到此处并删除第八行import
# pyinstaller --add-data "templates:templates" -F app.py
from flask import Flask, render_template, request, make_response, jsonify
from concurrent.futures import ThreadPoolExecutor, as_completed
import traceback
from Core import *
from datetime import datetime
import threading
lock = threading.Lock()
app = Flask(__name__)
app.secret_key = 'your_secret_key_here'
executor = ThreadPoolExecutor(max_workers=20)

# 平台配置列表
PLATFORMS = [
    {'func': vika, 'color': 'gold', 'magic': True},
    {'func': touch, 'color': 'lime', 'magic': False},
    {'func': sakustar, 'color': 'lime', 'magic': False},
    {'func': shinnku, 'color': 'lime', 'magic': False},
    {'func': KunGal, 'color': 'lime', 'magic': False},
    {'func': tianyou, 'color': 'gold', 'magic': True},
    {'func': shenshi, 'color': 'white', 'magic': False},
    {'func': acgyyg, 'color': 'white', 'magic': False},
    {'func': loli, 'color': 'lime', 'magic': False},
    {'func': gallibrary, 'color': 'lime', 'magic': False},
    {'func': lzacg, 'color': 'white', 'magic': False},
    {'func': fufugal, 'color': 'white', 'magic': False},
    {'func': jimengacg, 'color': 'lime', 'magic': False},
    {'func': qingjiacg, 'color': 'lime', 'magic': False},
]

def search_log(ip:str, searchgame:str):
    now = datetime.now()
    logstr = now.strftime("%Y-%m-%d %H:%M:%S")+" "+ip+" 搜索: "+searchgame
    print(logstr)
    with lock:  # 获取锁，确保只有一个线程能写
        with open("log.txt", "a", encoding="utf-8") as f:
            f.write(logstr + "\n")

@app.route('/')
def index():
    seen_splash = request.cookies.get('seen_splash')
    response = make_response(render_template('index.html'))
    if not seen_splash:
        response.set_cookie('seen_splash', '1', max_age=365 * 24 * 60 * 60)
    return response

def search_platform(platform, game):
    """执行单个平台的搜索"""
    try:
        result = platform['func'](game)
        if result[1] > 0:
            return {
                'name': result[2],
                'color': platform['color'],
                'items': [{'name': i['name'], 'url': i['url']} for i in result[0]]
            }
    except Exception as e:
        print(f"搜索失败：{platform['func'].__name__} - {traceback.format_exc()}")
    return None

@app.route('/search', methods=['POST'])
def search():
    game = request.form.get('game', '').strip()
    use_magic = request.form.get('magic', 'false') == 'true'

    if not game:
        return jsonify({'error': '游戏名称不能为空'}), 400

    # 日志记录
    # ip_address = request.headers.get('X-Real-Ip', request.remote_addr)
    ip_address = request.remote_addr
    search_log(ip_address, game)

    results = []
    futures = {
        executor.submit(search_platform, platform, game): platform
        for platform in PLATFORMS if use_magic or not platform['magic']
    }

    for future in as_completed(futures):
        result = future.result()
        if result:
            results.append(result)

    return jsonify({'results': results})

if __name__ == '__main__':
    print('搜索器运行中，请勿关闭该黑框，浏览器访问 http://127.0.0.1:8898 进入WEB搜索')
    app.run(host='0.0.0.0', port=8898, threaded=True, debug=True)
