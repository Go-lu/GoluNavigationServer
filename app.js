const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer'); // 引入 multer 模块
const CryptoJS = require('crypto-js');
const app = express();
const NavService = require('./service/NavService');
const NavDatabaseDTO = require('./DTO/NavDatabaseDTO');
const logger = require('./utils/LoggerTool');
const parseUrlTool = require('./utils/ParseUrlTool.js');
require('dotenv').config(); // 引入 .env 文件

// 盐
const salt = 'GoluNavNB6666NMD';

// 创建 multer 实例,设置存储位置
const uploadDir = path.join(__dirname, 'public/imgs');
if (!fs.existsSync(uploadDir))
    fs.mkdirSync(uploadDir);


// 配置 multer
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir); // 设置图片存储位置
        },
        filename: (req, file, cb) => {
            // 生成文件名，例如使用日期时间戳
            cb(null, Date.now() + path.extname(file.originalname));
        }
    })
});

// 解析 application/json 格式的数据
app.use(bodyParser.json());

// 设置静态资源目录
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'dist')));

// 创建导航服务实例
const navService = new NavService();

/**
 * 根路由返回静态页面
 * @param app
 */
function sendIndex(app) {
    app.get('/', (req, res) => {
        try {
            res.sendFile(path.join(__dirname, 'dist', 'index.html'));
        } catch (err) {
            logger.error(err.message);
            res.status(500).send({code: 0, msg: err.message});
        }
    });
}

/**
 * 获取全部网站列表
 * @param app
 */
function getAllWebsite(app) {
    app.get('/api/getAllWebData/:type?', async (req, res) => {
        const type = req.params.type;
        try {
            if (type)
                logger.debug(`请求type为${type}的站点列表`);
            else logger.debug(`请求全部站点列表`);

            const webList = await navService.queryAllWebsite(type);
            res.status(200).json(
                {
                    code: 1,
                    msg: {
                        webTitle: process.env.WEBTITLE, // 网站标题
                        copyRightText: process.env.COPYRIGHT_TEXT, // 网站版权信息
                        copyRightLink: process.env.COPYRIGHT_LINK, // 网站版权链接
                        navList: webList // 站点列表
                    }
                });
        } catch (err) {
            logger.error(`查询type为${type}的站点列表失败!原因 ->`)
            logger.error(err.message);
            res.status(500).send({code: 0, msg: err.message});
        }
    });
}

/**
 * 根据id请求对应站点
 * @param app
 */
function getWebsiteById(app) {
    app.get('/api/getWebById/:id', async (req, res) => {
        try {
            const id = req.params.id;
            logger.debug(`请求id为${id}的站点`);

            const web = await navService.queryWebsiteById(id);
            res.status(200).json({code: 1, msg: web});
        } catch (err) {
            logger.error("查询id为${id}的站点失败!原因 ->")
            logger.error(err.message);
            res.status(500).send({code: 0, msg: err.message});
        }
    });
}

/**
 * 添加导航网站
 * @param app
 */
function addWebsite(app) {
    app.post('/api/add', async (req, res) => {
        try {
            const navDatabaseDTO = new NavDatabaseDTO(req.body);
            logger.debug(`添加导航网站 -> ${JSON.stringify(navDatabaseDTO)}`);
            const id = await navService.addWebsite(navDatabaseDTO);
            if (!id) {
                logger.error('添加导航网站 ->添加失败');
                res.status(500).send({code: 0, msg: '添加失败'});
            } else {
                res.status(200).send({code: 1, msg: '添加成功'});
            }
        } catch (err) {
            logger.error(`添加导航网站失败！原因 -> `);
            logger.error(err.message);
            res.status(500).send({code: 0, msg: err.message});
        }
    });
}

/**
 * 删除导航网站
 * @param app
 */
function deleteWebsiteById(app) {
    app.delete('/api/delete/:id', async (req, res) => {
        try {
            const id = req.params.id;
            logger.debug(`删除导航网站 -> id: ${id}`);
            const result = await navService.deleteWebsiteById(id);
            if (!result) {
                logger.error('删除导航网站 -> 删除失败');
                res.status(500).send({code: 0, msg: '删除失败'});
            } else {
                res.status(200).send({code: 1, msg: '删除成功'});
            }
        } catch (err) {
            logger.error(`删除导航网站失败！原因 ->`);
            logger.error(err.message);
            res.status(500).send({code: 0, msg: err.message});
        }
    });
}

/**
 * 更新导航网站
 * @param app
 */
function updateWebsiteById(app) {
    app.put('/api/update', async (req, res) => {
        try {
            const navDatabaseDTO = new NavDatabaseDTO(req.body);
            logger.debug(`更新导航网站 -> ${JSON.stringify(navDatabaseDTO)}`);
            const result = await navService.updateWebsiteById(navDatabaseDTO);
            if (!result) {
                logger.error('更新导航网站 -> 更新失败');
                res.status(500).send({code: 0, msg: '更新失败'});
            } else {
                res.status(200).send({code: 1, msg: '更新成功'});
            }
        } catch (err) {
            logger.error(`更新导航网站失败！原因 ->`);
            logger.error(err.message);
            res.status(500).send({code: 0, msg: err.message})
        }
    });
}

// 身份验证
function auth(app) {
    app.post('/api/auth', async (req, res) => {
        const reqPwd = req.body.password;
        const rightPwd = process.env.WEBSITE_PASSWORD;
        const secretPwd = CryptoJS.MD5(rightPwd + salt).toString();
        logger.debug(secretPwd);
        if (reqPwd === secretPwd) {
            res.status(200).send({code: 1, msg: true});
        } else res.status(200).send({code: 0, msg: false});
    })
}

/**
 * 根据url解析站点信息
 * @param app
 */
function parseUrl(app) {
    app.post('/api/parseUrl', async (req, res) => {
        try {
            const url = req.body.url;
            logger.debug(`解析url -> ${url}`);
            const info = await parseUrlTool(url);
            res.status(200).json({code: 1, msg: info});
        } catch (err) {
            logger.error(`解析url失败！原因 ->`);
            logger.error(err.message);
            res.status(500).send({code: 0, msg: err.message});
        }
    });
}


/**
 * 上传图片
 * @param app
 */
function uploadImage(app) {
    app.post('/api/upload', upload.single('file'), (req, res) => {
        if (!req.file)
            return res.status(400).json({error: 'No file uploaded.'});

        const filename = req.file.filename;

        res.send({success: true, path: `/imgs/${filename}`});
    });
}

/**
 * 根据ip获取地理位置
 * @param app
 */
function getLocation(app) {
    app.get('/api/location', async (req, res) => {
        const ip = req.query.ip;
        const ak = process.env.BAIDU_AK;
        if (!ip || !ak) return;
        try {
            const location = await navService.getLocation(ip, ak);
            res.status(200).json({code: 1, msg: location});
        } catch (err) {
            logger.error(`根据ip获取地理位置失败！原因 ->`);
            logger.error(err.message);
            res.status(200).send({code: 0, msg: err.message});
        }

    });
}

/**
 * 通过经纬度或者adcode获取天气信息
 * @param app
 */
function getWeather(app) {
    app.post('/api/weather', async (req, res) => {
        try {
            const {location, adCode} = req.body;
            const key = process.env.HEFENG_KEY;
            logger.debug(`根据经纬度或者adcode获取天气信息 -> location: ${location} adCode: ${adCode}`);
            const info = {
                location: location.indexOf('.') !== -1 ? location : '', // 经纬度或者adcode
                adCode: adCode,
            };

            const weather = await navService.getWeather(info, key);
            if (weather.code === 200 || weather.code === "200"){
                res.status(200).json({code: 1, msg: weather.now});
            }else res.status(200).send({code: 0, msg: weather});
        } catch (e) {
            logger.error(`根据经纬度或者adcode获取天气信息失败！原因 ->`);
            logger.error(e.message);
            res.status(200).send({code: 0, msg: e.message});
        }

    })
}

/**
 * 获取随机hitokoto
 * @param app
 */
function getHitokoto(app) {
    app.get('/api/hitokoto', async (req, res) => {
        try {
            const hitokoto = await navService.getRandomHitokoto();
            res.status(200).json({code: 1, msg: hitokoto});
        } catch (err) {
            logger.error(`获取随机hitokoto失败！原因 ->`);
            logger.error(err.message);
            res.status(200).send({code: 0, msg: err.message});
        }
    });
}

/**
 * 启动服务器
 */
(() => {
    sendIndex(app); // 根路由
    getAllWebsite(app); // 根据type请求对应站点列表
    getWebsiteById(app); // 根据id请求对应站点
    addWebsite(app); // 添加导航网站
    deleteWebsiteById(app); // 删除导航网站
    updateWebsiteById(app); // 更新导航网站
    auth(app); // 身份验证
    parseUrl(app); // 解析url
    uploadImage(app); // 上传图片
    getHitokoto(app); // 获取随机一言
    getLocation(app); // 获取地理位置
    getWeather(app); // 获取天气信息

    // 设置端口号，默认为8082
    const PORT = process.env.PORT || 8082;

    // 启动服务器
    try {
        app.listen(PORT, () => {
            logger.info("\n  ______             __                  __    __                      __                       __      __                     \n" +
                " /      \\           |  \\                |  \\  |  \\                    |  \\                     |  \\    |  \\                    \n" +
                "|  $$$$$$\\  ______  | $$ __    __       | $$\\ | $$  ______  __     __  \\$$  ______    ______  _| $$_    \\$$  ______   _______  \n" +
                "| $$ __\\$$ /      \\ | $$|  \\  |  \\      | $$$\\| $$ |      \\|  \\   /  \\|  \\ /      \\  |      \\|   $$ \\  |  \\ /      \\ |       \\ \n" +
                "| $$|    \\|  $$$$$$\\| $$| $$  | $$      | $$$$\\ $$  \\$$$$$$\\\\$$\\ /  $$| $$|  $$$$$$\\  \\$$$$$$\\\\$$$$$$  | $$|  $$$$$$\\| $$$$$$$\\\n" +
                "| $$ \\$$$$| $$  | $$| $$| $$  | $$      | $$\\$$ $$ /      $$ \\$$\\  $$ | $$| $$  | $$ /      $$ | $$ __ | $$| $$  | $$| $$  | $$\n" +
                "| $$__| $$| $$__/ $$| $$| $$__/ $$      | $$ \\$$$$|  $$$$$$$  \\$$ $$  | $$| $$__| $$|  $$$$$$$ | $$|  \\| $$| $$__/ $$| $$  | $$\n" +
                " \\$$    $$ \\$$    $$| $$ \\$$    $$      | $$  \\$$$ \\$$    $$   \\$$$   | $$ \\$$    $$ \\$$    $$  \\$$  $$| $$ \\$$    $$| $$  | $$\n" +
                "  \\$$$$$$   \\$$$$$$  \\$$  \\$$$$$$        \\$$   \\$$  \\$$$$$$$    \\$     \\$$ _\\$$$$$$$  \\$$$$$$$   \\$$$$  \\$$  \\$$$$$$  \\$$   \\$$\n" +
                "                                                                          |  \\__| $$                                           \n" +
                "                                                                           \\$$    $$                                           \n" +
                "                                                                            \\$$$$$$                                            " +
                `\nGolu Navigation 服务启动成功 ->PORT :::${PORT}   (✿ ◕‿◕) ᓄ✂╰U╯`);
        });
    } catch (err) {
        logger.error(`服务启动失败 -> ${err.message}`);
    }
})()

