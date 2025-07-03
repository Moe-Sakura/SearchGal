from ..common import *

def ACGYingYingGuai(game: str, mode=False) -> list:
    yinqin = "ACG嘤嘤怪"
    if mode:
        return yinqin
    try:
        searul = re.compile(
            r'<a  target="_blank" href="(?P<URL>.*?)" title="(?P<NAME>.*?)"  class="post-overlay">'
        )
        searesp = session.get(
            url=f"https://acgyyg.ru/",
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

ACGYingYingGuai.color = "white"
ACGYingYingGuai.magic = False