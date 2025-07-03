from ..common import *

def JiMengACG(game: str, mode=False) -> list:
    yinqin = "绮梦ACG"
    if mode:
        return yinqin
    try:
        # searul = re.compile(r'<div class="flex-1">\s*?<a href="(?P<URL>.*?)" class="text-lg xl:text-xl font-semibold line-2">(?P<NAME>.*?)</a>',re.S)
        searul = re.compile(
            r'<div class="p-2 sm:p-3">.+?<a href="(?P<URL>.*?)" class="dark:hover:text-\[var\(--primary\)\] hover:text-\[var\(--primary\)\] duration-300 text-sm sm:text-base font-bold line-clamp-9">(?P<NAME>.*?)</a>',
            re.S,
        )
        searesp = session.get(
            url=f"https://game.acgs.one/search/{game}",
            headers=headers,
            timeout=timeoutsec,
        )
        if searesp.status_code != 200:
            raise Exception("Search API 响应状态码为 " + str(searesp.status_code))
        count = 0
        gamelst = []
        for i in list(searul.finditer(searesp.text))[:MAX_RESULTS]:
            gamelst.append({"name": i.group("NAME").strip(), "url": i.group("URL")})
            count += 1
        searesp.close()
        return [gamelst, count, yinqin]
    except Exception as e:
        try:
            searesp.close()
        except Exception:
            pass
        return [[], -1, yinqin, e]

JiMengACG.color = "lime"
JiMengACG.magic = False