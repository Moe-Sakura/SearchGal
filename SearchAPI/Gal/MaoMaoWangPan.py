from ..common import *


def MaoMaoWangPan(game: str, mode=False) -> list:
    yinqin = "猫猫网盘"
    if mode:
        return yinqin
    try:
        data = {
            "parent": "/GalGame/",
            "keywords": game,
            "scope": 0,
            "page": 1,
            "per_page": MAX_RESULTS,
            "password": "",
        }
        searesp = session.post(
            url="https://catcat.cloud/api/fs/search",
            json=data,
            headers=headers,
            timeout=timeoutsec,
        )
        resjson = json.loads(searesp.text)
        if resjson["message"] != "success":
            raise Exception(str(resjson))
        count = 0
        gamelst = []
        mainurl = "https://catcat.cloud"
        reslen = len(resjson["data"]["content"])
        if (reslen != resjson["data"]["total"]) and (reslen != 20):
            raise Exception("访问密码错误")
        for i in resjson["data"]["content"]:
            if not i["parent"].startswith("/GalGame/SP后端1[GalGame分区]/"):
                continue
            gamelst.append(
                {
                    "name": i["name"].strip(),
                    "url": mainurl + i["parent"] + "/" + i["name"],
                }
            )
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


MaoMaoWangPan.color = "lime"
MaoMaoWangPan.magic = False
