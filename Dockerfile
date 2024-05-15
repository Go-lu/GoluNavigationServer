# 使用带有 Node.js 和 git 的轻量级基础镜像
FROM node:18-alpine3.14

# 设置维护者信息
LABEL maintainer="Golu goluli@qq.com"

# 安装 git
RUN apk add --no-cache git

# 设置工作目录
WORKDIR /app

# 克隆前端项目
RUN git clone https://github.com/Go-lu/GoluNavigationWeb.git /tmp/app

# 进入临时目录，安装依赖并构建项目
WORKDIR /tmp/app
RUN npm install
RUN npm run build

# 将构建后的文件移动到/app目录下
RUN mv dist /app/

# 返回/app目录，清理临时文件
WORKDIR /app
RUN rm -rf /tmp/app

# 暴露应用需要的端口
EXPOSE 8082

# 指定容器启动命令
CMD ["node", "/app/app.js"]

