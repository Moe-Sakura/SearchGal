# 命令行启动 - 该方式已弃用
from Core import *
import webbrowser
from colorama import Fore, Style, init

init(autoreset=True)
from rich.progress import Progress, SpinnerColumn, TextColumn

if __name__ == "__main__":
    os.system("cls")
    print(Fore.CYAN + "正在尝试连接魔法..." + Style.RESET_ALL)
    resp = json.loads(requests.get(url="http://ip-api.com/json").text)
    if resp["country"] != "China":
        ismagic = True
        print(Fore.GREEN + "[+] 魔法已连接\n" + Style.RESET_ALL)
    else:
        print(
            Fore.RED + "[-] 魔法连接失败 需要魔法的平台将搜索失败\n" + Style.RESET_ALL
        )

    # search = [xinling, touch, tianyou, shenshi, loli]
    print(
        "本程序每获取到请求后都会关闭与服务器的连接，本程序不提倡爆破/恶意爬取数据，仅供搜索资源学习使用\n如果遇到某个平台搜索失败，检查你是否开了科技，也可能是平台炸了或者正则失效了\n"
        "目前只收录 非仅国内网盘 且 (资源存量丰富 或 免登录下载) 的平台\n"
        + Fore.RED
        + "有能力者请支持Galgame正版！有能力者请支持Galgame正版！有能力者请支持Galgame正版！\n"
        + Fore.CYAN
        + "请关闭浏览器的广告拦截插件，或将各gal网站添加到白名单。各网站建站不易，这是对这些网站最基本支持\n"
        + Style.RESET_ALL
        + "最好开启魔法搜索，否则一些免魔法的平台有时也会报搜索失败\n"
        "截止2025/02/02收录平台"
        + Fore.MAGENTA
        + "(紫色平台免登录)"
        + Fore.YELLOW
        + "(黄色平台需魔法)"
        + Style.RESET_ALL
        + ":\n  |",
        end="",
    )
    search
    for i in search:
        print(i(game=None, mode=True) + "|", end="")
    print("\n")
    while True:
        gamelst = {}
        for i in range(ord("A"), ord("Z") + 1):
            for j in range(1, 91):
                gamelst[str(chr(i)) + str(j)] = {"name": None, "url": None}

        if not tmp:
            game = input("搜索关键字 >> ").strip()
        else:
            game = tmp
            print("搜索游戏 >> " + tmp)
        print("\n" + "-" * 30)
        c = 0
        sta = ord("A")
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
                    print(
                        f"{yinqin}: 找到"
                        + Fore.GREEN
                        + f"{count}"
                        + Style.RESET_ALL
                        + "个项目"
                    )
                    for i in range(len(res)):
                        gamelst[str(chr(sta)) + str(end)]["name"] = res[i]["name"]
                        gamelst[str(chr(sta)) + str(end)]["url"] = res[i]["url"]
                        print(
                            "["
                            + Fore.GREEN
                            + f"{str(chr(sta)) + str(end)}"
                            + Style.RESET_ALL
                            + f"] "
                            + Fore.CYAN
                            + f"{res[i]['name']}"
                            + Style.RESET_ALL
                        )
                        end += 1
                    print("")
                    sta += 1

        print(
            Fore.YELLOW
            + "PS: 电脑输入游戏编号自动浏览器打开发布页(输入游戏名重搜)"
            + Style.RESET_ALL
        )
        while True:
            choice = input(">> ").strip().upper()
            tmp = choice
            if not (re.match(r"^([A-Z]|[0-9])*$", choice)) or len(choice) > 3:
                break
            try:
                webbrowser.open(gamelst[choice]["url"])
            except:
                pass
            print(Fore.CYAN + gamelst[choice]["url"] + Style.RESET_ALL)
        os.system("cls" if os.name == "nt" else "clear")
