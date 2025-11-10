// 等待DOM完全加载后绑定所有用户交互事件
document.addEventListener('DOMContentLoaded', function() {
  // -------------------------- 辅助函数：更新登录按钮状态 --------------------------
  function updateLoginBtnStatus() {
    const nickname = elements.nicknameInput?.value.trim() || '';
    const hasAvatar = gameState.userAvatar !== '';
    
    if (elements.loginBtn) {
      if (nickname && hasAvatar) {
        elements.loginBtn.disabled = false;
        elements.loginBtn.classList.remove('opacity-70', 'cursor-not-allowed');
        elements.loginBtn.classList.add('opacity-100', 'cursor-pointer');
      } else {
        elements.loginBtn.disabled = true;
        elements.loginBtn.classList.add('opacity-70', 'cursor-not-allowed');
        elements.loginBtn.classList.remove('opacity-100', 'cursor-pointer');
      }
    }
  }

  // -------------------------- 1. 登录页面事件 --------------------------
  // 头像选择事件
  if (elements.avatarOptions) {
    elements.avatarOptions.forEach(option => {
      option.addEventListener('click', function() {
        // 移除其他头像的选中状态
        elements.avatarOptions.forEach(opt => {
          opt.classList.remove('border-primary', 'border-secondary', 'border-warning', 'border-danger');
        });
        
        // 添加当前头像的选中状态
        const avatarId = this.getAttribute('data-avatar');
        const borderColors = ['', 'border-primary', 'border-secondary', 'border-warning', 'border-danger'];
        this.classList.add(borderColors[avatarId] || 'border-primary');
        
        // 更新全局头像ID
        gameState.userAvatar = avatarId;
        
        // 启用登录按钮（如果昵称已填写）
        updateLoginBtnStatus();
      });
    });
  }

  // 昵称输入事件（实时控制登录按钮状态）
  if (elements.nicknameInput) {
    elements.nicknameInput.addEventListener('input', updateLoginBtnStatus);
  }

  // 微信登录按钮事件
  if (elements.loginBtn) {
    elements.loginBtn.addEventListener('click', function() {
      if (this.disabled) return;
      
      // 获取并验证昵称
      const nickname = elements.nicknameInput.value.trim();
      if (!nickname) {
        alert('请输入有效的昵称！');
        return;
      }
      
      // 更新用户信息（生成唯一ID）
      gameState.userName = nickname;
      gameState.userId = generateRandomId(); // 依赖game-utils.js的工具函数
      
      // 更新UI并切换到个人中心
      updateUserInfo();
      switchPage('login', 'user');
    });
  }

  // 游客登录按钮事件（核心修复：确保无依赖、直接生效）
  if (elements.guestLoginBtn) {
    elements.guestLoginBtn.addEventListener('click', function() {
      try {
        // 随机生成游客信息（无需输入，直接登录）
        const guestNames = ['星际旅行者', '宇宙探险家', '银河守护者', '太空勇士', '星云猎手', '黑洞漫步者', '星球骑士'];
        gameState.userName = guestNames[Math.floor(Math.random() * guestNames.length)];
        gameState.userId = generateRandomId();
        gameState.userAvatar = Math.floor(Math.random() * 4) + 1 + ''; // 随机选择4个头像之一
        
        // 强制更新用户信息UI
        updateUserInfo();
        
        // 切换到个人中心页面
        switchPage('login', 'user');
      } catch (error) {
        console.error('游客登录失败:', error);
        alert('游客登录失败，请刷新页面重试！');
      }
    });
  }

  // -------------------------- 2. 个人中心页面事件 --------------------------
  // 返回登录页按钮
  if (elements.backBtn) {
    elements.backBtn.addEventListener('click', function() {
      switchPage('user', 'login');
    });
  }

  // 退出登录按钮
  if (elements.logoutBtn) {
    elements.logoutBtn.addEventListener('click', function() {
      // 重置用户状态（保留战绩，仅清除当前登录信息）
      gameState.userName = '';
      gameState.userId = '';
      gameState.userAvatar = '1'; // 重置为默认头像
      
      // 切换到登录页
      switchPage('user', 'login');
    });
  }

  // 开始对战按钮
  if (elements.startGameBtn) {
    elements.startGameBtn.addEventListener('click', function() {
      // 切换到战斗页面（initBattle会在switchPage中自动调用）
      switchPage('user', 'battle');
    });
  }

  // -------------------------- 3. 战斗页面事件 --------------------------
  // 返回到个人中心
  if (elements.backToUserBtn) {
    elements.backToUserBtn.addEventListener('click', function() {
      // 确认是否退出战斗（避免误触）
      if (confirm('确定要退出战斗吗？当前进度会丢失！')) {
        // 清除战斗相关计时器
        if (gameState.battleTimer) clearInterval(gameState.battleTimer);
        if (gameState.enemySpawnTimer) clearInterval(gameState.enemySpawnTimer);
        if (gameState.countdownTimer) clearInterval(gameState.countdownTimer);
        
        // 切换页面
        switchPage('battle', 'user');
      }
    });
  }

  // 召唤士兵按钮（消耗10积分）
  if (elements.summonSoldierBtn) {
    elements.summonSoldierBtn.addEventListener('click', function() {
      if (gameState.gameOver) {
        addBattleLog('战斗已结束，无法召唤单位！', 'text-warning');
        return;
      }
      summonUnit('soldier'); // 依赖game-utils.js的召唤逻辑
    });
  }

  // 召唤坦克按钮（消耗30积分）
  if (elements.summonTankBtn) {
    elements.summonTankBtn.addEventListener('click', function() {
      if (gameState.gameOver) {
        addBattleLog('战斗已结束，无法召唤单位！', 'text-warning');
        return;
      }
      summonUnit('tank'); // 依赖game-utils.js的召唤逻辑
    });
  }

  // 新增绑定：弓箭手
  if (elements.summonArcherBtn) {
    elements.summonArcherBtn.addEventListener('click', () => {
      if (gameState.gameOver) {
        addBattleLog('战斗已结束，无法召唤单位！', 'text-warning');
        return;
      }
      summonUnit('archer');
    });
  }

  // 新增绑定：法师
  if (elements.summonMageBtn) {
    elements.summonMageBtn.addEventListener('click', () => {
      if (gameState.gameOver) {
        addBattleLog('战斗已结束，无法召唤单位！', 'text-warning');
        return;
      }
      summonUnit('mage');
    });
  }

  // 新增绑定：骑士
  if (elements.summonKnightBtn) {
    elements.summonKnightBtn.addEventListener('click', () => {
      if (gameState.gameOver) {
        addBattleLog('战斗已结束，无法召唤单位！', 'text-warning');
        return;
      }
      summonUnit('knight');
    });
  }

  // -------------------------- 4. 战斗结算弹窗事件 --------------------------
  // 从结算页返回个人中心
  if (elements.backToUserFromResult) {
    elements.backToUserFromResult.addEventListener('click', function() {
      elements.battleResult.classList.add('hidden');
      switchPage('battle', 'user');
    });
  }

  // 再来一局按钮
  if (elements.playAgainBtn) {
    elements.playAgainBtn.addEventListener('click', function() {
      elements.battleResult.classList.add('hidden');
      // 重新初始化战斗（无需切换页面，直接重置状态）
      initBattle();
    });
  }

  // -------------------------- 初始化：确保页面加载时的状态 --------------------------
  // 初始化登录按钮状态（默认禁用）
  updateLoginBtnStatus();

  // 初始化头像选中状态（默认选中第一个）
  if (elements.avatarOptions && elements.avatarOptions.length > 0) {
    elements.avatarOptions[0].click(); // 自动选中第一个头像
  }
});