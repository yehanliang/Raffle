// 主脚本文件
document.addEventListener("DOMContentLoaded", () => {
  // 初始化抽奖引擎
  const lotteryEngine = new LotteryEngine(LotteryConfig);

  // 添加庆祝动画样式
  lotteryEngine.addCelebrationStyles();

  // 更新页面内容
  //   updatePageContent();

  // 添加页面加载动画
  addPageAnimations();
});

// 更新页面内容
function updatePageContent() {
  // 更新公司信息
  document.getElementById("companyName").textContent =
    LotteryConfig.company.name;
  document.getElementById("companySlogan").textContent =
    LotteryConfig.company.slogan;
  document.getElementById("companyDesc").textContent =
    LotteryConfig.company.description;
  document.getElementById("companyIntro").textContent =
    LotteryConfig.company.intro;

  // 更新联系信息
  const contactInfo = document.getElementById("contactInfo");
  contactInfo.innerHTML = `
        <p><i class="fas fa-phone"></i> 客服热线：${LotteryConfig.company.contact.phone}</p>
        <p><i class="fas fa-envelope"></i> 邮箱：${LotteryConfig.company.contact.email}</p>
        <p><i class="fas fa-map-marker-alt"></i> 地址：${LotteryConfig.company.contact.address}</p>
        <p><i class="fas fa-globe"></i> 官网：${LotteryConfig.company.contact.website}</p>
    `;

  // 更新公司荣誉
  const honors = document.getElementById("companyHonors");
  honors.innerHTML = LotteryConfig.company.honors
    .map((honor) => `<span class="honor-item">${honor}</span>`)
    .join("");

  // 更新活动信息
  document.getElementById("activityTitle").textContent =
    LotteryConfig.activity.title;
  document.getElementById("activitySubtitle").textContent =
    LotteryConfig.activity.subtitle;
  document.getElementById("activityInfoTitle").textContent =
    LotteryConfig.activity.infoTitle;
  document.getElementById("activityInfoDesc").textContent =
    LotteryConfig.activity.infoDesc;

  // 更新活动规则
  const rulesContent = document.getElementById("rulesContent");
  rulesContent.innerHTML = LotteryConfig.activity.rules
    .map(
      (rule) =>
        `<div class="rule-item">
            <i class="fas fa-check-circle"></i>
            <span>${rule}</span>
        </div>`
    )
    .join("");
}

// 添加页面加载动画
function addPageAnimations() {
  const elements = document.querySelectorAll(
    ".company-header, .header, .lottery-container, .rules-section, .history, .company-details"
  );

  elements.forEach((element, index) => {
    element.style.opacity = "0";
    element.style.transform = "translateY(30px)";

    setTimeout(() => {
      element.style.transition = "all 0.8s ease";
      element.style.opacity = "1";
      element.style.transform = "translateY(0)";
    }, index * 200);
  });
}

// 配置管理功能
class ConfigManager {
  constructor() {
    this.config = LotteryConfig;
    this.init();
  }

  init() {
    this.loadSavedConfig();
    this.bindEvents();
  }

  // 加载保存的配置
  loadSavedConfig() {
    const savedConfig = localStorage.getItem("lotteryConfig");
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      //   this.applyConfig(config);
    }
  }

  // 保存配置
  saveConfig() {
    const config = {
      theme: this.config.currentTheme || "default",
      lotteryType: this.config.currentLotteryType || "wheel",
      animations: this.config.animations,
    };
    localStorage.setItem("lotteryConfig", JSON.stringify(config));
  }

  // 应用配置
  applyConfig(config) {
    if (config.theme) {
      document.querySelector(
        `input[name="theme"][value="${config.theme}"]`
      ).checked = true;
    }
    if (config.lotteryType) {
      document.querySelector(
        `input[name="lotteryType"][value="${config.lotteryType}"]`
      ).checked = true;
    }
    if (config.animations) {
      Object.keys(config.animations).forEach((key) => {
        const checkbox = document.querySelector(
          `input[name="animations"][value="${key}"]`
        );
        if (checkbox) {
          checkbox.checked = config.animations[key].enabled;
        }
      });
    }
  }

  // 绑定事件
  bindEvents() {
    // 配置变化时保存
    document.addEventListener("change", (e) => {
      if (
        e.target.name === "theme" ||
        e.target.name === "lotteryType" ||
        e.target.name === "animations"
      ) {
        this.saveConfig();
      }
    });
  }
}

// 初始化配置管理器
const configManager = new ConfigManager();

// 工具函数
const Utils = {
  // 防抖函数
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // 节流函数
  throttle(func, limit) {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // 生成随机ID
  generateId() {
    return Math.random().toString(36).substr(2, 9);
  },

  // 格式化时间
  formatTime(date) {
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  },

  // 复制到剪贴板
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // 降级方案
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      return true;
    }
  },
};

// 导出工具函数
window.Utils = Utils;
