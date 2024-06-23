#!/usr/bin/python3
# -*- coding:utf8 -*-
import os
import sys
import shutil
import re

print("----------------------H5开始编译-------------")
os.system("tsc -p ./MyLogic/tsconfig.json")
print("----------------------H5编译完成-------------")
