from ..common import *

# 如果你想要修改正则 或者添加搜索平台 可以模仿该函数模板新建一个函数
# 这里函数的名字需要为文件名，用来表示一个平台的搜索规则
def Example(game: str, mode=False) -> list:
    # 设置平台的名字
    yinqin = "平台的名字"
    if mode:
        return yinqin
    try:
        # 设置好匹配的正则
        searul = re.compile(
            r"使用的正则表达式，子页面链接用(?P<URL>.*?)匹配，项目名用(?P<NAME>.*?)匹配",
            re.S,
        )

        # 设置平台的链接，搜索所使用的参数 (如果搜索页不使用GET传参s关键字，则需要另外写session规则)
        # 如果有cf防护请使用sp而不是session
        searesp = session.get(
            url="平台主链接", params={"s": game}, headers=headers, timeout=timeoutsec
        )
        if searesp.status_code != 200:
            raise Exception("自定义报错信息")

        count = 0
        gamelst = []
        for i in list(searul.finditer(searesp.text))[:MAX_RESULTS]:
            gamelst.append({"name": i.group("NAME").strip(), "url": i.group("URL")})
            count += 1
        searesp.close()

        # 返回的内容为一个装载 包含搜索到的多个{项目名:子页面链接}字典的列表,搜索到的数量,平台的名字  (正常这里不用动)
        return [gamelst, count, yinqin]
    except Exception as e:
        # 异常处理，当搜索到的数量返回-1，会判定为搜索失败
        return [[], -1, yinqin, e]

# 定义平台的颜色 
# gold 金色  lime 绿色  white 白色
Example.color = "lime"

# 定义平台是否需要魔法才能访问
Example.magic = False