# WEB页面启动
# 访问 http://127.0.0.1:8898
# 打包: 将Core.py内容全部复制到此处并删除第八行import
# pyinstaller --add-data "templates:templates" -F app.py
from flask import Flask, render_template, request, make_response, jsonify, Response, stream_with_context
from concurrent.futures import ThreadPoolExecutor, as_completed
import traceback
import tracemalloc
from Core import *
from datetime import datetime
import gc
import threading
lock = threading.Lock()
app = Flask(__name__)
app.secret_key = 'your_secret_key_here'
executor = ThreadPoolExecutor(max_workers=20)

import logging
log = logging.getLogger('werkzeug')
# log.setLevel(logging.ERROR)

MAX_RESULTS = 50

def search_log(ip:str, searchgame:str, ua:str='unknow'):
    now = datetime.now()
    logstr = now.strftime("%Y-%m-%d %H:%M:%S")+" "+ip
    logstr += " "+ua
    logstr += " 搜索: "+searchgame
    print(logstr)
    with lock:  # 获取锁，确保只有一个线程能写
        with open("log.txt", "a", encoding="utf-8") as f:
            f.write(logstr + "\n")
            
def request_log(ip:str, ua:str, method, url):
    now = datetime.now()
    logstr = now.strftime("%Y-%m-%d %H:%M:%S")+f' {ip} {ua} {method} 访问 {url}'
    print(logstr)
    with lock:  # 获取锁，确保只有一个线程能写
        with open("log.txt", "a", encoding="utf-8") as f:
            f.write(logstr + "\n")
            
@app.route('/all.min.js')
def serve_font_awesome():
    return app.send_static_file('all.min.js')

@app.route('/animate.min.css')
def serve_animate():
    return app.send_static_file('animate.min.css')

@app.route('/bootstrap.bundle.min.js')
def serve_bootstrap_bundle():
    return app.send_static_file('bootstrap.bundle.min.js')

@app.route('/bootstrap.min.css')
def serve_bootstrap():
    return app.send_static_file('bootstrap.min.css')

@app.route('/gamepad-solid.svg')
def serve_gamepad_solid():
    return app.send_static_file('gamepad-solid.svg')

@app.route('/jquery.min.js')
def serve_jquery():
    return app.send_static_file('jquery.min.js')

@app.route('/main.js')
def serve_main():
    return app.send_static_file('main.js')

@app.route('/style.css')
def serve_style():
    return app.send_static_file('style.css')

@app.route('/sweetalert2@8.js')
def serve_sweetalert2():
    return app.send_static_file('sweetalert2@8.js')

@app.route('/')
def index():
    rip = request.headers.get('X-Real-Ip', request.remote_addr)
    ua = request.headers.get('Sec-Ch-Ua-Platform', 'unknow').strip("\"")
    if rip != '127.0.0.1': request_log(rip, ua, request.method, request.base_url)
    seen_splash = request.cookies.get('seen_splash')
    response = make_response(render_template('index.html'))
    if not seen_splash:
        response.set_cookie('seen_splash', '1', max_age=365 * 24 * 60 * 60)
    return response

def search_platform(platform, game, zypassword):
    """执行单个平台的搜索"""
    try:
        if platform['name'] == '紫缘Gal': result = platform['func'](game,False,zypassword)
        else: result = platform['func'](game)
        try:
            error = str(result[3])
            if error == "": error = "Unknow Error 未知错误"
            print(error)
        except: error = ""
        if (result[1] > 0) or error:
            return {
                'name': result[2],
                'color': "red" if error else platform['color'],
                'items': [{'name': i['name'], 'url': i['url']} for i in result[0][:MAX_RESULTS]],
                'error': error
            }
    except Exception as e:
        print(f"搜索失败：{platform['func'].__name__} - {traceback.format_exc()}")
    return None

@app.route('/search', methods=['POST'])
def search():
    game = request.form.get('game', '').strip()
    use_magic = request.form.get('magic', 'false') == 'true'
    zypassword = request.form.get('zypassword', '').strip()

    if not game:
        return jsonify({'error': '游戏名称不能为空'}), 400

    # 日志记录
    ip_address = request.headers.get('X-Real-Ip', request.remote_addr)
    ua = request.headers.get('Sec-Ch-Ua-Platform', 'unknow').strip("\"")
    search_log(ip_address, game, ua)

    def generate():
        futures = {
            executor.submit(search_platform, platform, game, zypassword): platform
            for platform in PLATFORMS if use_magic or not platform['magic']
        }
        total = len(futures)
        completed = 0
        
        # 先发送总平台数
        yield json.dumps({'total': total}) + '\n'

        for future in as_completed(futures):
            completed += 1
            result = future.result()
            if result:
                yield json.dumps({
                    'progress': {'completed': completed, 'total': total},
                    'result': result
                }) + '\n'
            else:
                yield json.dumps({
                    'progress': {'completed': completed, 'total': total}
                }) + '\n'
                    
            # 显式释放已完成的 future
            del future
            gc.collect()
            
        # 清理 future 列表
        futures.clear()
        gc.collect()

        # 发送完成信号
        yield json.dumps({'done': True}) + '\n'

    return Response(stream_with_context(generate()), mimetype='text/event-stream')

# 新增传统搜索路由
@app.route('/search-classic', methods=['POST'])
def search_classic():
    # 参数获取与流式搜索相同
    game = request.form.get('game', '').strip()
    use_magic = request.form.get('magic', 'false') == 'true'
    zypassword = request.form.get('zypassword', '').strip()

    if not game:
        return jsonify({'error': '游戏名称不能为空'}), 400

    # 日志记录
    ip_address = request.headers.get('X-Real-Ip', request.remote_addr)
    ua = request.headers.get('Sec-Ch-Ua-Platform', 'unknow').strip("\"")
    search_log(ip_address, game, ua)

    # 同步处理所有结果
    futures = {
        executor.submit(search_platform, platform, game, zypassword): platform
        for platform in PLATFORMS if use_magic or not platform['magic']
    }
    
    results = []
    for future in as_completed(futures):
        result = future.result()
        if result:
            results.append(result)
        del future  # 显式删除
    gc.collect()
    futures.clear()
    
    return jsonify({'results': results})

if __name__ == '__main__':
    print('搜索器运行中，请勿关闭该黑框，浏览器访问 http://127.0.0.1:8898 进入WEB搜索')
    tracemalloc.start()
    app.run(host='0.0.0.0', port=8898, threaded=True, debug=False)
