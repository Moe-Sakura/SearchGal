from ..common import *


def GGBases(game: str, mode=False) -> list:
    yinqin = "GGBases"
    if mode:
        return yinqin
    try:
        searul = re.compile(
            r'<a index=\d+ id="bid(?P<URL>\d*?)" name="title" c=".*?" target="_blank" href=".*?">(?P<NAME>.*?)</a>',
            re.S,
        )
        searesp = session.get(
            url=f"https://www.ggbases.com/search.so?p=0&title={game}",
            verify=False,
            headers=headers,
            timeout=timeoutsec,
        )
        if searesp.status_code != 200:
            raise Exception("Search API 响应状态码为 " + str(searesp.status_code))
        restext = searesp.text.replace("</b>", "").replace("<b style='color:red'>", "")
        count = 0
        gamelst = []
        mainurl = "https://www.ggbases.com/view.so?id="
        for i in list(searul.finditer(restext))[:MAX_RESULTS]:
            gamelst.append(
                {"name": i.group("NAME").strip(), "url": mainurl + i.group("URL")}
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


GGBases.color = "lime"
GGBases.magic = False
