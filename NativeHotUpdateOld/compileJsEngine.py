#!/usr/bin/python3
# -*- coding:utf8 -*-
import os
import sys
import shutil
import re

print("----------------------JsEngine开始编译-------------")
os.chdir("/Users/mac/Desktop/CocosCreator222Engine/engine")
os.system("gulp build")
print("----------------------JsEngine编译完成-------------")
