/**
 * Author: Golu
 *
 * CreatTime: 2024/05/09
 *
 * @type {sqlite3}
 *
 * Description:
 *      对Nav数据库操作的封装，封装了数据库操作的增删改查
 *
 *      表字段说明：
 *         > - id: id
 *         > - desc: 网站描述
 *         > - url: 网站链接
 *         > - image_url: 图标链接
 *         > - auth: 占位字段
 *         > - type: 站位字段
 *         > - creat_time: 创建时间，暂时冗余
 *         > - update_time: 更新时间，暂时冗余
 */
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const logger = require("./LoggerTool");

/**
 * 导出Nav数据库操作类
 * @type {NavDatabase}
 */
class NavDatabase {
    #db;

    constructor({navDbPath = '../database/navDatabase.db'} = {}) {
        // Nav数据库文件路径
        this.navDbPath = navDbPath; // 数据库文件路径

        /* 初始化数据库文件 */
        if (!fs.existsSync(this.navDbPath)) {
            // 创建数据库连接
            this.#db = new sqlite3.Database(this.navDbPath, (err) => {
                if (err) {
                    logger.error("创建数据库文件失败,原因 -> ");
                    logger.error(err);
                } else {
                    // 创建数据库表
                    try {
                        this.#db.serialize(() => {
                            /* 创建website表 */
                            this.#db.run(
                                "CREATE TABLE IF NOT EXISTS website (id INTEGER PRIMARY KEY, desc TEXT NOT NULL, url TEXT NOT NULL, image_url TEXT NOT NULL,auth TEXT, type TEXT, creat_time TEXT, update_time TEXT)",
                                (err) => {
                                    if (err) {
                                        logger.error("创建数据库表失败,原因 -> ");
                                        logger.error(err);
                                        return;
                                    }
                                    logger.debug("创建数据库表<-website->成功");
                                }
                            );
                            /* 创建hitokoto表 */
                            this.#db.run(
                                "CREATE TABLE IF NOT EXISTS hitokoto (id INTEGER PRIMARY KEY,uuid TEXT UNIQUE, hitokoto TEXT NOT NULL, type TEXT, 'from' TEXT, from_who TEXT, creator TEXT, creator_uid INTEGER, reviewer INTEGER, created_at TEXT, length INTEGER)",
                                (err) => {
                                    if (err) {
                                        logger.error("创建数据库表失败,原因 -> ");
                                        logger.error(err);
                                        return;
                                    }
                                    logger.debug("创建数据库表<-hitokoto->成功");
                                    logger.info("SUCCESS: 数据库初始化成功！");
                                });
                        });
                    } catch (err) {
                        logger.error("创建数据库表失败,原因 -> ");
                        logger.error(err);
                    } finally {
                        this.#db.close((err) => {
                            if (err) {
                                logger.error("关闭数据库失败,原因 -> ");
                                logger.error(err);
                                return;
                            }
                            logger.debug("关闭数据库成功");
                        });
                    }
                }
            });
        }
    }

    /**
     * 添加网站
     * @param navDatabaseDTO NavDatabaseDTO
     */
    async addWebsite(navDatabaseDTO) {
        const [params, values] = this.#getUsefulSql(navDatabaseDTO);
        if (values.length <= 0) {
            return 0;
        }
        // 创建一个与params长度相等的问号字符串
        const questionMarks = new Array(params.length).fill('?').join(', ');
        const insertSql = `INSERT INTO website (${params.join(", ")})
                           VALUES (${questionMarks})`;

        // 创建数据库连接
        const db = new sqlite3.Database(this.navDbPath);
        // 插入数据
        return new Promise((resolve, reject) => {
            db.run(insertSql, values, function (err) {
                if (err) {
                    logger.error("添加新站点失败,原因 -> ");
                    logger.error(err);
                    reject(err);
                    return;
                }
                logger.info("SUCCESS: 添加操作成功！");
                resolve(this.lastID);
            });
        }).finally(() => {
            this.#closeDB(db);
        })
    }

    /**
     * 删除网站
     * @param id id
     */
    async deleteWebsiteById(id) {
        // 创建数据库连接
        const db = new sqlite3.Database(this.navDbPath);
        // 删除数据
        return new Promise((resolve, reject) => {
            db.run("DELETE FROM website WHERE id = ?", [id], function (err) {
                if (err) {
                    logger.error("删除站点失败,原因 -> ");
                    logger.error(err);
                    reject(err);
                    return;
                }
                logger.info("SUCCESS: 删除操作成功！");
                resolve(this.changes); // 被影响的行数
            });
        }).finally(() => {
            this.#closeDB(db);
        })
    }

    /**
     * 更新网站
     * @param navDatabaseDTO NavDatabaseDTO
     */
    async updateWebsiteById(navDatabaseDTO) {
        const [params, values] = this.#getUsefulSql(navDatabaseDTO);
        if (values.length <= 0 || isNaN(navDatabaseDTO.id)) {
            return;
        }
        const updateSql = `UPDATE website
                           SET ${params.join(" = ?, ")} = ?
                           WHERE id = ?`;
        values.push(navDatabaseDTO.id);

        logger.debug(`updateSql: ${updateSql}`);
        logger.debug(`values: ${JSON.stringify(values)}`);

        // 创建数据库连接
        const db = new sqlite3.Database(this.navDbPath);
        // 更新数据
        return new Promise((resolve, reject) => {
            db.run(updateSql, values, function (err) {
                    if (err) {
                        logger.error("更新站点失败,原因 -> ");
                        logger.error(err);
                        reject(err);
                        return;
                    }
                    logger.info("SUCCESS: 更新操作成功！");
                    resolve(this.changes);
                }
            );
        }).finally(() => {
            this.#closeDB(db);
        });
    }

    /**
     * 查询所有网站
     * @param type 类型
     * @return {Promise<Array>}
     */
    async queryAllWebsite(type) {
        // 创建数据库连接
        const db = new sqlite3.Database(this.navDbPath);
        if (type) {
            // 查询指定类型的数据
            return new Promise((resolve, reject) => {
                db.all("SELECT * FROM website WHERE type = ?", [type], (err, rows) => {
                    if (err) {
                        logger.error("查询所有站点失败,原因 -> ");
                        logger.error(err.message);
                        reject(err.message);
                        return;
                    }
                    logger.info("SUCCESS: 查询所有操作成功！");
                    resolve(rows);
                });
            }).finally(() => {
                this.#closeDB(db);
            })
        } else {
            // 查询全部数据，不筛选类型
            return new Promise((resolve, reject) => {
                db.all("SELECT * FROM website", (err, rows) => {
                    if (err) {
                        logger.error("查询所有站点失败,原因 -> ");
                        logger.error(err);
                        reject(err);
                        return;
                    }
                    logger.info("SUCCESS: 查询所有操作成功！");
                    resolve(rows);
                });
            }).finally(() => {
                this.#closeDB(db);
            });
        }
    }

    /**
     * 根据id查询网站
     * @param id id
     */
    async queryWebsiteById(id) {
        // 创建数据库连接
        const db = new sqlite3.Database(this.navDbPath);
        // 查询数据
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM website WHERE id = ?", [id], (err, row) => {
                if (err) {
                    logger.error("查询站点失败,原因 -> ");
                    logger.error(err);
                    reject(err);
                    return;
                }
                logger.info("SUCCESS: 查询站点操作成功！");
                resolve(row);
            });
        }).finally(() => {
            this.#closeDB(db);
        });
    }

    /**
     * 根据id获取hitokoto
     * @param id id
     * @return {Promise<HitokotoVO>}
     */
    async getHitokoto(id) {
        // 创建数据库连接
        const db = new sqlite3.Database(this.navDbPath);
        // 查询数据
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM hitokoto WHERE id = ?", [id], (err, row) => {
                if (err) {
                    logger.error("查询hitokoto失败,原因 -> ");
                    logger.error(err.message);
                    reject(err.message);
                    return;
                }
                logger.info("SUCCESS: 查询hitokoto操作成功！");
                resolve(row);
            });
        }).finally(() => {
            this.#closeDB(db);
        });
    }

    /**
     * 插入hitokoto
     * @param hitokotoVO hitokotoVO
     */
    async insertHitokoto(hitokotoVO) {
        const [params, values] = this.#getUsefulHitokotoSql(hitokotoVO);
        if (values.length <= 0) {
            return 0;
        }
        // 创建一个与params长度相等的问号字符串
        const questionMarks = new Array(params.length).fill('?').join(', ');
        const insertSql = `INSERT INTO hitokoto (${params.join(", ")})
                           VALUES (${questionMarks})`;
        logger.debug(`insertSql: ${insertSql}`);
        logger.debug(`values: ${JSON.stringify(values)}`);
        // 创建数据库连接
        const db = new sqlite3.Database(this.navDbPath);
        // 查询数据
        return new Promise((resolve, reject) => {
            db.run(insertSql, values, function (err) {
                if (err) {
                    logger.error("插入hitokoto失败,原因 -> ");
                    logger.error(err.message);
                    reject(err.message);
                }
                logger.info("SUCCESS: 插入hitokoto操作成功！");
                resolve(this.lastID);
            });
        }).finally(() => {
            this.#closeDB(db);
        });
    }

    /**
     * 获取数据库hitokoto数据条数
     */
    async getCount() {
        // 创建数据库连接
        const db = new sqlite3.Database(this.navDbPath);
        // 查询数据
        return new Promise((resolve, reject) => {
            db.get("SELECT COUNT(*) AS count FROM hitokoto", (err, row) => {
                if (err) {
                    logger.error("查询数据条数失败,原因 -> ");
                    logger.error(err.message);
                    reject(err.message);
                    return;
                }
                logger.info("SUCCESS: 查询数据条数操作成功！");
                resolve(row.count);
            });
        }).finally(() => {
            this.#closeDB(db);
        });
    }

    /**
     *  判断website字段是否为空，动态拼接sql语句
     *  @param navDatabaseDTO NavDatabaseDTO
     *  @return [[string], [any]]
     */
    #getUsefulSql(navDatabaseDTO) {
        const params = [];
        const values = [];
        if (navDatabaseDTO.desc !== '' && navDatabaseDTO.desc !== null && navDatabaseDTO.desc !== undefined) {
            params.push('desc');
            values.push(navDatabaseDTO.desc);
        }
        if (navDatabaseDTO.url !== '' && navDatabaseDTO.url !== null && navDatabaseDTO.url !== undefined) {
            params.push('url');
            values.push(navDatabaseDTO.url);
        }
        if (navDatabaseDTO.image_url !== '' && navDatabaseDTO.image_url !== null && navDatabaseDTO.image_url !== undefined) {
            params.push('image_url');
            values.push(navDatabaseDTO.image_url);
        }
        if (navDatabaseDTO.auth !== '' && navDatabaseDTO.auth !== null && navDatabaseDTO.auth !== undefined) {
            params.push('auth');
            values.push(navDatabaseDTO.auth);
        }
        if (navDatabaseDTO.type !== '' && navDatabaseDTO.type !== null && navDatabaseDTO.type !== undefined) {
            params.push('type');
            values.push(navDatabaseDTO.type);
        }
        if (navDatabaseDTO.creat_time !== '' && navDatabaseDTO.creat_time !== null && navDatabaseDTO.creat_time !== undefined) {
            params.push('creat_time');
            values.push(navDatabaseDTO.creat_time);
        }
        if (navDatabaseDTO.update_time !== '' && navDatabaseDTO.update_time !== null && navDatabaseDTO.update_time !== undefined) {
            params.push('update_time');
            values.push()
        }

        return [params, values];
    }

    /**
     * 判断hitokoto字段是否为空，动态拼接sql语句
     * @return [[string], [any]]
     * @param hitokotoVO
     */
    #getUsefulHitokotoSql(hitokotoVO) {
        const params = [];
        const values = [];
        if (hitokotoVO.uuid) {
            params.push('uuid');
            values.push(hitokotoVO.uuid);
        }
        if (hitokotoVO.hitokoto) {
            params.push('hitokoto');
            values.push(hitokotoVO.hitokoto);
        }
        if (hitokotoVO.type) {
            params.push('type');
            values.push(hitokotoVO.type);
        }
        if (hitokotoVO.from) {
            params.push('"from"');
            values.push(hitokotoVO.from);
        }
        if (hitokotoVO.from_who) {
            params.push('from_who');
            values.push(hitokotoVO.from_who);
        }
        if (hitokotoVO.creator) {
            params.push('creator');
            values.push(hitokotoVO.creator);
        }
        if (hitokotoVO.creator_uid) {
            params.push('creator_uid');
            values.push(hitokotoVO.creator_uid);
        }
        if (hitokotoVO.reviewer) {
            params.push('reviewer');
            values.push(hitokotoVO.reviewer);
        }
        if (hitokotoVO.created_at) {
            params.push('created_at');
            values.push(hitokotoVO.created_at);
        }
        if (hitokotoVO.length) {
            params.push('length');
            values.push(hitokotoVO.length);
        }
        return [params, values];
    }

    /**
     * 关闭数据库
     * @param db
     */
    #closeDB(db) {
        db.close((err) => {
            if (err) {
                logger.error("关闭数据库失败,原因 -> ");
                return logger.error(err);
            }
            logger.debug("关闭数据库成功");
        });
    }

}

module.exports = NavDatabase;
