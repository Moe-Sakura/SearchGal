from ..common import *

def Hikarinagi(game: str, mode=False) -> list:
    yinqin = "Hikarinagi"
    if mode:
        return yinqin
    try:
        searul = re.compile(
            r'" class="lazyload fit-cover radius8"></a></div><div class="item-body"><h2 class="item-heading"><a target="_blank" href="(?P<URL>.*?)">(?P<NAME>.*?)</a></h2><div class="item-tags scroll-x no-scrollbar mb6">',
            re.S,
        )
        searesp = session.get(
            url="https://www.hikarinagi.net/",
            params={"s": game},
            verify=False,
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

Hikarinagi.color = "white"
Hikarinagi.magic = False