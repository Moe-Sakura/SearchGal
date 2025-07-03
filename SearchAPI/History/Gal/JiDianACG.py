from ..common import *


# 资源站
# 倒了
def jidian(game: str, mode=False) -> list:
    yinqin = "极点ACG"
    if mode:
        return yinqin
    try:
        searul = re.compile(
            r'<a itemprop="url" rel="bookmark" href="(?P<URL>.*?)" title=".*?" target="_blank"><span class="post-sign">.*?</span>(?P<NAME>.*?)</a></h3>',
            re.S,
        )
        searesp = session.get(
            url="https://lspgal.us/", params={"s": game}, headers=headers
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
