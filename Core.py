import os
import importlib
from SearchAPI.common import *


def load_modules_from_directory(directory):
    modules_with_metadata = []
    for filename in os.listdir(directory):
        if filename.endswith(".py") and filename != "__init__.py":
            module_name = f"{directory.replace('/', '.')}.{filename[:-3]}"
            try:
                module = importlib.import_module(module_name)
                main_object = getattr(module, filename[:-3])
                
                # 获取颜色和 magic 属性，如果不存在则使用默认值
                color = getattr(main_object, "color", "#FFFFFF")  # 默认白色
                magic = getattr(main_object, "magic", False)      # 默认 False
                
                modules_with_metadata.append((main_object, color, magic))
            except (ImportError, AttributeError) as e:
                print(f"Could not import {module_name}: {e}")
    return modules_with_metadata

# 动态加载 Gal 和 Patch 模块
gal_modules_with_metadata = load_modules_from_directory("SearchAPI/Gal")
patch_modules_with_metadata = load_modules_from_directory("SearchAPI/Patch")

# Cli命令行搜索平台
# search 列表只包含模块函数本身
search = [module for module, _, _ in gal_modules_with_metadata]

# GUI图形化搜索平台 Galgame平台
searchGUI = gal_modules_with_metadata
patchInfo = patch_modules_with_metadata

def generate_platforms(info):
    return [
        {
            "func": func,
            "color": color,
            "magic": magic,
            "name": func("", True),
        }
        for func, color, magic in info
    ]


PLATFORMS_GAL = generate_platforms(searchGUI)
PLATFORMS_PATCH = generate_platforms(patchInfo)
