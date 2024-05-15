class NavDatabaseDTO {
    constructor(
        {
            id = NaN,
            image_url = '',
            url = '',
            desc = '',
            auth = '',
            type = '',
            creat_time = '',
            update_time = ''
        }
    ) {
        this.id = id; // id
        this.image_url = image_url; // 图标链接
        this.url = url; // 网站链接
        this.desc = desc; // 网站描述
        this.auth = auth; // 占位字段
        this.type = type; // 占位字段
        this.creat_time = creat_time; // 创建时间
        this.update_time = update_time; // 更新时间
    }
}

module.exports = NavDatabaseDTO;
