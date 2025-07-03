from ..common import *


# 倒了
def ercygame(game: str, mode=False) -> list:
    yinqin = "ErcyGame"
    if mode:
        return yinqin
    try:
        searul = re.compile(
            r'<section class="hidden-xs">\s*<div class="title-article">\s*<h1><a href="(?P<URL>.*?)" target="_blank">\s*<span class="animated_h1">(?P<NAME>.*?)</span>',
            re.S,
        )
        searesp = session.get(
            url="https://ercygame.com/", params={"s": game}, headers=headers
        )
        if searesp.status_code != 200:
            raise Exception
        count = 0
        gamelst = []
        for i in list(searul.finditer(searesp.text))[:MAX_RESULTS]:
            gamelst.append({"name": i.group("NAME").strip(), "url": i.group("URL")})
            count += 1
        searesp.close()
        return [gamelst, count, yinqin]
    except:
        return [[], -1, yinqin]
