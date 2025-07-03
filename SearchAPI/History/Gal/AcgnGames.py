from ..common import *


# 倒了
def acgngames(game: str, mode=False) -> list:
    yinqin = "AcgnGames"
    if mode:
        return yinqin
    try:
        searul = re.compile(
            r'<h2 class="kratos-entry-title-new"><a href="(?P<URL>.*?)">(?P<NAME>.*?)</a></h2>',
            re.S,
        )
        searesp = session.get(
            url="https://acgngames.net/", params={"s": game}, headers=headers
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
