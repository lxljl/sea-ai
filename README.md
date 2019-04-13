# sea-ai

模板使用云开发实现,接入百度AI平台API图像识别系统,无需另外搭建服务器,只需修改文件内配置项

## 项目介绍
一款方便快捷识别AI,可根据您拍摄或相册中照片识别出您所需要知道的物种(植物,动物,图文,菜品类型),相关知识,帮助您了解该物种,打开新世界!
<p align="center">
    <img src="https://github.com/lxljl/sea-ai/blob/master/src/images/home.jpg" alt="菊花码" width="200" height="200">
</p>

### 学习本项目

整套前端使用 [Wepy](https://github.com/tencent/wepy) 开发，提倡前端组件化工程化，高效的完成前端项目。

## 使用说明
* 申请[百度AI](http://ai.baidu.com/docs#/ImageClassify-API/top) 获取Appid,secret
* 找到文件内的appid,secret ， 修改为你微信小程序的appid以及secret

### 安装使用

#### 安装依赖

```console
cd sea-ai
npm install
```
#### 开发实时编译

```console
npm run
```

#### 开发者工具导入项目

使用`微信开发者工具`新建项目，本地开发选择项目根目录，会自动导入项目配置。


#### 上传安装云函数

开发者工具中找到云函数目录上传并部署：云端安装依赖（不上传node_modeles）
setBaiduToken 需上传触发器(定时器) 每十五天更新一次token

#### 添加数据库字段

```
identification-record
token
baidu-token
user

```
