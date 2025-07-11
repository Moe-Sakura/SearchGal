from ..common import *

def ZiYuanShe(game: str, mode=False, zypassword="") -> list:
    yinqin = "紫缘Gal"
    if mode:
        return yinqin
    try:
        data = {
            "parent": "/",
            "keywords": game,
            "scope": 0,
            "page": 1,
            "per_page": MAX_RESULTS,
            "password": zypassword,
        }
        searesp = session.post(
            url=f"https://galzy.eu.org/api/fs/search",
            json=data,
            headers=headers,
            timeout=timeoutsec,
        )
        resjson = json.loads(searesp.text)
        if resjson["message"] != "success":
            raise Exception(str(resjson))
        count = 0
        gamelst = []
        mainurl = "https://galzy.eu.org"
        reslen = len(resjson["data"]["content"])
        if (reslen != resjson["data"]["total"]) and (reslen != 20):
            raise Exception("访问密码错误")
        for i in resjson["data"]["content"][:MAX_RESULTS]:
            gamelst.append(
                {
                    "name": i["name"].strip(),
                    "url": mainurl + i["parent"] + "/" + i["name"],
                }
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

ZiYuanShe.color = "white"
ZiYuanShe.magic = False