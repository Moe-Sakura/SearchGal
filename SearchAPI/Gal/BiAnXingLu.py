from ..common import *

def BiAnXingLu(game: str, mode=False) -> list:
    yinqin = "彼岸星露"
    if mode:
        return yinqin
    try:
        searul = re.compile(
            r'<div class="post-info">\s*?<h2><a  href="(?P<URL>.*?)">(?P<NAME>.*?)</a></h2>',
            re.S,
        )
        searesp = session.get(
            url="https://seve.yugal.cc",
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

BiAnXingLu.color = "lime"
BiAnXingLu.magic = False