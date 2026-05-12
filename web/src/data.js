// data.js — mock data for RedMansionMind prototype
window.RMM_DATA = {
  demoQuestions: [
    { q: "太虚幻境体现了什么佛教思想？", tags: ["佛教", "第五回"] },
    { q: "贾宝玉为什么厌恶仕途经济？", tags: ["儒家", "性灵"] },
    { q: "林黛玉葬花体现了什么生命观？", tags: ["道家", "第二十七回"] },
    { q: "抄检大观园体现了什么礼法与权力问题？", tags: ["儒家", "第七十四回"] },
    { q: "芙蓉女儿诔体现了贾宝玉怎样的真情？", tags: ["性情", "第七十八回"] },
    { q: "薛宝钗的处世哲学反映了哪种儒家立场？", tags: ["儒家"] },
  ],

  scenes: [
    { id: "scene_burying_flowers", name: "黛玉葬花", chapters: [27], aliases: ["葬花", "葬花词", "埋香冢", "飞燕泣残红"], keywords: ["无常", "生命意识", "女性命运", "情"] },
    { id: "scene_taixu_dream", name: "宝玉梦游太虚幻境", chapters: [5], aliases: ["太虚幻境", "警幻仙姑", "金陵十二钗册子"], keywords: ["空", "无常", "命运", "色空"] },
    { id: "scene_raid_grandview", name: "抄检大观园", chapters: [74], aliases: ["抄检大观园", "搜检"], keywords: ["礼法", "权力", "贞节", "尊卑"] },
    { id: "scene_furong_eulogy", name: "芙蓉女儿诔", chapters: [78], aliases: ["芙蓉诔", "晴雯之死", "祭晴雯"], keywords: ["真情", "至诚", "悼亡"] },
    { id: "scene_official_path", name: "宝玉论仕途经济", chapters: [32, 36], aliases: ["仕途经济", "禄蠹", "国贼禄鬼"], keywords: ["心性", "真性情", "反规训"] },
    { id: "scene_poetry_society", name: "海棠诗社", chapters: [37, 38], aliases: ["海棠社", "菊花诗", "螃蟹咏"], keywords: ["闲情", "雅集", "才情"] },
    { id: "scene_baochai_admonish", name: "宝钗劝学", chapters: [32], aliases: ["金兰契", "宝钗规劝"], keywords: ["世故", "经济之道", "规训"] },
    { id: "scene_qingwen_death", name: "晴雯之死", chapters: [77, 78], aliases: ["撕扇子作千金一笑", "晴雯被逐"], keywords: ["真性情", "无常", "礼教之害"] },
    { id: "scene_miaoyu_tea", name: "妙玉品茶", chapters: [41], aliases: ["栊翠庵品茶", "梅花上的雪水"], keywords: ["孤洁", "出世", "禅意"] },
    { id: "scene_xiangling_poetry", name: "香菱学诗", chapters: [48], aliases: ["香菱学诗"], keywords: ["求道", "悟性", "钝根"] },
  ],

  concepts: [
    { id: "buddhism_sunyata", name: "色空", school: "佛教", desc: "色即是空、空即是色。诸法因缘和合，无自性，故谓之空。", related: ["太虚幻境", "好了歌"] },
    { id: "buddhism_anitya", name: "无常", school: "佛教", desc: "诸行无常，万象生灭流转。《红楼梦》以盛极必衰、聚散两依依映之。", related: ["葬花词", "好了歌"] },
    { id: "buddhism_dukkha", name: "苦", school: "佛教", desc: "三界皆苦。爱别离、求不得、五蕴炽盛为本经验。", related: ["黛玉夭逝", "宝玉出家"] },
    { id: "daoism_ziran", name: "自然", school: "道家", desc: "道法自然，反对人为造作。园林、诗酒、闲情皆可见。", related: ["大观园", "海棠社"] },
    { id: "daoism_wuwei", name: "无为", school: "道家", desc: "顺应天道，不强为。与宝玉对仕途经济的疏离呼应。", related: ["禄蠹之讥"] },
    { id: "daoism_qingjing", name: "清静", school: "道家", desc: "心斋坐忘，澄怀观道。妙玉、惜春一脉之向。", related: ["栊翠庵", "惜春出家"] },
    { id: "confucian_li", name: "礼", school: "儒家", desc: "节文人伦，分别上下。抄检大观园即礼法施于内闱之极致。", related: ["抄检大观园", "贾母训"] },
    { id: "confucian_ren", name: "仁", school: "儒家", desc: "爱人为仁。宝玉的泛爱与儒家差等之爱形成张力。", related: ["芙蓉女儿诔"] },
    { id: "confucian_jingji", name: "经济之道", school: "儒家", desc: "经世济民、立身扬名之学。被宝玉斥为禄蠹。", related: ["仕途经济", "宝钗劝学"] },
    { id: "confucian_zhongyong", name: "中庸", school: "儒家", desc: "执两用中。薛宝钗之处世可为注脚。", related: ["宝钗"] },
    { id: "xin_xing", name: "心性", school: "宋明理学", desc: "心即理，性即天。宝玉重情重性，与外在功名相违。", related: ["真性情"] },
    { id: "qing_zhen", name: "真情", school: "性灵", desc: "晚明性灵之说。情之至，可通天地。", related: ["芙蓉女儿诔", "黛玉"] },
    { id: "fate_yuanqi", name: "缘起", school: "佛教", desc: "诸事因缘生灭。木石前盟、金玉良缘皆系于此。", related: ["木石前盟"] },
    { id: "yin_guo", name: "因果", school: "佛教", desc: "前因后果，业力相续。判词册子即写就之因果。", related: ["金陵十二钗"] },
    { id: "haoliao", name: "好了", school: "道家", desc: "跛足道人歌：世人都晓神仙好。好即是了，了即是好。", related: ["好了歌注"] },
  ],

  characters: [
    { id: "baoyu", name: "贾宝玉", subtitle: "情之主、性灵之子",
      schools: { 佛教: 35, 道家: 40, 儒家: 5, 性灵: 90 },
      tags: ["真性情", "泛爱", "反仕途"],
      summary: "宝玉之哲学，以晚明性灵为底色，掺以佛道之疏离。其于人间则极重情，于功名则极轻；其结局之出家，是色空之归。" },
    { id: "daiyu", name: "林黛玉", subtitle: "无常之诗人",
      schools: { 佛教: 50, 道家: 35, 儒家: 5, 性灵: 70 },
      tags: ["生命意识", "孤洁", "诗心"],
      summary: "黛玉以诗写无常，葬花一节集生命意识之大成。其前世为绛珠仙草，泪尽而逝，是为缘起。" },
    { id: "baochai", name: "薛宝钗", subtitle: "儒家世故之典范",
      schools: { 佛教: 10, 道家: 5, 儒家: 80, 性灵: 15 },
      tags: ["中庸", "经济", "藏愚"],
      image: "/assets/xue-baochai-portrait.png",
      imageAlt: "薛宝钗持团扇立于花园中的工笔人物画像",
      summary: "宝钗执持儒家中庸，外圆内方，劝学劝仕。其与宝玉之冲突，是经济之道与心性之学之冲突。",
      keyPassages: ["hlm_ch032_p009", "hlm_ch037_p002", "hlm_ch078_p004", "hlm_ch080_p008"] },
    { id: "miaoyu", name: "妙玉", subtitle: "槛外之孤洁",
      schools: { 佛教: 60, 道家: 30, 儒家: 0, 性灵: 30 },
      tags: ["出世", "洁癖", "禅意"],
      summary: "妙玉栖于栊翠庵，雪水煎茶，自署槛外人。其孤高与终陷淖泥，是出世与红尘之张力。" },
    { id: "tanchun", name: "贾探春", subtitle: "理性之治家者",
      schools: { 佛教: 5, 道家: 10, 儒家: 70, 性灵: 25 },
      tags: ["才干", "理性", "改革"],
      summary: "探春之兴利除弊，是儒家经世致用之微缩。其远嫁海外，是大厦将倾时之飘零。" },
    { id: "qingwen", name: "晴雯", subtitle: "真性之火",
      schools: { 佛教: 10, 道家: 20, 儒家: 0, 性灵: 80 },
      tags: ["真性情", "刚烈", "夭折"],
      summary: "晴雯心比天高，身为下贱。其撕扇、补裘、被逐而死，皆见至情至性。" },
    { id: "xifeng", name: "王熙凤", subtitle: "权术之治家者",
      schools: { 佛教: 5, 道家: 5, 儒家: 55, 性灵: 20 },
      tags: ["权谋", "理家", "机变"],
      summary: "凤姐之治家，以礼法为器、以权术为体。其协理宁府之干练、敛财放贷之辣手、笑里藏刀之机变，是末世大家族最后的撑持，亦是礼之沦为工具的悲哀。" },
    { id: "xichun", name: "贾惜春", subtitle: "冷眼出世之尼",
      schools: { 佛教: 85, 道家: 25, 儒家: 5, 性灵: 15 },
      tags: ["冷观", "出世", "决绝"],
      summary: "惜春自小冷淡，目睹三春去后，最终断发为尼。其出世非由顿悟，而由长年冷眼之累积——是一种被红尘磨钝后的彻底了断，与妙玉之孤洁相对，更近寒灰。" },
    { id: "xiangyun", name: "史湘云", subtitle: "率真之逍遥客",
      schools: { 佛教: 15, 道家: 70, 儒家: 15, 性灵: 60 },
      tags: ["豪爽", "率真", "忘忧"],
      summary: "湘云之憨眠芍药、烤鹿大嚼，是大观园中最不拘的一笔。其幼失怙恃而少哀矜，以爽朗对抗孤苦——是道家自然之另一种活法。" },
    { id: "keqing", name: "秦可卿", subtitle: "幻情之引路人",
      schools: { 佛教: 60, 道家: 10, 儒家: 10, 性灵: 40 },
      tags: ["幻", "情欲", "兆败"],
      summary: "可卿身兼两端：在荣府是温柔克让之孙媳，在太虚是\"兼美\"之警幻使者。其早逝与梦中托语，是贾府盛极而衰的暗号，也是\"情\"之色空一面的具象。" },
    { id: "xiren", name: "袭人", subtitle: "温柔之礼妇",
      schools: { 佛教: 15, 道家: 5, 儒家: 65, 性灵: 20 },
      tags: ["温顺", "规劝", "守分"],
      summary: "袭人以柔顺事主，以\"妻妾之道\"自处。其规劝宝玉勿涉狂悖、向王夫人进言整肃风纪，是儒家妇德的精修——与晴雯互为镜像：一个守礼至温，一个任性至烈。" },
    { id: "wangfuren", name: "王夫人", subtitle: "礼法之执行者",
      schools: { 佛教: 30, 道家: 0, 儒家: 75, 性灵: 5 },
      tags: ["礼法", "母权", "持斋"],
      summary: "王夫人持斋念佛，又是抄检、撵逐之实际下令者。其慈与厉之并存，是儒家母权与晚明伪佛之合体——大观园众女儿之命运，名义上由贾母执掌，实则由她落子。" },
  ],

  // Eval data
  evalResult: {
    total: 30, top1: 0.867, top4: 1.0, conceptRecall: 1.0, misses: 0,
    breakdown: [
      { school: "佛教", n: 8, top1: 0.875, top4: 1.0 },
      { school: "道家", n: 7, top1: 0.857, top4: 1.0 },
      { school: "儒家", n: 9, top1: 0.889, top4: 1.0 },
      { school: "综合", n: 6, top1: 0.833, top4: 1.0 },
    ],
    samples: [
      { q: "太虚幻境体现了什么佛教思想？", expectCh: 5, gotCh: 5, ok: true, concepts: ["color_emptiness", "anitya"] },
      { q: "黛玉葬花体现了什么生命观？", expectCh: 27, gotCh: 27, ok: true, concepts: ["anitya", "ziran"] },
      { q: "抄检大观园体现了什么礼法问题？", expectCh: 74, gotCh: 74, ok: true, concepts: ["li", "power"] },
      { q: "宝玉为何斥经济为禄蠹？", expectCh: 32, gotCh: 36, ok: false, concepts: ["xin_xing", "wuwei"] },
      { q: "妙玉品茶体现的禅意？", expectCh: 41, gotCh: 41, ok: true, concepts: ["qingjing"] },
    ]
  },

  // Quiz questions
  quizQuestions: [
    {
      q: "你很喜欢的一家店（咖啡馆、书店、小馆子）宣布要关门了。你会——",
      options: [
        { text: "专门去最后一次，拍照、写点什么，认真告别", weights: { daiyu: 3, baoyu: 1 } },
        { text: "惋惜一下，很快接受了，好东西总会消失", weights: { tanchun: 2, baochai: 2 } },
        { text: "感慨很久，觉得这就是无常，反而有点释然", weights: { miaoyu: 3, daiyu: 1 } },
        { text: "拉上朋友一起去最后一次，热热闹闹地送别", weights: { baoyu: 3, qingwen: 1 } },
      ]
    },
    {
      q: "家人又催你走一条\"稳妥\"的路——考公、考研、进大厂、早点结婚。你最可能的反应是——",
      options: [
        { text: "直接拒绝，那条路不是你想走的，说多了只会更烦", weights: { baoyu: 3, qingwen: 1 } },
        { text: "觉得他们说得有道理，认真考虑一下也无妨", weights: { baochai: 3, tanchun: 1 } },
        { text: "表面应付，心里另有打算，时候到了再说", weights: { tanchun: 2, baochai: 1 } },
        { text: "早就把自己的生活和他们的期待分得很清楚了", weights: { miaoyu: 3 } },
      ]
    },
    {
      q: "对你而言，最难割舍的是——",
      options: [
        { text: "一段未尽之情", weights: { baoyu: 3, daiyu: 2 } },
        { text: "门第与家声", weights: { baochai: 3 } },
        { text: "自己的一点傲骨", weights: { qingwen: 3, miaoyu: 1 } },
        { text: "一卷未读完的书", weights: { tanchun: 2, baochai: 1 } },
      ]
    },
    {
      q: "若大厦将倾，你最先做的事是——",
      options: [
        { text: "把所有人的诗稿好好收起来", weights: { daiyu: 3, baoyu: 1 } },
        { text: "立刻盘点账目，查弊兴利", weights: { tanchun: 3 } },
        { text: "焚香诵经，了无挂碍", weights: { miaoyu: 3 } },
        { text: "稳住人心，劝家人勿乱", weights: { baochai: 3 } },
      ]
    },
    {
      q: "世人都说神仙好。你最认同其中哪一句？",
      options: [
        { text: "惟有功名忘不了——古今将相在何方？", weights: { tanchun: 2, baochai: 1 } },
        { text: "惟有金银忘不了——终朝只恨聚无多", weights: { baochai: 2 } },
        { text: "惟有娇妻忘不了——君生日日说恩情", weights: { baoyu: 3, qingwen: 1 } },
        { text: "惟有儿孙忘不了——痴心父母古来多", weights: { baochai: 1, baoyu: 1, daiyu: 1, miaoyu: 1, tanchun: 1, qingwen: 1 } },
      ]
    },
    {
      q: "你在社交媒体上发东西，通常是——",
      options: [
        { text: "随手记录当下，不在意别人怎么看", weights: { baoyu: 3, qingwen: 1 } },
        { text: "有时候写了很长，发出去之前又全删了", weights: { daiyu: 3, baoyu: 1 } },
        { text: "精心排版选图，确保整体感觉对了再发", weights: { baochai: 3, tanchun: 1 } },
        { text: "基本不发，或只在很小的圈子里可见", weights: { miaoyu: 3, daiyu: 1 } },
      ]
    },
    {
      q: "若有人当面说了你一句重话，你最可能的反应是——",
      options: [
        { text: "当下就顶回去，哪怕气到说不出话也绝不咽下这口气", weights: { qingwen: 3, baoyu: 1 } },
        { text: "心里难受很久，反复回想，想弄清楚那话有没有道理", weights: { daiyu: 3 } },
        { text: "当场不动声色，事后再寻适当时机处理", weights: { baochai: 3, tanchun: 1 } },
        { text: "觉得对方着相了，这种话不值一应", weights: { miaoyu: 3 } },
      ]
    },
    {
      q: "朋友借给你一本书，还回去时发现书脊不小心折了。你会——",
      options: [
        { text: "直接坦白，坏了就坏了，情谊还在", weights: { baoyu: 3, qingwen: 1 } },
        { text: "心里很难过，觉得辜负了对方的信任", weights: { daiyu: 3, baoyu: 1 } },
        { text: "买一本新的还回去，把这件事翻篇", weights: { baochai: 3 } },
        { text: "书总会旧的，折了书脊也是一种阅读的痕迹", weights: { tanchun: 2, miaoyu: 1 } },
      ]
    },
    {
      q: "你最理想的住所是——",
      options: [
        { text: "杂乱有序，到处是书和没收起来的小物件，阳台种着乱七八糟的植物", weights: { baoyu: 3 } },
        { text: "素净简洁，只放最重要的东西，进门就觉得安静", weights: { daiyu: 3, miaoyu: 1 } },
        { text: "整洁有条理，每件东西都有自己的位置，来了客人也不失礼", weights: { baochai: 3 } },
        { text: "干净到极致，最好外人很难进来", weights: { miaoyu: 3, daiyu: 1 } },
      ]
    },
    {
      q: "你做了一件自己觉得挺不错的事（项目、作品、安排），你最在意的是——",
      options: [
        { text: "做的过程是不是真的投入，有没有对得起自己", weights: { baoyu: 3, daiyu: 2 } },
        { text: "有没有人真的理解你的用心，而不只是说好", weights: { daiyu: 3, baoyu: 1 } },
        { text: "质量是否过关，有没有明显的纰漏", weights: { baochai: 3, tanchun: 1 } },
        { text: "留着自己回味就好，不需要别人来评价", weights: { miaoyu: 3, qingwen: 1 } },
      ]
    },
    {
      q: "有场你不太想去的聚会（同事饭局、远亲聚会、同学婚宴），你会——",
      options: [
        { text: "找个理由推掉，能不去就不去", weights: { daiyu: 2, miaoyu: 2 } },
        { text: "去，但提前找好借口，准备早点走", weights: { baoyu: 3 } },
        { text: "去，而且认真准备，确保大家都过得不错", weights: { baochai: 3 } },
        { text: "去了，在角落里观察所有人，暗自把大家都分析一遍", weights: { tanchun: 2, miaoyu: 1 } },
      ]
    },
    {
      q: "身边一个好友突然离开了（出嫁或远行），你会——",
      options: [
        { text: "难受很久，甚至写诗写文来祭奠那段情谊", weights: { baoyu: 3, daiyu: 2 } },
        { text: "悄悄哭了，但努力不让别人看见", weights: { daiyu: 3 } },
        { text: "心里悲伤，但依然维持日常，人去了还要继续", weights: { baochai: 3, tanchun: 1 } },
        { text: "觉得聚散是常，把悲伤放在心底便是", weights: { miaoyu: 2, tanchun: 1 } },
      ]
    },
    {
      q: "你认为，一个人最不应该妥协的是——",
      options: [
        { text: "对自己真实感受的诚实", weights: { baoyu: 3, qingwen: 2 } },
        { text: "对审美与精神标准的坚持", weights: { miaoyu: 3, daiyu: 1 } },
        { text: "对公平和规则的追求", weights: { tanchun: 3 } },
        { text: "对亲近之人的情分与承诺", weights: { daiyu: 2, baoyu: 1 } },
      ]
    },
    {
      q: "真与礼发生冲突的时候，你会——",
      options: [
        { text: "真比礼更重要，礼不过是一件衣服", weights: { baoyu: 3, qingwen: 2 } },
        { text: "二者可以周全，只是需要找到方式", weights: { baochai: 3 } },
        { text: "公开场合守礼，私下保留真", weights: { tanchun: 2, baochai: 1 } },
        { text: "礼是别人的标准，与我无关", weights: { miaoyu: 3, qingwen: 1 } },
      ]
    },
    {
      q: "朋友突然发消息：\"现在出来吗，XX地方超美的\"。你——",
      options: [
        { text: "立刻出门，就喜欢这种说走就走", weights: { baoyu: 3, qingwen: 1 } },
        { text: "心里想去，但担心太远太累，犹豫半天还是去了", weights: { daiyu: 2, baoyu: 1 } },
        { text: "先问清楚去哪、几点回，合适就去", weights: { baochai: 3 } },
        { text: "婉拒，一个人待着比临时拼凑的出行更自在", weights: { miaoyu: 3, daiyu: 1 } },
      ]
    },
    {
      q: "有人请你帮一个你看不太上的人说好话，你——",
      options: [
        { text: "直接说你不擅长说这种话，让对方另请高明", weights: { qingwen: 3, baoyu: 1 } },
        { text: "斟酌一下措辞，能帮就帮，不点破也不撒谎", weights: { baochai: 3 } },
        { text: "问清楚情况，合理就帮，无理就拒绝", weights: { tanchun: 3 } },
        { text: "觉得这种事与你无关，礼貌推脱", weights: { miaoyu: 3 } },
      ]
    },
    {
      q: "一场很热闹的聚会结束了，回家路上，你心里最先浮现的念头是——",
      options: [
        { text: "今天真好，人和人在一起就是不一样", weights: { baoyu: 3 } },
        { text: "热闹散了，有点空，越开心越觉得什么东西是短暂的", weights: { daiyu: 3, miaoyu: 1 } },
        { text: "还好，氛围不错，大家都挺自在的", weights: { baochai: 3 } },
        { text: "复盘了一遍，觉得某些地方本来可以处理得更好", weights: { tanchun: 3 } },
      ]
    },
    {
      q: "你最认同哪一种人生态度？",
      options: [
        { text: "尽情去爱，尽情去活，哪怕转眼离散", weights: { baoyu: 3, daiyu: 2 } },
        { text: "把日子过得稳妥，少一些意外，才能照顾更多人", weights: { baochai: 3 } },
        { text: "在力所能及的地方做实事，让事情变好", weights: { tanchun: 3 } },
        { text: "保持内心的干净，比融入世界更重要", weights: { miaoyu: 3, qingwen: 1 } },
      ]
    },
    {
      q: "你最难接受的告别方式是——",
      options: [
        { text: "还没说完话，人就走了", weights: { baoyu: 3, daiyu: 2 } },
        { text: "委委屈屈地走，不被人看见", weights: { daiyu: 3, qingwen: 1 } },
        { text: "热热闹闹地被送走，像一场表演", weights: { miaoyu: 3, qingwen: 1 } },
        { text: "知道结局还是一步步走向它，无力阻拦", weights: { tanchun: 2, baochai: 1 } },
      ]
    },
    {
      q: "你理想中的人生，是——",
      options: [
        { text: "有人能真正懂你，能为那份真情活过", weights: { baoyu: 3, daiyu: 2 } },
        { text: "在世间走了一遭，没有亏欠过自己的标准", weights: { qingwen: 3, miaoyu: 1 } },
        { text: "稳稳当当，没有大的意外，陪伴着在乎的人", weights: { baochai: 3 } },
        { text: "做了一些真正有用的事，改变了什么", weights: { tanchun: 3 } },
      ]
    },
  ],

  // Hero poem rotations
  heroPoems: [
    { line: "满纸荒唐言，一把辛酸泪。", from: "《红楼梦》开篇" },
    { line: "花谢花飞花满天，红消香断有谁怜。", from: "葬花词 · 第二十七回" },
    { line: "假作真时真亦假，无为有处有还无。", from: "太虚幻境联 · 第五回" },
    { line: "好即是了，了即是好。", from: "好了歌 · 第一回" },
  ],

  // Mock LLM streaming answer for "太虚幻境体现了什么佛教思想？"
  mockAnswer: {
    thesis: "太虚幻境是《红楼梦》以叙事承载佛教「色空」「无常」「因果」三义的象征空间。",
    interpretation: [
      { text: "警幻仙姑以「太虚」名其境，已点出佛教「真空妙有」之意。第五回中宝玉所见册子、所听曲子，皆为「未发之事」，即诸法因缘和合、由识所变现之相", cites: [{ kind: "passage", id: "hlm_ch005_p005" }, { kind: "concept", id: "buddhism_sunyata" }] },
      { text: "册子上的判词逐一预演金陵十二钗之命运，对应佛教「业果」与「缘起」——一切已然在因缘之中，宝玉的痴愚是不识此理之苦", cites: [{ kind: "passage", id: "hlm_ch005_p012" }, { kind: "concept", id: "yin_guo" }, { kind: "concept", id: "fate_yuanqi" }] },
      { text: "「假作真时真亦假，无为有处有还无」之联，更将「色空不二」直陈：太虚不是空无所有，而是真假相依、有无相生", cites: [{ kind: "passage", id: "hlm_ch005_p003" }, { kind: "concept", id: "buddhism_sunyata" }] },
      { text: "饮「千红一窟」之茶、品「万艳同杯」之酒，是把众女儿之命运预先以「悲」「苦」二义渗透——苦谛由此显出", cites: [{ kind: "passage", id: "hlm_ch005_p018" }, { kind: "concept", id: "buddhism_dukkha" }] },
    ],
    citationNotes: [
      "「色空」之义主要依据第五回太虚幻境总体设定及对联文本",
      "「无常」「苦」之义依据册子判词与酒茶之名所暗示的悲剧导向",
      "未引用第一回甄士隐解《好了歌》之段，可视为本回前奏之补注",
    ],
    limits: "判断太虚幻境是否「专属」佛教尚有争议——其中亦含道家「真幻一如」之笔法；本回答以佛教进路为主，未展开道家阐释。"
  },
};
