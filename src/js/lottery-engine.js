// 抽奖引擎 - 支持多种抽奖类型
class LotteryEngine {
  constructor(config) {
    this.config = config;
    this.currentTheme = config.system.defaultTheme;
    this.currentLotteryType = config.system.defaultLotteryType;
    this.isSpinning = false;
    this.audioEnabled = true;
    this.history = JSON.parse(localStorage.getItem("lotteryHistory") || "[]");
    this.isLoggedIn = false;
    this.currentUser = null;
    this.usedPhones = JSON.parse(localStorage.getItem("usedPhones") || "[]");

    this.init();
  }

  init() {
    this.bindEvents();
    this.loadTheme();
    this.createParticles();
    // this.updateHistory();
    this.loadAudio();
    this.checkLoginStatus();
  }

  // 绑定事件
  bindEvents() {
    // 抽奖按钮事件
    document.addEventListener("click", (e) => {
      if (e.target.id === "gridButton" || e.target.closest("#gridButton")) {
        if (this.isLoggedIn) {
          this.spin();
        } else {
          this.showMessage("请先登录参与抽奖", "error");
        }
      } else if (
        e.target.id === "slotButton" ||
        e.target.closest("#slotButton")
      ) {
        if (this.isLoggedIn) {
          this.spin();
        } else {
          this.showMessage("请先登录参与抽奖", "error");
        }
      }
    });

    // 模态框事件
    document
      .getElementById("closeModal")
      ?.addEventListener("click", () => this.closeModal());

    document
      .getElementById("shareResult")
      ?.addEventListener("click", () => this.shareResult());

    // 音效控制
    document
      .getElementById("audioToggle")
      ?.addEventListener("click", () => this.toggleAudio());

    // 活动规则按钮
    document
      .getElementById("rulesButton")
      ?.addEventListener("click", () => this.showRulesModal());
    document
      .getElementById("rulesCloseBtn")
      ?.addEventListener("click", () => this.hideRulesModal());

    // 点击规则弹窗外部关闭
    document.getElementById("rulesModal")?.addEventListener("click", (e) => {
      if (e.target === document.getElementById("rulesModal")) {
        this.hideRulesModal();
      }
    });

    // 登录表单事件
    document.getElementById("loginForm")?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    // 手机号输入限制
    document.getElementById("phoneInput")?.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/\D/g, "");
    });

    // 登出按钮
    document.getElementById("logoutBtn")?.addEventListener("click", () => {
      this.logout();
    });

    // 点击模态框外部关闭
    document.getElementById("resultModal")?.addEventListener("click", (e) => {
      if (e.target === document.getElementById("resultModal")) {
        this.closeModal();
      }
    });
  }

  // 生成抽奖界面
  generateLottery() {
    this.hideAllLotteries();

    switch (this.currentLotteryType) {
      case "grid":
        this.generateGridLottery();
        break;
      case "slot":
        this.generateSlotLottery();
        break;
    }
  }

  // 隐藏所有抽奖类型
  hideAllLotteries() {
    document.getElementById("gridLottery").style.display = "none";
    document.getElementById("slotLottery").style.display = "none";
  }

  // 生成九宫格抽奖
  generateGridLottery() {
    const gridLottery = document.getElementById("gridLottery");
    const gridContainer = document.getElementById("gridContainer");

    gridLottery.style.display = "flex";
    gridLottery.style.visibility = "visible";
    gridContainer.innerHTML = "";

    const prizes = this.config.prizes;
    const gridSize = Math.ceil(Math.sqrt(prizes.length));
    const totalItems = gridSize * gridSize;

    // 创建网格
    gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    gridContainer.style.width = `${gridSize * 120 + (gridSize - 1) * 10}px`;
    gridContainer.style.height = `${gridSize * 120 + (gridSize - 1) * 10}px`;

    for (let i = 0; i < totalItems; i++) {
      const item = document.createElement("div");
      item.className = "grid-item";

      if (i < prizes.length) {
        const prize = prizes[i];
        item.style.background = `linear-gradient(135deg, ${
          prize.color
        }, ${this.darkenColor(prize.color, 20)})`;
        item.innerHTML = `
                    <div class="prize-icon">
                        <i class="${prize.icon}"></i>
                    </div>
                    <div class="prize-text">${prize.name}</div>
                    <div class="prize-amount">${prize.amount}</div>
                `;
        item.dataset.prize = JSON.stringify(prize);
      } else {
        item.innerHTML = '<div class="prize-text">谢谢参与</div>';
        item.style.background = "rgba(255, 255, 255, 0.1)";
      }

      gridContainer.appendChild(item);
    }

    // 添加开始按钮
    const startButton = document.createElement("div");
    startButton.className = "grid-start-button";
    startButton.id = "gridButton";
    startButton.innerHTML = `
            <i class="fas fa-play"></i>
            <span>开始抽奖</span>
        `;
    gridLottery.appendChild(startButton);
  }

  // 生成老虎机抽奖
  generateSlotLottery() {
    const slotLottery = document.getElementById("slotLottery");
    slotLottery.style.display = "flex";
    slotLottery.style.visibility = "visible";

    // 老虎机已经通过HTML预定义，这里只需要更新奖品
    const reels = document.querySelectorAll(".slot-reel");
    const prizes = this.config.prizes;

    reels[0].innerHTML = prizes
      .map((prize) => `<div class="slot-item">${prize.name}</div>`)
      .join("");

    reels[1].innerHTML = prizes
      .map((prize) => `<div class="slot-item">${prize.amount}</div>`)
      .join("");

    reels[2].innerHTML = prizes
      .map(
        (prize) =>
          `<div class="slot-item">${Math.round(prize.probability * 100)}%</div>`
      )
      .join("");
  }

  // 抽奖逻辑
  spin() {
    if (this.isSpinning) return;

    this.isSpinning = true;
    this.playSound("click");

    // 根据概率选择奖品
    const selectedPrize = this.selectPrize();

    switch (this.currentLotteryType) {
      case "grid":
        this.spinGrid(selectedPrize);
        break;
      case "slot":
        this.spinSlot(selectedPrize);
        break;
    }
  }

  // 九宫格抽奖
  spinGrid(prize) {
    const items = document.querySelectorAll(".grid-item");
    const gridButton = document.getElementById("gridButton");
    const targetItem = Array.from(items).find(
      (item) =>
        item.dataset.prize && JSON.parse(item.dataset.prize).name === prize.name
    );

    if (!targetItem) return;

    // 更新按钮状态
    gridButton.classList.add("spinning");
    gridButton.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i><span>抽奖中...</span>';

    // 随机选择路径
    const path = this.generateGridPath(
      items.length,
      Array.from(items).indexOf(targetItem)
    );
    let currentIndex = 0;

    const highlightNext = () => {
      if (currentIndex < path.length) {
        // 清除之前的高亮
        items.forEach((item) => item.classList.remove("selected"));

        // 高亮当前项
        items[path[currentIndex]].classList.add("selected");
        
        // 播放激烈的旋转音效
        this.playSound("spin");
        
        currentIndex++;

        // 逐渐加快速度，创造紧张感
        const delay = Math.max(50, 200 - currentIndex * 10);
        setTimeout(highlightNext, delay);
      } else {
        // 播放庆祝音效
        this.playSound("celebration");
        this.showResult(prize);
        this.isSpinning = false;
        // 恢复按钮状态
        gridButton.classList.remove("spinning");
        gridButton.innerHTML =
          '<i class="fas fa-play"></i><span>开始抽奖</span>';
      }
    };

    highlightNext();
  }

  // 老虎机抽奖
  spinSlot(prize) {
    const reels = document.querySelectorAll(".slot-reel");
    const slotButton = document.getElementById("slotButton");

    slotButton.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i><span>抽奖中...</span>';
    slotButton.disabled = true;

    const prizeIndex = this.config.prizes.findIndex(
      (p) => p.name === prize.name
    );

    // 播放持续的旋转音效
    const spinInterval = setInterval(() => {
      this.playSound("spin");
    }, 100);

    reels.forEach((reel, index) => {
      reel.classList.add("spinning");
      const items = reel.querySelectorAll(".slot-item");
      const targetItem = items[prizeIndex];

      setTimeout(() => {
        reel.classList.remove("spinning");
        reel.scrollTop = targetItem.offsetTop;
        
        // 每个转轮停止时播放音效
        this.playSound("click");
      }, this.config.slot.spinDuration + index * 500);
    });

    setTimeout(() => {
      // 停止旋转音效
      clearInterval(spinInterval);
      
      // 播放庆祝音效
      this.playSound("celebration");
      this.showResult(prize);
      this.isSpinning = false;
      slotButton.innerHTML = '<i class="fas fa-play"></i><span>开始抽奖</span>';
      slotButton.disabled = false;
    }, this.config.slot.spinDuration + 1000);
  }

  // 生成九宫格路径
  generateGridPath(totalItems, targetIndex) {
    const path = [];
    const visited = new Set();
    let current = Math.floor(Math.random() * totalItems);

    for (let i = 0; i < 15; i++) {
      if (!visited.has(current)) {
        path.push(current);
        visited.add(current);
      }

      // 随机选择下一个位置
      const neighbors = this.getGridNeighbors(current, totalItems);
      current = neighbors[Math.floor(Math.random() * neighbors.length)];
    }

    // 确保最后停在目标位置
    path.push(targetIndex);
    return path;
  }

  // 获取九宫格邻居
  getGridNeighbors(index, totalItems) {
    const gridSize = Math.ceil(Math.sqrt(totalItems));
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const neighbors = [];

    for (
      let r = Math.max(0, row - 1);
      r <= Math.min(gridSize - 1, row + 1);
      r++
    ) {
      for (
        let c = Math.max(0, col - 1);
        c <= Math.min(gridSize - 1, col + 1);
        c++
      ) {
        const neighborIndex = r * gridSize + c;
        if (neighborIndex !== index && neighborIndex < totalItems) {
          neighbors.push(neighborIndex);
        }
      }
    }

    return neighbors;
  }

  // 根据概率选择奖品
  selectPrize() {
    const random = Math.random();
    let cumulativeProbability = 0;

    for (const prize of this.config.prizes) {
      cumulativeProbability += prize.probability;
      if (random <= cumulativeProbability) {
        return prize;
      }
    }

    return this.config.prizes[this.config.prizes.length - 1];
  }

  // 显示抽奖结果
  showResult(prize) {
    this.playSound("win");

    // 更新用户名显示
    const resultUser = document.getElementById("resultUser");
    if (this.currentUser) {
      resultUser.innerHTML = `<i class="fas fa-user"></i><span>${this.currentUser.name}</span>`;
    } else {
      resultUser.innerHTML = `<i class="fas fa-user"></i><span>匿名用户</span>`;
    }

    document.getElementById("resultPrize").textContent = prize.name;
    document.getElementById("resultAmount").textContent = prize.amount;

    document.getElementById("resultModal").classList.add("show");

    this.addToHistory(prize);
    this.createCelebration();
  }

  // 创建庆祝效果
  createCelebration() {
    if (!this.config.animations.confetti.enabled) return;

    const colors = this.config.animations.confetti.colors;

    for (let i = 0; i < this.config.animations.confetti.count; i++) {
      setTimeout(() => {
        const confetti = document.createElement("div");
        confetti.style.position = "fixed";
        confetti.style.left = Math.random() * 100 + "vw";
        confetti.style.top = "-10px";
        confetti.style.width = "10px";
        confetti.style.height = "10px";
        confetti.style.backgroundColor =
          colors[Math.floor(Math.random() * colors.length)];
        confetti.style.borderRadius = "50%";
        confetti.style.pointerEvents = "none";
        confetti.style.zIndex = "9999";
        confetti.style.animation = "confettiFall 3s linear forwards";

        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 3000);
      }, i * 100);
    }
  }

  // 添加庆祝动画样式
  addCelebrationStyles() {
    if (document.getElementById("celebration-styles")) return;

    const style = document.createElement("style");
    style.id = "celebration-styles";
    style.textContent = `
            @keyframes confettiFall {
                0% {
                    transform: translateY(0) rotate(0deg);
                    opacity: 1;
                }
                100% {
                    transform: translateY(100vh) rotate(720deg);
                    opacity: 0;
                }
            }
        `;
    document.head.appendChild(style);
  }

  // 添加到历史记录
  addToHistory(prize) {
    const record = {
      prize: prize.name,
      amount: prize.amount,
      time: new Date().toLocaleString(),
      user: this.currentUser
        ? {
            name: this.currentUser.name,
            phone: this.currentUser.phone.replace(
              /(\d{3})\d{4}(\d{4})/,
              "$1****$2"
            ),
          }
        : null,
    };

    this.history.unshift(record);

    if (this.history.length > 20) {
      this.history = this.history.slice(0, 20);
    }

    localStorage.setItem("lotteryHistory", JSON.stringify(this.history));
    this.updateHistory();
  }

  // 更新历史记录显示
  updateHistory() {
    const historyList = document.getElementById("historyList");

    if (this.history.length === 0) {
      historyList.innerHTML =
        '<div class="history-item empty">暂无抽奖记录</div>';
      return;
    }

    historyList.innerHTML = this.history
      .map(
        (record) => `
            <div class="history-item">
                <div class="history-prize">
                    <span>${record.prize} - ${record.amount}</span>
                    ${
                      record.user
                        ? `<span class="history-user">${record.user.name} (${record.user.phone})</span>`
                        : ""
                    }
                </div>
                <span class="history-time">${record.time}</span>
            </div>
        `
      )
      .join("");
  }

  // 关闭模态框
  closeModal() {
    document.getElementById("resultModal").classList.remove("show");
  }


  // 分享结果
  shareResult() {
    const resultPrize = document.getElementById("resultPrize").textContent;
    const resultAmount = document.getElementById("resultAmount").textContent;

    if (navigator.share) {
      navigator.share({
        title: "抽奖结果",
        text: `我抽中了${resultPrize}，获得了${resultAmount}！`,
        url: window.location.href,
      });
    } else {
      const text = `我抽中了${resultPrize}，获得了${resultAmount}！快来试试你的运气吧！${window.location.href}`;
      navigator.clipboard.writeText(text).then(() => {
        alert("结果已复制到剪贴板！");
      });
    }
  }

  // 切换音效
  toggleAudio() {
    this.audioEnabled = !this.audioEnabled;
    const audioToggle = document.getElementById("audioToggle");
    audioToggle.classList.toggle("muted", !this.audioEnabled);
    audioToggle.innerHTML = this.audioEnabled
      ? '<i class="fas fa-volume-up"></i>'
      : '<i class="fas fa-volume-mute"></i>';
  }

  // 显示活动规则弹窗
  showRulesModal() {
    this.generateRulesContent();
    document.getElementById("rulesModal").classList.add("show");
  }

  // 隐藏活动规则弹窗
  hideRulesModal() {
    document.getElementById("rulesModal").classList.remove("show");
  }

  // 生成规则内容
  generateRulesContent() {
    const rulesModalBody = document.getElementById("rulesModalBody");
    const rules = this.config.activity.rules;
    
    rulesModalBody.innerHTML = rules.map(rule => `
      <div class="rule-item">
        <i class="fas fa-check-circle"></i>
        <span>${rule}</span>
      </div>
    `).join('');
  }

  // 检查登录状态
  checkLoginStatus() {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
      this.isLoggedIn = true;
      this.showMainContent();
    } else {
      this.showLoginForm();
    }
  }

  // 显示登录表单
  showLoginForm() {
    document.getElementById("loginContainer").style.display = "flex";
    document.getElementById("mainHeader").style.display = "none";
    document.getElementById("lotteryContainer").style.display = "none";
    document.getElementById("history").style.display = "none";
    document.getElementById("userInfo").style.display = "none";
  }

  // 显示主要内容
  showMainContent() {
    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("mainHeader").style.display = "block";
    document.getElementById("lotteryContainer").style.display = "flex";
    document.getElementById("userInfo").style.display = "flex";
    // if (this.config.system.showHistory) {
    //   document.getElementById("history").style.display = "block";
    // }

    // 更新用户信息显示
    if (this.currentUser) {
      document.getElementById("userName").textContent = this.currentUser.name;
    }

    // 确保抽奖容器可见
    const lotteryContainer = document.getElementById("lotteryContainer");
    lotteryContainer.style.display = "flex";
    lotteryContainer.style.visibility = "visible";

    this.generateLottery();
  }

  // 处理登录
  handleLogin() {
    const phoneInput = document.getElementById("phoneInput");
    const nameInput = document.getElementById("nameInput");
    const phone = phoneInput.value.trim();
    const name = nameInput.value.trim();

    // 验证手机号
    if (!this.validatePhone(phone)) {
      this.showMessage("请输入正确的手机号码", "error");
      return;
    }

    // 检查是否已经抽过奖
    if (this.usedPhones.includes(phone)) {
      this.showMessage("该手机号已经参与过抽奖，每个号码仅可参与一次", "error");
      return;
    }

    // 保存用户信息
    this.currentUser = {
      phone: phone,
      name: name || "匿名用户",
      loginTime: new Date().toISOString(),
    };

    this.isLoggedIn = true;
    localStorage.setItem("currentUser", JSON.stringify(this.currentUser));
    this.usedPhones.push(phone);
    localStorage.setItem("usedPhones", JSON.stringify(this.usedPhones));

    this.showMessage(`欢迎 ${this.currentUser.name}！登录成功`, "success");

    // 延迟显示主要内容，让用户看到成功消息
    setTimeout(() => {
      this.showMainContent();
    }, 1500);
  }

  // 验证手机号
  validatePhone(phone) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  }

  // 显示消息
  showMessage(message, type = "info") {
    // 创建消息元素
    const messageEl = document.createElement("div");
    messageEl.className = `message message-${type}`;
    messageEl.innerHTML = `
            <i class="fas fa-${
              type === "error"
                ? "exclamation-circle"
                : type === "success"
                ? "check-circle"
                : "info-circle"
            }"></i>
            <span>${message}</span>
        `;

    // 添加样式
    Object.assign(messageEl.style, {
      position: "fixed",
      top: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      background:
        type === "error"
          ? "#e74c3c"
          : type === "success"
          ? "#27ae60"
          : "#3498db",
      color: "white",
      padding: "15px 25px",
      borderRadius: "10px",
      boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
      zIndex: "3000",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontSize: "1rem",
      fontWeight: "500",
      animation: "slideInDown 0.3s ease-out",
    });

    document.body.appendChild(messageEl);

    // 3秒后移除
    setTimeout(() => {
      messageEl.style.animation = "slideOutUp 0.3s ease-out";
      setTimeout(() => {
        if (messageEl.parentNode) {
          messageEl.parentNode.removeChild(messageEl);
        }
      }, 300);
    }, 3000);
  }

  // 登出
  logout() {
    this.isLoggedIn = false;
    this.currentUser = null;
    localStorage.removeItem("currentUser");
    this.showLoginForm();
    this.showMessage("已退出登录", "info");
  }

  // 加载主题
  loadTheme() {
    const theme = this.config.themes[this.currentTheme];
    const root = document.documentElement;

    root.style.setProperty("--primary-color", theme.primary);
    root.style.setProperty("--secondary-color", theme.secondary);
    root.style.setProperty("--accent-color", theme.accent);
    root.style.setProperty("--background", theme.background);
    root.style.setProperty("--text-color", theme.text);
    root.style.setProperty("--card-bg", theme.card);
  }

  // 创建背景粒子效果
  createParticles() {
    if (!this.config.animations.particles.enabled) return;

    const particlesContainer = document.getElementById("particles");
    const particleCount = this.config.animations.particles.count;

    particlesContainer.innerHTML = "";

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = Math.random() * 100 + "%";
      particle.style.top = Math.random() * 100 + "%";
      particle.style.animationDelay = Math.random() * 6 + "s";
      particle.style.animationDuration = Math.random() * 3 + 3 + "s";
      particlesContainer.appendChild(particle);
    }
  }

  // 加载音效
  loadAudio() {
    if (!this.config.animations.sound.enabled) return;

    this.audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    this.sounds = {
      spin: this.createSpinSound(),
      win: this.createWinSound(),
      click: this.createClickSound(),
      celebration: this.createCelebrationSound(),
    };
  }

  // 创建抽奖音效 - 激烈的旋转音效
  createSpinSound() {
    return () => {
      if (!this.audioEnabled || !this.config.animations.sound.enabled) return;

      const duration = 0.3;
      const baseFreq = 200;
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();

      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // 设置滤波器为低通，创造更激烈的音效
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, this.audioContext.currentTime);
      filter.Q.setValueAtTime(10, this.audioContext.currentTime);

      // 频率快速变化，创造旋转效果
      oscillator.frequency.setValueAtTime(baseFreq, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        baseFreq * 3,
        this.audioContext.currentTime + duration * 0.3
      );
      oscillator.frequency.exponentialRampToValueAtTime(
        baseFreq * 0.5,
        this.audioContext.currentTime + duration
      );

      oscillator.type = 'sawtooth';

      // 音量包络
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        this.config.animations.sound.volume * 0.8,
        this.audioContext.currentTime + 0.01
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + duration
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    };
  }

  // 创建中奖音效 - 胜利的庆祝音效
  createWinSound() {
    return () => {
      if (!this.audioEnabled || !this.config.animations.sound.enabled) return;

      const duration = 1.5;
      const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();
          const filter = this.audioContext.createBiquadFilter();

          oscillator.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(this.audioContext.destination);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(3000, this.audioContext.currentTime);

          oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
          oscillator.type = 'triangle';

          gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(
            this.config.animations.sound.volume * 0.6,
            this.audioContext.currentTime + 0.1
          );
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            this.audioContext.currentTime + 0.8
          );

          oscillator.start(this.audioContext.currentTime);
          oscillator.stop(this.audioContext.currentTime + 0.8);
        }, index * 200);
      });
    };
  }

  // 创建点击音效 - 清脆的点击声
  createClickSound() {
    return () => {
      if (!this.audioEnabled || !this.config.animations.sound.enabled) return;

      const duration = 0.1;
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();

      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);

      oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime);
      oscillator.type = 'square';

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        this.config.animations.sound.volume * 0.3,
        this.audioContext.currentTime + 0.01
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + duration
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    };
  }

  // 创建庆祝音效 - 爆炸式的庆祝声
  createCelebrationSound() {
    return () => {
      if (!this.audioEnabled || !this.config.animations.sound.enabled) return;

      // 创建多个音效层
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();
          const filter = this.audioContext.createBiquadFilter();

          oscillator.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(this.audioContext.destination);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(4000, this.audioContext.currentTime);

          // 随机频率
          const freq = 200 + Math.random() * 800;
          oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
          oscillator.type = 'sawtooth';

          gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(
            this.config.animations.sound.volume * 0.4,
            this.audioContext.currentTime + 0.05
          );
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            this.audioContext.currentTime + 0.3
          );

          oscillator.start(this.audioContext.currentTime);
          oscillator.stop(this.audioContext.currentTime + 0.3);
        }, i * 50);
      }
    };
  }

  // 创建音效（保留原方法用于兼容性）
  createTone(frequency, duration, type) {
    return () => {
      if (!this.audioEnabled || !this.config.animations.sound.enabled) return;

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(
        frequency,
        this.audioContext.currentTime
      );
      oscillator.type = type;

      gainNode.gain.setValueAtTime(
        this.config.animations.sound.volume,
        this.audioContext.currentTime
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + duration
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    };
  }

  // 播放音效
  playSound(soundName) {
    if (this.sounds && this.sounds[soundName]) {
      this.sounds[soundName]();
    }
  }

  // 颜色变暗
  darkenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = ((num >> 8) & 0x00ff) - amt;
    const B = (num & 0x0000ff) - amt;
    return (
      "#" +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    );
  }
}

// 导出类
if (typeof module !== "undefined" && module.exports) {
  module.exports = LotteryEngine;
}
