<h1 style="text-align: center;">GoluNavigationServer</h1>

## 此项目为[GoluNavigationWeb](https://github.com/Go-lu/GoluNavigationWeb)项目的后端，需搭配使用
### 一个简洁且现代化的导航页，前端使用vue，后端node，数据持久化到sqlite
### [在gitee看此项目](https://github.com/Go-lu/GoluNavigationServer)

##### 设计效果：
###### _点此预览： [Demo](http://demo.nav.golu.top)_
> - [x] 具有ipv6、ipv4、lan三种网络状态的导航聚合切换
> - [x] 可切换白天和夜晚模式
> - [x] 动态网页title [一言和天气]
> - [x] 一言实现数据库缓存
> - [x] 丰富的随机动画效果 [使用animate.css]
> - [ ] 隐私导航页 [密码验证或登录验证]
> - [ ] 搜索框 [添加后可作为浏览器首页]
> - [x] 后台管理 [连续点击主题切换十次后触发修改操作]
> - [x] 数据库存储数据
> - [x] 所有密钥均配置在后端环境变量，前度的数据均由后端代理请求，安全性大大提升
> - [ ] 使用数据库存储配置信息
> - [ ] ~~更换后端工具~~
> - [ ] ......

## 食用方式：
### 一、node运行：
> 1. 克隆到本地后cd到项目根目录，安装依赖：
>    >
>    > `npm install`
>    >
> 2. 将[GoluNavigationWeb](https://github.com/Go-lu/GoluNavigationWeb)前端项目打包后的dist目录扔进后端项目根目录中
> 3. 修改项目根目录下的`.env`配置文件
> 4.  运行：
>    >
>    > 
>    >
>    >  `node app.js`


### 二、Docker运行（不需要手动打包前端项目）：  
#### 注意：暂时没有数据导出，建议创建容器时将数据库文件挂载到宿主机目录，数据库文件路径：`/app/database/navDatabase.db`
> ***目前已发布镜像，可直接创建容器，镜像为：`goolucky/golu-nav:1.0.0`***
> - 自打包镜像：
>   - 拉取后端仓库代码 `git clone https://github.com/Go-lu/GoluNavigationServer.git`
>   - 进入到项目根目录 `cd GoluNavigationServer`
>   - 构建镜像 `docker build -t golunavserver .`
>   - 运行镜像 
>     - 方式一(docker run)：
>       ~~~docker
>       docker run -d \
>           -p 8082:8082 \
>           -e WEBTITLE=GoluのNav \
>           -e COPYRIGHT_TEXT=咕噜Golu \
>           -e COPYRIGHT_LINK=https://www.golu-ljg.cn \
>           -e WEBSITE_PASSWORD=123456 \
>           -e PORT=8082 \
>           -e BAIDU_AK=aaaaaaaaaaaaaaadddddddddd \
>           -e HEFENG_KEY=dfefeffffffffffffffffff \
>           --name golunavserver \
>           golunavserver
>       ~~~
>       **指令说明：**
>       ~~~docker
>       docker run -d \ # 运行容器 -d 后台运行
>           -p 8082:8082 \ # 映射端口 前面的8082是宿主机端口 后面的8082是容器端口
>           -e WEBTITLE=GoluのNav \ # 网页title
>           -e COPYRIGHT_TEXT=咕噜Golu \ # 版权文字
>           -e COPYRIGHT_LINK=https://www.golu-ljg.cn \ # 点击版权后跳转的链接
>           -e WEBSITE_PASSWORD=123456 \ # 网站密码，用于修改配置信息
>           -e PORT=8082 \ # 网站运行的端口
>           -e BAIDU_AK=aaaaaaaaaaaaaaadddddddddd \ # 百度地图ak，请更换为自己的ak，创建应用时选择服务端，地址：https://lbsyun.baidu.com/apiconsole/center#/home
>           -e HEFENG_KEY=dfefeffffffffffffffffff \ # 和风天气key， 请更换为自己的key，创建应用时选择服务端，地址：https://dev.heweather.com/
>           --name golunavserver \ # 容器名称
>           golunavserver # 镜像名称，根据打包出的镜像名修改
>       ~~~
>       
>       - 方式二(docker-compose.yml)：
>         ~~~yaml
>         version: '3'
>         services:
>           navigation:
>             image: golunav
>             container_name: navigation
>             ports:
>               - "8082:8082"
>             volumes:
>               - ./database:/app
>             environment:
>               - WEBTITLE=GoluのNav
>               - COPYRIGHT_TEXT=咕噜Golu
>               - COPYRIGHT_LINK=https://www.golu-ljg.cn
>               - WEBSITE_PASSWORD=123456
>               - PORT=8082
>               - BAIDU_AK=aaaaaaaaaaaaaaadddddddddd
>               - HEFENG_KEY=dfefeffffffffffffffffff
>            ~~~
>            **运行：`docker-compose up -d`**
>       
> 
> - 拉取镜像：
>   `docker pull goolucky/golu-nav:1.0.0`
