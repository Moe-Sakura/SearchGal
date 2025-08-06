import functools
import requests, re, os, urllib3, json, sys
from concurrent.futures import ThreadPoolExecutor
from urllib3.exceptions import InsecureRequestWarning
import cloudscraper
import urllib.parse
import xml.etree.ElementTree as ET

# 关闭 InsecureRequestWarning 警告
urllib3.disable_warnings(InsecureRequestWarning)

# 全局线程池
p = ThreadPoolExecutor(20)

# 超时时间/秒
timeoutsec = 15

# 每个平台最大返回结果
MAX_RESULTS = 999999

# requests session
# 创建一个全局的 Session 对象，以便复用连接
session = requests.Session()

# 如果需要设置代理请取消下列注释, 并修改代理端口
# proxy = "http://127.0.0.1:10809"
# session.proxies = {
#      "http": proxy,
#      "https": proxy,
# }

# 全局请求头
headers = {
    "Connection": "close",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 (From SearchGal.homes) (https://github.com/Moe-Sakura/SearchGal)",
}

# Cloudscraper 实例
sp = cloudscraper.create_scraper()

# --- 强制应用全局超时 ---
# 使用 functools.partial 为所有请求方法预设 timeout 参数。
# 这样，所有调用 session.get/post 或 sp.get/post 的地方都会自动应用超时，
# 除非它们自己明确覆盖了 timeout 参数。
session.get = functools.partial(session.get, timeout=timeoutsec, headers=headers)
session.post = functools.partial(session.post, timeout=timeoutsec, headers=headers)
sp.get = functools.partial(sp.get, timeout=timeoutsec, headers=headers)
sp.post = functools.partial(sp.post, timeout=timeoutsec, headers=headers)
