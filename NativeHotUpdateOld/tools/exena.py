#!/usr/bin/python3
# -*- coding:utf8 -*-

import os
import sys
import shutil
import re

#这个py脚本用于更新原生工程的所有资源包括脚本；
cc_cocoscreator_path= '/Applications/Cocos/Creator/2.2.2/CocosCreator.app/Contents/MacOS'
print("----------------------开始编译ts-------------")
os.system("tsc -p ./MyLogic/tsconfig.json")

print("----------------------ts编译完成-------------")


print("----------------------开始构建-------------")
#9dcde1ed-5742-4ad7-9246-c1adc4f01bdd这个是myscene是uuid
# #orientation={\'portrait\': false,\'landscapeLeft\': true,\'landscapeRight\': true,\'upsideDown\': false};\
buildStr = '%s/CocosCreator --path ./ --build \
			"buildPath=build;\
			template=default;\
			platform=android;\
			title=Mycocos;\
			inlineSpriteFrames=false;\
			optimizeHotUpdate=false;\
			debug=true;\
			sourceMaps=true;\
			packageName="com.fshunj.myGame"\
			"' % \
			(cc_cocoscreator_path)
os.system(buildStr)
print("----------------------构建完成-------------")

print("----------------------开始更新原生工程src,res等等-------------")
os.system("./tools/tran.py")
print("----------------------更新桌面原生工程src,res完成-------------")

# 热更相关的修改，往main.js中首行增加一些代码
main_path = "/Users/mac/Desktop/All/Cocos/cocos_re_geng/NativeHotUpdateOld/jsb-default/main.js"

code = ''' (function () { 
    if (typeof window.jsb === 'object') {
        var hotUpdateSearchPaths = localStorage.getItem('HotUpdateSearchPaths');
        if (hotUpdateSearchPaths) {
            var paths = JSON.parse(hotUpdateSearchPaths);
            console.log("[main.js]-->curSearchPaths:",jsb.fileUtils.getSearchPaths());
            console.log("[mian.js]-->hotUpdateSearchPaths exists:",paths);
            jsb.fileUtils.setSearchPaths(paths);

            var fileList = [];
            var storagePath = paths[0] || '';
            var tempPath = storagePath + '_temp/';
            var baseOffset = tempPath.length;

            if (jsb.fileUtils.isDirectoryExist(tempPath) && !jsb.fileUtils.isFileExist(tempPath + 'project.manifest.temp')) {
                console.log("process temp_path");
                jsb.fileUtils.listFilesRecursively(tempPath, fileList);
                fileList.forEach(srcPath => {
                    var relativePath = srcPath.substr(baseOffset);
                    var dstPath = storagePath + relativePath;

                    if (srcPath[srcPath.length] == '/') {
                        cc.fileUtils.createDirectory(dstPath)
                    }
                    else {
                        if (cc.fileUtils.isFileExist(dstPath)) {
                            cc.fileUtils.removeFile(dstPath)
                        }
                        cc.fileUtils.renameFile(srcPath, dstPath);
                    }
                })
                cc.fileUtils.removeDirectory(tempPath);
            }
        }
    }
})();

'''

if os.path.exists(main_path):
	with open(main_path, 'r+') as f:
		content = f.read()
		f.seek(0, 0)
		f.write(code + content)
		print("----------------------修改main.js成功-------------")


#CocosCreator构建参数
#--path：指定项目路径
#--build：指定构建项目使用的参数
#--compile：指定编译项目使用的参数
#--force：跳过版本升级检测，不弹出升级提示框
#
#在 --build 或者 --compile 后如果没有指定参数，则会使用 Creator 中构建面板当前的平台、模板等设置来作为默认参数。如果指定了其他参数设置，则会使用指定的参数来覆盖默认参数。可选择的参数有：
#
#excludedModules - engine 中需要排除的模块，模块可以从 这里 查找到
#title - 项目名
#platform - 构建的平台 [web-mobile、web-desktop、android、win32、ios、mac、wechatgame、wechatgame-subcontext、baidugame、baidugame-subcontext、xiaomi、alipay、qgame、quickgame、huawei、cocosplay、fb-instant-games、android-instant]
#buildPath - 构建目录
#startScene - 主场景的 uuid 值（参与构建的场景将使用上一次的编辑器中的构建设置）
#debug - 是否为 debug 模式
#previewWidth - web desktop 窗口宽度
#previewHeight - web desktop 窗口高度
#sourceMaps - 是否需要加入 source maps
#webOrientation - web mobile 平台（不含微信小游戏）下的旋转选项 [landscape、portrait、auto]
#inlineSpriteFrames - 是否内联所有 SpriteFrame
#optimizeHotUpdate - 是否将图集中的全部 SpriteFrame 合并到同一个包中
#
#packageName - 包名
#
#useDebugKeystore - 是否使用 debug keystore
#keystorePath - keystore 路径
#keystorePassword - keystore 密码
#keystoreAlias - keystore 别名
#keystoreAliasPassword - keystore 别名密码
#orientation - native 平台（不含微信小游戏）下的旋转选项 [portrait, upsideDown, landscapeLeft, landscapeRight] 因为这是一个 object，所以定义会特殊一些：
#orientation={'landscapeLeft': true} 或 orientation={'landscapeLeft': true, 'portrait': true}
#Portrait ---> 这个是竖屏展示；
#Upside Down    --> 这个是手机竖屏，但是你的手机需要倒过来；
#Landscape Left      --> 这个是横屏，屏幕在home键左边；（常用的）
#Landscape Right    --> 这个也是横屏，屏幕在home右边。
#template - native 平台下的模板选项 [default、link]
#
#apiLevel - 设置编译 android 使用的 api 版本
#
#appABIs - 设置 android 需要支持的 cpu 类型，可以选择一个或多个选项 [armeabi-v7a、arm64-v8a、x86]
#因为这是一个数组类型，数据类型需要像这样定义，注意选项需要用引号括起来：
#
#appABIs=['armeabi-v7a','x86']
#embedWebDebugger - 是否在 Web 平台下插入 vConsole 调试插件
#
#md5Cache - 是否开启 md5 缓存
#encryptJs - 是否在发布 native 平台时加密 js 文件
#xxteaKey - 加密 js 文件时使用的密钥
#zipCompressJs - 加密 js 文件后是否进一步压缩 js 文件
#autoCompile - 是否在构建完成后自动进行编译项目，默认为 否。
#configPath - 参数文件路径。如果定义了这个字段，那么构建时将会按照 json 文件格式来加载这个数据，并作为构建参数
#目前支持使用命令行发布的参数不多，如果没传参数的话，将会使用上一次构建的配置。建议在某台电脑上手动打包后，将设置好的构建配置文件（settings 目录中）上传到代码仓库，然后再在打包机上拉取这些配置即可。