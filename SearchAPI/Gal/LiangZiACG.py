from ..common import *


def LiangZiACG(game: str, mode=False) -> list:
    yinqin = "量子acg"
    if mode:
        return yinqin
    try:
        searul = re.compile(
            r'><h2 class="item-heading"><a target="_blank" href="(?P<URL>.*?)">(?P<NAME>.*?)</a></h2><div',
            re.S,
        )
        searesp = session.get(
            url="https://lzacg.org/",
            params={"s": game},
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


LiangZiACG.color = "white"
LiangZiACG.magic = False
