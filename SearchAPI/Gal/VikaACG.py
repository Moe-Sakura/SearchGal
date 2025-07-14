from ..common import *


def VikaACG(game: str, mode=False) -> list:
    yinqin = "VikaACG"
    if mode:
        return yinqin
    try:
        searul = re.compile(
            r'<h2><a  target="_blank" href="(?P<URL>.*?)">(?P<NAME>.*?)<', re.S
        )
        # searul = re.compile(r'<h2><a  href="(?P<URL>.*?)">(?P<NAME>.*?)</a></h2>',re.S)
        searesp = session.post(
            url="https://www.vikacg.com/wp-json/b2/v1/getPostList",
            json={
                "paged": 1,
                "post_paged": 1,
                # Limit硬编码：过大将导致超时
                "post_count": min(MAX_RESULTS, 1000),
                "post_type": "post-1",
                "post_cat": [6],
                "post_order": "modified",
                "post_meta": [
                    "user",
                    "date",
                    "des",
                    "cats",
                    "like",
                    "comment",
                    "views",
                    "video",
                    "download",
                    "hide",
                ],
                "metas": {},
                "search": f"{game}",
            },
            headers={
                "Connection": "close",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Content-Type": "application/json",
            },
            timeout=timeoutsec,
        )
        if searesp.status_code != 200:
            raise Exception("Search API 响应状态码为 " + str(searesp.status_code))
        restxt = (
            searesp.text.replace("\\/", "/")
            .replace("\\\\", "\\")
            .encode("utf-8")
            .decode("unicode_escape")
        )
        count = 0
        gamelst = []
        for i in list(searul.finditer(restxt))[:MAX_RESULTS]:
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


VikaACG.color = "gold"
VikaACG.magic = True
