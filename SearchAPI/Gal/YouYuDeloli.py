from ..common import *


def YouYuDeloli(game: str, mode=False) -> list:
    yinqin = "忧郁的loli"
    if mode:
        return yinqin
    try:
        searul = re.compile(
            r'<p style="text-align: center;"> <a href=".*?" target="_blank">.*?<p style="text-align: center;"> <a href="(?P<URL>.*?)" title="(?P<NAME>.*?)"> <img src=',
            re.S,
        )
        searesp = session.get(
            url="https://www.ttloli.com/",
            params={"s": game},
            headers=headers,
            timeout=timeoutsec,
        )
        if searesp.status_code != 200:
            raise Exception("Search API 响应状态码为 " + str(searesp.status_code))
        count = 0
        gamelst = []
        for i in list(searul.finditer(searesp.text)):
            if i.group("NAME") == "详细更新日志":
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


YouYuDeloli.color = "lime"
YouYuDeloli.magic = False
