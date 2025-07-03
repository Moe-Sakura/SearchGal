from ..common import *

def TWOdfan(game: str, mode=False) -> list:
    yinqin = "2dfan"
    if mode:
        return yinqin
    try:
        searul = re.compile(
            r'<h4 class="media-heading"><a target="_blank" href="(?P<URL>.*?)">(?P<NAME>.*?)</a></h4>',
            re.S,
        )
        searesp = session.get(
            url="https://2dfan.com/subjects/search",
            params={"keyword": game},
            verify=False,
            headers=headers,
            timeout=timeoutsec,
        )
        if searesp.status_code != 200:
            raise Exception("Search API 响应状态码为 " + str(searesp.status_code))
        count = 0
        gamelst = []
        mainurl = "https://2dfan.com"
        for i in list(searul.finditer(json.loads(searesp.text)["subjects"]))[
            :MAX_RESULTS
        ]:
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

TWOdfan.color = "lime"
TWOdfan.magic = False