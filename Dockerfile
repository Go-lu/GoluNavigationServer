# 使用带有 Node.js 和 git 的轻量级基础镜像
FROM node:20-alpine3.13

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
# 更新包列表
RUN apk update

# 安装基础构建工具
RUN apk add --no-cache build-base

# 安装 wget
RUN apk add --no-cache wget

# 安装 libffi-dev
RUN apk add --no-cache libffi-dev

# 安装 openssl-dev
RUN apk add --no-cache openssl-dev

# 安装 bash
RUN apk add --no-cache bash

# 下载并安装特定版本的 Python 3.8
RUN wget https://www.python.org/ftp/python/3.8.10/Python-3.8.10.tgz && \
    tar xzf Python-3.8.10.tgz && \
    cd Python-3.8.10 && \
    ./configure --enable-optimizations && \
    make altinstall

# 清理安装文件
RUN rm -rf /Python-3.8.10.tgz /Python-3.8.10

# 为了确保使用 `python` 命令也指向 Python 3.8，可以创建一个符号链接
RUN ln -sf /usr/local/bin/python3.8 /usr/bin/python && \
    ln -sf /usr/local/bin/pip3.8 /usr/bin/pip

# 确认安装的 Python 版本
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

