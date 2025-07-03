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
MAX_RESULTS = 20

# requests session
# 如果需要设置代理请取消下列注释, 并修改代理端口
# session = requests.Session()
# proxy = "http://127.0.0.1:10809"
# session.proxies = {
#      "http": proxy,
#      "https": proxy,
# }

# 如果不需要代理，请使用下面这行
session = requests

# 全局请求头
headers = {
    "Connection": "close",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (From Searchgal.homes)",
}

# Cloudscraper 实例
sp = cloudscraper.create_scraper()