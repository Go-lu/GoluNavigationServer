class HitokotoVO {
    constructor(
        {
            id = NaN,
            uuid = '',
            hitokoto = '',
            type = '',
            from = '',
            from_who = '',
            creator = '',
            creator_uid = NaN,
            reviewer = NaN,
            created_at = '',
            length = NaN
        }
    ) {
        this.id = id; // id
        this.uuid = uuid; // uuid
        this.hitokoto = hitokoto; // 句子内容
        this.type = type; // 类型
        this.from = from; // 句子出处
        this.from_who = from_who; // 句子出处作者
        this.creator = creator; // 句子创建者
        this.creator_uid = creator_uid; // 句子创建者uid
        this.reviewer = reviewer; // 审核者
        this.created_at = created_at; // 句子创建时间
        this.length = length; // 句子长度
    }
}

module.exports = HitokotoVO;
