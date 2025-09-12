// 抽奖系统配置文件
// 修改此文件来调整抽奖系统的各种设置
const LotteryConfig = {
  // 公司信息配置
  company: {
    name: "科技未来有限公司",
    slogan: "创新科技 · 引领未来",
    description: "成立于2020年 · 专注AI与大数据解决方案",
    intro:
      "科技未来有限公司成立于2020年，是一家专注于人工智能和大数据解决方案的高新技术企业。公司致力于为企业提供智能化转型服务，已服务超过500家企业客户。",
    contact: {
      phone: "400-888-9999",
      email: "contact@techfuture.com",
      address: "北京市朝阳区科技园区创新大厦18层",
      website: "www.techfuture.com",
    },
    honors: [
      "国家高新技术企业",
      "ISO9001认证",
      "最佳创新企业奖",
      "行业领先品牌",
    ],
  },

  // 活动信息配置
  activity: {
    title: "幸运大转盘",
    subtitle: "500元现金大奖等你来拿！",
    infoTitle: "🎉 公司周年庆抽奖活动 🎉",
    infoDesc: "庆祝公司成立4周年，感谢全体员工辛勤付出",
    rules: [
      "活动时间：2024年12月1日 - 2024年12月31日",
      "参与对象：公司全体员工及合作伙伴",
      "每人限抽一次",
      "奖品发放：中奖后3个工作日内发放",
      "最终解释权归科技未来有限公司所有",
    ],
  },

  // 奖品配置
  prizes: [
    {
      name: "一等奖",
      amount: "500元",
      probability: 0.05,
      color: "#ffd700",
      icon: "fas fa-crown",
    },
    {
      name: "二等奖",
      amount: "200元",
      probability: 0.1,
      color: "#ff6b6b",
      icon: "fas fa-medal",
    },
    {
      name: "三等奖",
      amount: "100元",
      probability: 0.15,
      color: "#ff8c42",
      icon: "fas fa-award",
    },
    {
      name: "四等奖",
      amount: "50元",
      probability: 0.2,
      color: "#ff4757",
      icon: "fas fa-star",
    },
    {
      name: "五等奖",
      amount: "20元",
      probability: 0.15,
      color: "#ff3838",
      icon: "fas fa-gift",
    },
    {
      name: "六等奖",
      amount: "10元",
      probability: 0.15,
      color: "#ff2d55",
      icon: "fas fa-coins",
    },
    {
      name: "七等奖",
      amount: "5元",
      probability: 0.1,
      color: "#ff1744",
      icon: "fas fa-gem",
    },
    {
      name: "谢谢参与",
      amount: "",
      probability: 0.1,
      color: "#8e8e93",
      icon: "fas fa-heart",
    },
  ],

  // 主题配置
  themes: {
    default: {
      name: "默认主题",
      primary: "#667eea",
      secondary: "#764ba2",
      accent: "#ffd700",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      text: "#ffffff",
      card: "rgba(255, 255, 255, 0.1)",
    },
    dark: {
      name: "暗黑主题",
      primary: "#2c3e50",
      secondary: "#34495e",
      accent: "#e74c3c",
      background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
      text: "#ecf0f1",
      card: "rgba(0, 0, 0, 0.3)",
    },
    colorful: {
      name: "彩色主题",
      primary: "#ff6b6b",
      secondary: "#4ecdc4",
      accent: "#feca57",
      background:
        "linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%)",
      text: "#ffffff",
      card: "rgba(255, 255, 255, 0.2)",
    },
    minimal: {
      name: "简约主题",
      primary: "#ffffff",
      secondary: "#f8f9fa",
      accent: "#007bff",
      background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
      text: "#212529",
      card: "rgba(255, 255, 255, 0.8)",
    },
  },

  // 抽奖类型配置
  lotteryTypes: {
    grid: {
      name: "九宫格抽奖",
      description: "九宫格抽奖，增加趣味性",
      maxPrizes: 9,
      minPrizes: 4,
    },
    slot: {
      name: "老虎机抽奖",
      description: "老虎机风格抽奖，更有娱乐性",
      maxPrizes: 5,
      minPrizes: 3,
    },
  },

  // 系统设置
  system: {
    // 默认抽奖类型 (grid 或 slot)
    defaultLotteryType: "grid",

    // 默认主题 (default, dark, colorful, minimal)
    defaultTheme: "default",

    // 是否显示音效控制按钮
    showAudioControl: true,

    // 是否显示抽奖记录
    showHistory: true,

    // 是否显示公司信息
    showCompanyInfo: true,
  },

  // 动画配置
  animations: {
    particles: {
      enabled: true,
      count: 50,
      speed: 3,
    },
    confetti: {
      enabled: true,
      count: 20,
      colors: [
        "#ff6b6b",
        "#4ecdc4",
        "#45b7d1",
        "#96ceb4",
        "#feca57",
        "#ff9ff3",
      ],
    },
    sound: {
      enabled: true,
      volume: 0.6,
    },
  },

  // 九宫格配置
  grid: {
    size: 400,
    itemSize: 120,
    gap: 10,
    animationDuration: 2000,
  },

  // 老虎机配置
  slot: {
    width: 300,
    height: 200,
    itemHeight: 40,
    spinDuration: 3000,
    reelCount: 3,
  },
};

// 导出配置
if (typeof module !== "undefined" && module.exports) {
  module.exports = LotteryConfig;
}
