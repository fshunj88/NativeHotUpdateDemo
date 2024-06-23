#!/usr/bin/python3
# -*- coding:utf8 -*-

import os
import sys
import shutil
import re


def is_js_file(filename):
    return filename.endswith('.js')


def find_files(directory):
    pattern = r'^project.*js'

    for root, dirs, files in os.walk(directory):
        for file in files:
            if re.match(pattern, file):
                if is_js_file(os.path.join(root, file)):
                    return os.path.join(root, file)


def delete_file(file_path):
    if os.path.exists(file_path):
        os.remove(file_path)
        print("文件删除成功"+file_path)
    else:
        print("文件不存在"+file_path)

def delete_dir(dir_path):
    if os.path.exists(dir_path):
        shutil.rmtree(dir_path)
        print("文件夹删除成功"+dir_path)
    else:
        print("文件不存在"+dir_path)


def copyFiles(srcDir, dstDir):
    if not os.path.exists(dstDir):
        os.mkdir(dstDir)
    for file in os.listdir(srcDir):
        srcFile = os.path.join(srcDir, file)
        dstFile = os.path.join(dstDir, file)
        if os.path.isfile(srcFile):
            shutil.copy(srcFile, dstFile)

srcFile = "/Users/mac/Desktop/All/Cocos/cocos_re_geng/NativeHotUpdateNew/build/jsb-default"
dstFile = "/Users/mac/Desktop/All/Cocos/cocos_re_geng/NativeHotUpdateNew/jsb-default"

#删除文件main.js,project.json,cocos-project-template.json
delete_file(dstFile+"/main.js")
delete_file(dstFile+"/project.json")
delete_file(dstFile+"/cocos-project-template.json")

#删除文件夹res,src,subpackages,jsb-adapter
delete_dir(dstFile+'/res')
delete_dir(dstFile+'/src')
delete_dir(dstFile+'/subpackages')
delete_dir(dstFile+'/jsb-adapter')

#拷贝main.js,project.json,cocos-project-template.json
src = srcFile+"/main.js"
dst = dstFile+"/main.js"
shutil.copy(src, dst)
print("拷贝main.js成功")

src = srcFile+"/project.json"
dst = dstFile+"/project.json"
shutil.copy(src, dst)
print("拷贝project.json成功")

src = srcFile+"/cocos-project-template.json"
dst = dstFile+"/cocos-project-template.json"
shutil.copy(src, dst)
print("拷贝cocos-project-template.json成功")

#拷贝文件夹res,src,subpackages
src = srcFile+'/res'
dst = dstFile+'/res'
shutil.copytree(src, dst)
print("拷贝res成功")

src = srcFile+'/src'
dst = dstFile+'/src'
shutil.copytree(src, dst)
print("拷贝src成功")

src = srcFile+'/subpackages'
dst = dstFile+'/subpackages'
shutil.copytree(src, dst)
print("拷贝subpackages成功")

src = srcFile+'/jsb-adapter'
dst = dstFile+'/jsb-adapter'
shutil.copytree(src, dst)
print("拷贝jsb-adapter成功")

print("---------IOS info.list update--------")
#比如横屏竖屏的设置,info.list的Supported interface orientations
delete_file(dstFile+"/frameworks/runtime-src/proj.ios_mac/ios/Info.plist")
src = srcFile+"/frameworks/runtime-src/proj.ios_mac/ios/Info.plist"
dst = dstFile+"/frameworks/runtime-src/proj.ios_mac/ios/Info.plist"
shutil.copy(src, dst)
print("拷贝Info.plist成功")

