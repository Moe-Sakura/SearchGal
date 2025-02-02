import requests,re,webbrowser,os,urllib3,json
from concurrent.futures import ThreadPoolExecutor
p = ThreadPoolExecutor(20)
from tqdm import tqdm
from urllib3.exceptions import InsecureRequestWarning
urllib3.disable_warnings(InsecureRequestWarning)
from colorama import Fore, Style, init
import cloudscraper
from rich.progress import Progress, SpinnerColumn, TextColumn
init(autoreset=True)

ismagic = False

headers = {'Connection': 'close', \
           'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

# 如果你想要修改正则 或者添加搜索平台 可以模仿该函数模板新建一个函数
def PinTai_Name(game:str,mode=False) -> list:
    # 设置平台的名字
    yinqin = "平台的名字"
    if mode: return yinqin
    try:
        # 设置好匹配的正则
        searul = re.compile(r'使用的正则表达式，子页面链接用(?P<URL>.*?)匹配，项目名用(?P<NAME>.*?)匹配', re.S)
        
        #设置平台的链接，搜索所使用的参数 (如果搜索页不使用GET传参s关键字，则需要另外写requests规则)
        searesp = requests.get(url='平台主链接', params={'s':game}, headers=headers)
        if searesp.status_code != 200: raise Exception

        count = 0
        gamelst = []
        for i in searul.finditer(searesp.text):
            gamelst.append({'name':i.group('NAME').strip(),'url':i.group('URL')})
            count += 1
        searesp.close()

        # 返回的内容为一个装载 包含搜索到的多个{项目名:子页面链接}字典的列表,搜索到的数量,平台的名字  (正常这里不用动)
        return [gamelst,count,yinqin]
    except:
        # 异常处理，当搜索到的数量返回-1，会判定为搜索失败
        return [[],-1,yinqin]
    
    # 记得在底下的 search 列表追加添加新的搜索函数

def loli(game:str,mode=False) -> list:
    yinqin = Fore.MAGENTA + "忧郁的loli" + Style.RESET_ALL
    if mode: return yinqin
    try:
        searul = re.compile(r'<p style="text-align: center;"> <a href=".*?" target="_blank">.*?<p style="text-align: center;"> <a href="(?P<URL>.*?)" title="(?P<NAME>.*?)"> <img src=', re.S)
        searesp = requests.get(url='https://www.ttloli.com/', params={'s':game}, headers=headers)
        if searesp.status_code != 200: raise Exception
        count = 0
        gamelst = []
        for i in searul.finditer(searesp.text):
            if i.group('NAME') == '详细更新日志': continue
            gamelst.append({'name':i.group('NAME').strip(),'url':i.group('URL')})
            count += 1
        searesp.close()
        return [gamelst,count,yinqin]
    except:
        return [[],-1,yinqin]

def vika(game:str,mode=False) -> list:
    yinqin = Fore.YELLOW + "VikaACG" + Style.RESET_ALL
    if mode: return yinqin
    if not ismagic: return [[],-1,yinqin]
    try:
        searul = re.compile(r'<h2><a  target="_blank" href="(?P<URL>.*?)">(?P<NAME>.*?)<',re.S)
        # searul = re.compile(r'<h2><a  href="(?P<URL>.*?)">(?P<NAME>.*?)</a></h2>',re.S)
        searesp = requests.post(url='https://www.vikacg.com/wp-json/b2/v1/getPostList', 
                               json={"paged":1,"post_paged":1,"post_count":24,"post_type":"post-1","post_cat":[6],"post_order":"modified","post_meta":["user","date","des","cats","like","comment","views","video","download","hide"],"metas":{},"search":f"{game}"},
                               headers={'Connection': 'close','User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36','Content-Type': 'application/json'})
        if searesp.status_code != 200: raise Exception
        searesp = searesp.text.replace('\\/','/').replace('\\\\','\\').encode("utf-8").decode('unicode_escape')
        count = 0
        gamelst = []
        for i in searul.finditer(searesp):
            gamelst.append({'name':i.group('NAME').strip(),'url':i.group('URL')})
            count += 1
        return [gamelst,count,yinqin]
    except:
        return [[],-1,yinqin]

# 倒了
# def jidian(game:str,mode=False) -> list:
#     yinqin = "极点ACG"
#     if mode: return yinqin
#     try:
#         searul = re.compile(r'<a itemprop="url" rel="bookmark" href="(?P<URL>.*?)" title=".*?" target="_blank"><span class="post-sign">.*?</span>(?P<NAME>.*?)</a></h3>',re.S)
#         searesp = requests.get(url='https://lspgal.us/', params={'s':game}, headers=headers)
        # if searesp.status_code != 200: raise Exception
#         count = 0
#         gamelst = []
#         for i in searul.finditer(searesp.text):
#             gamelst.append({'name':i.group('NAME').strip(),'url':i.group('URL')})
#             count += 1
#         searesp.close()
#         return [gamelst,count,yinqin]
#     except:
#         return [[],-1,yinqin]
    
def tianyou(game:str,mode=False) -> list:
    yinqin = Fore.YELLOW + "天游二次元" + Style.RESET_ALL
    if mode: return yinqin
    if not ismagic: return [[],-1,yinqin]
    try:
        searul = re.compile(r'</i></a><h2><a href="(?P<URL>.*?)" title="(?P<NAME>.*?)"',re.S)
        searesp = requests.get(url=f'https://www.tiangal.com/search/{game}', headers=headers)
        if searesp.status_code != 200: raise Exception
        count = 0
        gamelst = []
        for i in searul.finditer(searesp.text):
            gamelst.append({'name':i.group('NAME').strip(),'url':i.group('URL')})
            count += 1
        searesp.close()
        return [gamelst,count,yinqin]
    except:
        return [[],-1,yinqin]
    
def acgyyg(game:str,mode=False) -> list:
    yinqin = "ACG嘤嘤怪"
    if mode: return yinqin
    if not ismagic: return [[],-1,yinqin]
    try:
        searul = re.compile(r'<a  target="_blank" href="(?P<URL>.*?)" title="(?P<NAME>.*?)"  class="post-overlay">')
        searesp = requests.get(url=f'https://acgyyg.ru/', params={'s':game}, headers=headers)
        if searesp.status_code != 200: raise Exception
        count = 0
        gamelst = []
        for i in searul.finditer(searesp.text):
            gamelst.append({'name':i.group('NAME').strip(),'url':i.group('URL')})
            count += 1
        searesp.close()
        return [gamelst,count,yinqin]
    except:
        return [[],-1,yinqin]

# 倒了
# def xinling(game:str,mode=False) -> list:
#     yinqin = "杏铃ACG"
#     if mode: return yinqin
#     try:
#         searul = re.compile(r'<a href="(?P<URL>.*?)">(?P<NAME>.*?)</a>',re.S)
#         searesp = requests.get(url='https://g.杏铃.top/', params={'q':game}, headers=headers)
#         if searesp.status_code != 200: raise Exception
#         count = 0
#         gamelst = []
#         flag = False
#         for i in searul.finditer(searesp.text):
#             if flag == False:
#                 flag = True
#                 continue
#             gamelst.append({'name':i.group('NAME').strip(),'url':i.group('URL')})
#             count += 1
#         searesp.close()
#         return [gamelst,count,yinqin]
#     except:
#         return [[],-1,yinqin]

#zg
def touch(game:str,mode=False) -> list:
    yinqin = Fore.MAGENTA + "TouchACG" + Style.RESET_ALL
    if mode: return yinqin
    try:
        # searul = re.compile(r'.jpg" alt="(?P<NAME>.*?)" class="lazyload fit-cover radius8"></a></div><div class="item-body"><h2 class="item-heading"><a target="_blank" href="(?P<URL>.*?)">',re.S)
        # searesp = requests.get(url='https://www.touchgal.com/', params={'s':game,'type':'post'}, headers=headers)
        searesp = requests.post(url='https://www.touchgal.io/api/search', headers=headers, data='{"query":["'+game+'"],"page":1,"limit":24,"searchOption":{"searchInIntroduction":false,"searchInAlias":false,"searchInTag":false}}')
        if searesp.status_code != 200: raise Exception
        resjson = json.loads(searesp.text)
        count = 0
        gamelst = []
        mainurl = 'https://www.touchgal.io/'
        for i in resjson['galgames']:
            gamelst.append({'name':i['name'].strip(),'url':mainurl+i['uniqueId']})
            count += 1
        searesp.close()
        return [gamelst,count,yinqin]
    except:
        return [[],-1,yinqin]
    
def sakustar(game:str,mode=False) -> list:
    yinqin = Fore.MAGENTA + "晴空咖啡馆" + Style.RESET_ALL
    if mode: return yinqin
    try:
        searesp = requests.get(url='https://api.aozoracafe.com/api/home/list?page=1&pageSize=100&search='+game, headers=headers)
        resjson = json.loads(searesp.text)
        if resjson['success'] != True: raise Exception
        count = 0
        gamelst = []
        mainurl = 'https://aozoracafe.com/detail/'
        for i in resjson['data']['list']:
            gamelst.append({'name':i['title_cn'].strip(),'url':mainurl+str(i['id'])})
            count += 1
        searesp.close()
        return [gamelst,count,yinqin]
    except:
        return [[],-1,yinqin]
    
def gallibrary(game:str,mode=False) -> list:
    yinqin = Fore.MAGENTA + "GAL图书馆" + Style.RESET_ALL
    if mode: return yinqin
    try:
        searesp = requests.get(url='https://gallibrary.pw/galgame/game/manyGame?page=1&type=1&keyWord='+game, headers=headers)
        resjson = json.loads(searesp.text)
        if resjson['code'] != 200: raise Exception
        count = 0
        gamelst = []
        mainurl = 'https://gallibrary.pw/game.html?id='
        for i in resjson['data']:
            gamelst.append({'name':i['listGameText'][1]['data'].strip(),'url':mainurl+str(i['id'])})
            count += 1
        searesp.close()
        return [gamelst,count,yinqin]
    except:
        return [[],-1,yinqin]

def shenshi(game:str,mode=False) -> list:
    yinqin = "绅仕天堂"
    if mode: return yinqin
    try:
        searul = re.compile(r'-->\s*<h2 class="post-list-title">\s*<a  href="(?P<URL>.*?)">(?P<NAME>.*?)</a>\s*</h2>\s*<span class="category-meta">',re.S)
        searesp = requests.get(url='https://www.gogalgame.com/', params={'s':game}, verify=False, headers=headers)
        if searesp.status_code != 200: raise Exception
        count = 0
        gamelst = []
        for i in searul.finditer(searesp.text):
            gamelst.append({'name':i.group('NAME').strip(),'url':i.group('URL')})
            count += 1
        searesp.close()
        return [gamelst,count,yinqin]
    except:
        return [[],-1,yinqin]

# 倒了
# def acgngames(game:str,mode=False) -> list:
#     yinqin = Fore.MAGENTA + "AcgnGames" + Style.RESET_ALL
#     if mode: return yinqin
#     try:
#         searul = re.compile(r'<h2 class="kratos-entry-title-new"><a href="(?P<URL>.*?)">(?P<NAME>.*?)</a></h2>',re.S)
#         searesp = requests.get(url='https://acgngames.net/', params={'s':game}, headers=headers)
#         if searesp.status_code != 200: raise Exception
#         count = 0
#         gamelst = []
#         for i in searul.finditer(searesp.text):
#             gamelst.append({'name':i.group('NAME').strip(),'url':i.group('URL')})
#             count += 1
#         searesp.close()
#         return [gamelst,count,yinqin]
#     except:
#         return [[],-1,yinqin]

# 倒了
# def ercygame(game:str,mode=False) -> list:
#     yinqin = "ErcyGame"
#     if mode: return yinqin
#     try:
#         searul = re.compile(r'<section class="hidden-xs">\s*<div class="title-article">\s*<h1><a href="(?P<URL>.*?)" target="_blank">\s*<span class="animated_h1">(?P<NAME>.*?)</span>',re.S)
#         searesp = requests.get(url='https://ercygame.com/', params={'s':game}, headers=headers)
#         if searesp.status_code != 200: raise Exception
#         count = 0
#         gamelst = []
#         for i in searul.finditer(searesp.text):
#             gamelst.append({'name':i.group('NAME').strip(),'url':i.group('URL')})
#             count += 1
#         searesp.close()
#         return [gamelst,count,yinqin]
#     except:
#         return [[],-1,yinqin]
    
def lzacg(game:str,mode=False) -> list:
    yinqin = "量子acg"
    if mode: return yinqin
    try:
        searul = re.compile(r'><h2 class="item-heading"><a target="_blank" href="(?P<URL>.*?)">(?P<NAME>.*?)</a></h2><div', re.S)
        searesp = requests.get(url='https://lzacg.org/', params={'s':game}, headers=headers)
        if searesp.status_code != 200: raise Exception
        count = 0
        gamelst = []
        for i in searul.finditer(searesp.text):
            gamelst.append({'name':i.group('NAME').strip(),'url':i.group('URL')})
            count += 1
        searesp.close()
        return [gamelst,count,yinqin]
    except:
        return [[],-1,yinqin]
    
def fufugal(game:str,mode=False) -> list:
    yinqin = "fufugal"
    if mode: return yinqin
    ynheaders = {'Connection': 'close', \
                'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', \
                'Accept': 'application/json, text/plain, */*'}
    try:
        searesp = requests.get(url='https://www.fufugal.com/so', params={'query':game}, headers=ynheaders)
        if searesp.status_code != 200: raise Exception
        dt = json.loads(searesp.text)
        count = len(dt['obj'])
        gamelst = []
        for i in dt['obj']:
            gamelst.append({'url': "https://www.fufugal.com/detail?id="+str(i['game_id']),'name': i['game_name']})
        searesp.close()
        return [gamelst,count,yinqin]
    except:
        return [[],-1,yinqin]

def jimengacg(game:str,mode=False) -> list:
    yinqin = Fore.MAGENTA + '绮梦ACG' + Style.RESET_ALL
    if mode: return yinqin
    try:
        searul = re.compile(r'<div class="flex-1">\s*?<a href="(?P<URL>.*?)" class="text-lg xl:text-xl font-semibold line-2">(?P<NAME>.*?)</a>',re.S)
        searesp = requests.get(url=f'https://acgs.one/search/{game}', headers=headers)
        if searesp.status_code != 200: raise Exception
        count = 0
        gamelst = []
        for i in searul.finditer(searesp.text):
            gamelst.append({'name':i.group('NAME').strip(),'url':i.group('URL')})
            count += 1
        searesp.close()
        return [gamelst,count,yinqin]
    except:
        return [[],-1,yinqin]

def qingjiacg(game:str,mode=False) -> list:
    yinqin = Fore.MAGENTA + '青桔ACG' + Style.RESET_ALL
    if mode: return yinqin
    sp = cloudscraper.create_scraper()
    try:
        searul = re.compile(r'class="thumb"></a><header><h2><a target="_blank" href="(?P<URL>.*?)" title=".+?">(?P<NAME>.*?)</a></h2></header><p class="note">',re.S)
        searesp = sp.get(url='https://spare.qingju.org/', params={'s':game}, headers=headers)
        # print(searesp.text)
        if searesp.status_code != 200: raise Exception
        count = 0
        gamelst = []
        for i in searul.finditer(searesp.text):
            gamelst.append({'name':i.group('NAME').strip(),'url':i.group('URL')})
            count += 1
        searesp.close()
        return [gamelst,count,yinqin]
    except:
        return [[],-1,yinqin]


search = [vika, touch, sakustar, tianyou, shenshi, acgyyg, loli, gallibrary, lzacg, fufugal, jimengacg, qingjiacg]
tmp = None
if __name__ == '__main__':
    os.system('cls')
    print(Fore.CYAN+"正在尝试连接魔法..."+Style.RESET_ALL)
    resp = json.loads(requests.get(url='http://ip-api.com/json').text)
    if resp['country'] != 'China':
        ismagic = True
        print(Fore.GREEN + "[+] 魔法已连接\n" + Style.RESET_ALL)
    else:
        print(Fore.RED + "[-] 魔法连接失败 需要魔法的平台将搜索失败\n" + Style.RESET_ALL)

    # search = [xinling, touch, tianyou, shenshi, loli]
    print("本程序每获取到请求后都会关闭与服务器的连接，本程序不提倡爆破/恶意爬取数据，仅供搜索资源学习使用\n如果遇到某个平台搜索失败，检查你是否开了科技，也可能是平台炸了或者正则失效了\n"
        "目前只收录 非仅国内网盘 且 (资源存量丰富 或 免登录下载) 的平台\n"+Fore.RED+"有能力者请支持Galgame正版！有能力者请支持Galgame正版！有能力者请支持Galgame正版！\n"+Fore.CYAN+"请关闭浏览器的广告拦截插件，或将各gal网站添加到白名单。各网站建站不易，这是对这些网站最基本支持\n"+Style.RESET_ALL+"最好开启魔法搜索，否则一些免魔法的平台有时也会报搜索失败\n"
        "截止2025/02/02收录平台" + Fore.MAGENTA + "(紫色平台免登录)"+Fore.YELLOW+"(黄色平台需魔法)" + Style.RESET_ALL + ":\n  |",end="")
    for i in search: print(i(game=None,mode=True)+"|",end="")
    print("\n")
    while True:
        gamelst = {}
        for i in range(ord('A'), ord('Z') + 1):
            for j in range(1, 91):
                gamelst[str(chr(i)) + str(j)] = {'name': None, 'url': None}

        if not tmp:
            game = input("搜索关键字 >> ").strip()
        else:
            game = tmp
            print("搜索游戏 >> " + tmp)
        print("\n" + "-" * 30)
        c = 0
        sta = ord('A')
        end = 1
        worklist = []
        for sech in search:
            worklist.append(p.submit(sech, game))

        # 使用 Rich 的 Progress 来显示加载动画
        with Progress(
            SpinnerColumn(),  # 使用加载动画的列
            TextColumn("[progress.description]{task.description}"),
        ) as progress:
            task = progress.add_task("Searching...", total=len(worklist))
            for sech in worklist:
                res, count, yinqin = sech.result()
                progress.update(task, advance=1)  # 更新加载动画
                if count == -1:
                    print(Fore.RED + f"{yinqin} 搜索失败\n" + Style.RESET_ALL)
                    continue
                end = 1
                if count > 0:
                    print(f"{yinqin}: 找到" + Fore.GREEN + f"{count}" + Style.RESET_ALL + "个项目")
                    for i in range(len(res)):
                        gamelst[str(chr(sta)) + str(end)]['name'] = res[i]['name']
                        gamelst[str(chr(sta)) + str(end)]['url'] = res[i]['url']
                        print("[" + Fore.GREEN + f"{str(chr(sta)) + str(end)}" + Style.RESET_ALL + f"] " + Fore.CYAN + f"{res[i]['name']}" + Style.RESET_ALL)
                        end += 1
                    print("")
                    sta += 1

        print(Fore.YELLOW + "PS: 电脑输入游戏编号自动浏览器打开发布页(输入游戏名重搜)" + Style.RESET_ALL)
        while True:
            choice = input(">> ").strip().upper()
            tmp = choice
            if not (re.match(r'^([A-Z]|[0-9])*$', choice)) or len(choice) > 3:
                break
            try:
                webbrowser.open(gamelst[choice]['url'])
            except:
                pass
            print(Fore.CYAN + gamelst[choice]['url'] + Style.RESET_ALL)
        os.system('cls' if os.name == 'nt' else 'clear')