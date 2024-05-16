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
# 更新包列表
RUN apk update

# 安装 Python 3.8 和 pip
RUN apk add --no-cache python3 python3-dev py3-pip

# 安装构建工具
RUN apk add --no-cache bash make g++

# 创建符号链接以确保 python 命令指向 python3
RUN ln -sf /usr/bin/python3 /usr/bin/python && \
    ln -sf /usr/bin/pip3 /usr/bin/pip

# 确认安装的 Python 版本和构建工具
RUN python --version && pip --version && make --version && g++ --version

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

