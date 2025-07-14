from ..common import *


def QingJiACG(game: str, mode=False) -> list:
    yinqin = "青桔ACG"
    if mode:
        return yinqin
    try:
        searul = re.compile(
            r'" class="lazyload fit-cover radius8"></a></div><div class="item-body"><h2 class="item-heading"><a href="(?P<URL>.*?)">(?P<NAME>.*?)</a></h2>',
            re.S,
        )
        searesp = sp.get(
            url="https://www.qingju.org/",
            params={"s": game, "type": "post"},
            headers=headers,
            timeout=timeoutsec,
        )
        # print(searesp.text)
        if searesp.status_code != 200:
            raise Exception("Search API 响应状态码为 " + str(searesp.status_code))
        count = 0
        gamelst = []
        for i in list(searul.finditer(searesp.text)):
            if "</p>" in i.group("URL"):
                continue
            gamelst.append({"name": i.group("NAME").strip(), "url": i.group("URL")})
            count += 1
            if len(gamelst) == MAX_RESULTS:
                break
        searesp.close()
        return [gamelst, count, yinqin]
    except Exception as e:
        try:
            searesp.close()
        except Exception:
            pass
        return [[], -1, yinqin, e]


QingJiACG.color = "lime"
QingJiACG.magic = False
