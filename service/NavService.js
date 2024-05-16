const path = require('path');
const SqliteTool = require('../utils/SqliteTool')
const logger = require('../utils/LoggerTool')
const axios = require("axios");
const HitokotoVO = require('/VO/HitokotoVO');

class NavService {
    #navMapper;
    constructor() {
        this.#navMapper = new SqliteTool();
    }

    /**
     * 添加网站
     * @param navDatabaseDTO
     * @returns {Promise<number|void>}
     */
    async addWebsite(navDatabaseDTO) {
        return await this.#navMapper.addWebsite(navDatabaseDTO);
    }

    /**
     * 删除网站
     * @param id
     * @returns {Promise<void>}
     */
    async deleteWebsiteById(id) {
        return await this.#navMapper.deleteWebsiteById(id);
    }

    /**
     * 更新网站
     * @param navDatabaseDTO
     * @returns {Promise<undefined|void>}
     */
    async updateWebsiteById(navDatabaseDTO) {
        return await this.#navMapper.updateWebsiteById(navDatabaseDTO);
    }

    /**
     * 根据站点类型查询所有网站
     * @param navDatabaseDTO
     * @returns {Promise<Array>}
     */
    async queryAWebsiteByType(navDatabaseDTO) {
        return await this.#navMapper.queryWebsiteByType(navDatabaseDTO.type);
    }

    /**
     * 查询所有网站
     * @param type
     * @returns {Promise<Array>}
     */
    async queryAllWebsite(type) {
        return await this.#navMapper.queryAllWebsite(type);
    }

    /**
     * 根据id查询网站
     * @param id
     * @returns {Promise<void>}
     */
    async queryWebsiteById(id) {
        return await this.#navMapper.queryWebsiteById(id);
    }

    /**
     * 根据id获取一言
     * @param id
     * @returns {Promise<HitokotoVO>}
     */
    async getHitokoto(id) {
        return await this.#navMapper.getHitokoto(id);
    }

    /**
     * 获取随机一言并插入数据库
     * @returns {Promise<HitokotoVO>}
     */
    async getRandomHitokoto() {
        // 查询数据条数
        const count = await this.#navMapper.getCount();
        const baseProbability = 50; // 初始概率
        const incrementPer100Quotes = 5; // 每100条一言，概率增加5%
        let probability = baseProbability + Math.floor(count / 100) * incrementPer100Quotes; // 计算概率
        probability = Math.min(probability, 95);  // 设置一个上限，比如95%

        if (Math.random() * 100 < probability && count > 0) {
            // 从数据库获取,根据数据条数生产随机id
            const id = Math.floor(Math.random() * count) + 1;
            return await this.getHitokoto(id);

        } else {
            // 从一言网站获取
            try {
                const res = await axios.get("https://v1.hitokoto.cn/", {
                    headers: {
                        "Content-Type": "application/json",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
                    },
                });
                if (JSON.stringify(res.data).indexOf("请求失败")!==-1){
                    logger.error("获取一言失败,原因 -> ");
                    logger.error(res.data);
                    return Promise.reject('');
                }else {
                    // 插入数据库
                    try {
                        const hitokotoVO = new HitokotoVO(res.data);
                        await this.#navMapper.insertHitokoto(hitokotoVO);
                    }catch (err){
                        logger.error("插入数据库失败,原因 -> ");
                        logger.error(err.message);
                    }
                    return Promise.resolve(res.data);
                }
            }catch (err){
                logger.error("获取一言失败,原因 -> ");
                logger.error(err.message);
                if (count > 0) {
                    const id = Math.floor(Math.random() * count) + 1;
                    return await this.getHitokoto(id);
                }else {
                    return Promise.resolve('');
                }

            }
        }
    }

    /**
     * 根据ip获取地址
     * @param ip
     * @param ak
     * @returns {Promise<any>}
     */
    async getLocation(ip, ak) {
        try {
            const res = await axios.get(`https://api.map.baidu.com/location/ip?ip=${ip}&coor=bd09ll&ak=${ak}`);
            if (res.data.status === 0){
                logger.debug(res.data)
                return Promise.resolve(res.data);
            }else {
                logger.error("获取地址失败,原因 -> ");
                logger.error(res.data);
                return Promise.reject(res.data);
            }
        }catch (err){
            logger.error("获取地址失败,原因 -> ");
            logger.error(err.message);
            return Promise.reject(err.message);
        }
    }

    /**
     * 获取天气信息
     * @param locationInfo
     * @param key
     * @returns {Promise<any>}
     */
    async getWeather(locationInfo, key) {
        let cityInfo = {};
        try {
            if (locationInfo.location){
                cityInfo = await this.#getCityId(locationInfo.location, key);
            }else if (locationInfo.adCode){
                cityInfo = await this.#getCityId(locationInfo.adCode, key);
            }
            if (cityInfo.id){
                const res = await this.#getWeatherByCityId(cityInfo.id, key);
                res.now.category = await this.#getAirByCityId(cityInfo.id, key); // 添加空气质量
                res.now.fxLink = res.fxLink; // 添加天气预报链接
                res.now.cityName = cityInfo.name; // 添加城市名
                res.now.icon = "/assets/" + res.now.icon + ".png"; // 添加图标
                res.now.temp = res.now.temp + "°C";
                return Promise.resolve(res);
            }
        }catch (err){
            logger.error("获取天气信息all失败,原因 -> ");
            logger.error(err);
            return Promise.reject(err);
        }
    }

    /**
     * 获取城市id
     * @param pointer
     * @param key
     * @returns {Promise<any>}
     */
    async #getCityId(pointer, key) {
        try {
            const cityInfo = await axios.get(`https://geoapi.qweather.com/v2/city/lookup?location=${pointer}&key=${key}`);
            if (cityInfo.data.code === 200 || cityInfo.data.code === "200"){
                return Promise.resolve({
                    name: cityInfo.data.location[0].name,
                    id: cityInfo.data.location[0].id
                });
            }else {
                logger.error("获取城市id失败,原因 -> ");
                logger.error(cityInfo.data);
                return Promise.reject(cityInfo.data);
            }
        }catch (err){
            logger.error("获取城市id请求失败,原因 -> ");
            logger.error(err);
            return Promise.reject(err);
        }
    }

    /**
     * 获取天气信息
     * @param cityId
     * @param key
     * @returns {Promise<any>}
     */
    async #getWeatherByCityId(cityId, key){
        try {
            const weatherInfo = await axios.get(`https://devapi.qweather.com/v7/weather/now?location=${cityId}&key=${key}`);
            if (weatherInfo.data.code === 200 || weatherInfo.data.code === "200"){
                return Promise.resolve(weatherInfo.data);
            }else {
                logger.error("获取天气信息失败,原因 -> ");
                logger.error(weatherInfo.data);
                return Promise.reject(weatherInfo.data);
            }
        }catch (err){
            logger.error("获取天气请求失败,原因 -> ");
            logger.error(err);
            return Promise.reject(err);
        }
    }

    /**
     * 根据城市Id查询空气质量
     */
    async #getAirByCityId(cityId, key) {
        try {
            const airInfo = await axios.get(`https://devapi.qweather.com/v7/air/now?location=${cityId}&key=${key}`);
            if (airInfo.data.code === 200 || airInfo.data.code === "200"){
                return Promise.resolve(airInfo.data.now.category);
            }else {
                logger.error("获取空气质量失败,原因 -> ");
                logger.error(airInfo.data);
                return Promise.reject(airInfo.data);
            }
        }catch (err){
            logger.error("获取空气质量请求失败,原因 -> ");
            logger.error(err);
            return Promise.reject(err);
        }
    }

}

module.exports = NavService
