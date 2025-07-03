from ..common import *

def ZiLingDeMiaoMiaoWu(game: str, mode=False) -> list:
    yinqin = "梓澪の妙妙屋"
    if mode:
        return yinqin
    try:
        data = {
            "parent": "/",
            "keywords": game,
            "scope": 0,
            "page": 1,
            "per_page": 20,
            "password": "",
        }
        searesp = session.post(
            url=f"https://zi0.cc/api/fs/search",
            json=data,
            headers=headers,
            timeout=timeoutsec,
        )
        resjson = json.loads(searesp.text)
        if resjson["message"] != "success":
            raise Exception(str(resjson))
        count = 0
        gamelst = []
        mainurl = "https://zi0.cc"
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

ZiLingDeMiaoMiaoWu.color = "lime"
ZiLingDeMiaoMiaoWu.magic = False