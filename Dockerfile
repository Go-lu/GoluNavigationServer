# 使用带有 Node.js 和 git 的轻量级基础镜像
FROM node:20-alpine

# 设置镜像源 并测试
RUN echo -e 'https://mirrors.aliyun.com/alpine/v3.6/main/\nhttps://mirrors.aliyun.com/alpine/v3.6/community/' > /etc/apk/repositories \
    && apk update \
    && apk upgrade \
    && apk --no-cache add ttf-dejavu fontconfig
# 设置维护者信息
LABEL maintainer="Golu goluli@qq.com"

# 安装 git
RUN apk add --no-cache git

# 更新包列表并安装必要的软件包
RUN apk add --no-cache openssl

# ########## 安装Python3.8 ##################
# 更新包列表并安装必要的软件包
RUN apk update && \
    apk add --no-cache \
    build-base \
    wget \
    libffi-dev \
    openssl-dev

# 移除可能已存在的旧版本 Python
RUN apk del python3

# 添加特定版本的社区仓库
RUN echo "http://dl-cdn.alpinelinux.org/alpine/v3.14/main" >> /etc/apk/repositories && \
    echo "http://dl-cdn.alpinelinux.org/alpine/v3.14/community" >> /etc/apk/repositories

# 安装 Python 3.8
RUN apk update && \
    apk add --no-cache python3=3.8.10-r0 python3-dev=3.8.10-r0 py3-pip

# 确认安装的 Python 版本
RUN python3 --version

# 为了确保使用 `python` 命令也指向 Python 3.8，可以创建一个符号链接
RUN ln -sf python3 /usr/bin/python

# 检查 Python 版本
RUN python --version

# ###############################################################

# 设置工作目录
WORKDIR /app

# 克隆前端项目
RUN git clone https://gitee.com/golu-ljg/golu-navigation-web.git /tmp/app

# 进入临时目录，安装依赖并构建项目
WORKDIR /tmp/app
RUN npm install
RUN npm run build

# 将构建后的文件移动到/app目录下
RUN mv dist /app/

# 返回/app目录，清理临时文件
WORKDIR /app
RUN rm -rf /tmp/app

# 复制文件到运行目录
COPY . .
# 安装依赖
RUN npm install

# 暴露应用需要的端口
EXPOSE 8082

# 指定容器启动命令
CMD ["node", "/app/app.js"]

