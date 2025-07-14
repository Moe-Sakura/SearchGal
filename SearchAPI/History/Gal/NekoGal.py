from ..common import *


def NekoGal(game: str, mode=False) -> list:
    yinqin = "NekoGal"
    if mode:
        return yinqin
    try:
        searul = re.compile(
            r'<div class="item-thumbnail">\s*<a target="_blank" href="(?P<URL>.*?)">.+?" alt="(?P<NAME>.*?)" class="lazyload'
        )
        searesp = session.get(
            url="https://www.nekogal.com/?type=post&s=" + game,
            headers=headers,
            timeout=timeoutsec,
        )
        if searesp.status_code != 200:
            raise Exception("Search API 响应状态码为 " + str(searesp.status_code))
        count = 0
        gamelst = []
        for i in list(searul.finditer(searesp.text))[:MAX_RESULTS]:
            gamelst.append(
                {
                    "name": i.group("NAME").strip().strip("-NekoGAL - Galgame传递者"),
                    "url": i.group("URL"),
                }
            )
            count += 1
        searesp.close()
        return [gamelst, count, yinqin]
    except Exception as e:
        try:
            searesp.close()
        except Exception:
            pass
        return [[], -1, yinqin, e]


NekoGal.color = "white"
NekoGal.magic = False
