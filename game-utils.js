// 全局DOM元素缓存（确保正确获取，避免样式生效后元素找不到）
const elements = {
  // 页面容器
  loginPage: document.getElementById('login-page'),
  userPage: document.getElementById('user-page'),
  battlePage: document.getElementById('battle-page'),
  
  // 登录页面元素
  nickname: document.getElementById('nickname'),
  loginBtn: document.getElementById('login-btn'),
  guestLoginBtn: document.getElementById('guest-login'),
  avatarOptions: document.querySelectorAll('.avatar-option'),
  
  // 个人中心元素
  backBtn: document.getElementById('back-btn'),
  logoutBtn: document.getElementById('logout-btn'),
  startGameBtn: document.getElementById('start-game'),
  userName: document.getElementById('user-name'),
  userId: document.getElementById('user-id'),
  userAvatar: document.getElementById('user-avatar'),
  winCount: document.getElementById('win-count'),
  loseCount: document.getElementById('lose-count'),
  winRate: document.getElementById('win-rate'),
  
  // 战斗页面元素
  backToUserBtn: document.getElementById('back-to-user'),
  battleUserName: document.getElementById('battle-user-name'),
  battleUserAvatar: document.getElementById('battle-user-avatar'),
  battleScore: document.getElementById('battle-score'),
  remainingScore: document.getElementById('remaining-score'), // 剩余积分元素
  campHp: document.getElementById('camp-hp'),
  battleLog: document.getElementById('battle-log'),
  damageContainer: document.getElementById('damage-container'),
  countdownContainer: document.getElementById('countdown-container'),
  countdownText: document.getElementById('countdown-text'),
  summonSoldierBtn: document.getElementById('summon-soldier'),
  summonTankBtn: document.getElementById('summon-tank'),
  
  // 结算弹窗元素
  battleResult: document.getElementById('battle-result'),
  resultIconContainer: document.getElementById('result-icon-container'),
  resultIcon: document.getElementById('result-icon'),
  resultTitle: document.getElementById('result-title'),
  resultDesc: document.getElementById('result-desc'),
  statKills: document.getElementById('stat-kills'),
  statCampHp: document.getElementById('stat-camp-hp'),
  statTime: document.getElementById('stat-time'),
  statSummoned: document.getElementById('stat-summoned'),
  rewardSection: document.getElementById('reward-section'),
  rewardBase: document.getElementById('reward-base'),
  rewardKills: document.getElementById('reward-kills'),
  rewardTotal: document.getElementById('reward-total'),
  backToUserFromResult: document.getElementById('back-to-user-from-result'),
  playAgainBtn: document.getElementById('play-again')
};

/**
 * 页面切换函数
 * @param {string} fromPage - 来源页面（login/user/battle）
 * @param {string} toPage - 目标页面（login/user/battle）
 */
function switchPage(fromPage, toPage) {
  try {
    const fromEl = elements[`${fromPage}Page`];
    const toEl = elements[`${toPage}Page`];
    
    if (!fromEl || !toEl) return;
    
    // 隐藏来源页面
    fromEl.classList.add('hidden');
    fromEl.style.opacity = 0;
    
    // 显示目标页面（延迟保证过渡效果）
    setTimeout(() => {
      toEl.classList.remove('hidden');
      setTimeout(() => {
        toEl.style.opacity = 1;
        gameState.currentPage = toPage;
        
        // 切换到战斗页面时初始化
        if (toPage === 'battle') {
          initBattle();
        }
      }, 50);
    }, 300);
  } catch (error) {
    console.error('页面切换失败:', error);
  }
}

/**
 * 生成随机ID
 * @returns {string} 随机字符串ID
 */
function generateRandomId() {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * 计算胜率
 * @returns {string} 胜率百分比
 */
function calculateWinRate() {
  const total = gameState.winCount + gameState.loseCount;
  return total === 0 ? '0%' : Math.round((gameState.winCount / total) * 100) + '%';
}

/**
 * 更新用户信息UI
 */
function updateUserInfo() {
  try {
    // 头像配置
    const avatarIcons = ['fa-user', 'fa-robot', 'fa-alien', 'fa-star'];
    const avatarColors = ['text-primary', 'text-secondary', 'text-warning', 'text-danger'];
    const avatarBgColors = ['bg-primary/20', 'bg-secondary/20', 'bg-warning/20', 'bg-danger/20'];
    const avatarBorderColors = ['border-primary', 'border-secondary', 'border-warning', 'border-danger'];
    
    // 确保头像索引在有效范围
    let avatarIndex = parseInt(gameState.userAvatar) - 1;
    avatarIndex = Math.max(0, Math.min(3, avatarIndex));
    
    // 更新用户中心头像
    if (elements.userAvatar) {
      elements.userAvatar.className = `w-16 h-16 rounded-full ${avatarBgColors[avatarIndex]} border-2 ${avatarBorderColors[avatarIndex]} flex items-center justify-center mr-4`;
      elements.userAvatar.innerHTML = `<i class="fa ${avatarIcons[avatarIndex]} text-2xl ${avatarColors[avatarIndex]}"></i>`;
    }
    
    // 更新战斗页面头像
    if (elements.battleUserAvatar) {
      elements.battleUserAvatar.className = `w-10 h-10 rounded-full ${avatarBgColors[avatarIndex]} border-2 ${avatarBorderColors[avatarIndex]} flex items-center justify-center mr-2`;
      elements.battleUserAvatar.innerHTML = `<i class="fa ${avatarIcons[avatarIndex]} text-lg ${avatarColors[avatarIndex]}"></i>`;
    }
    
    // 更新其他信息
    if (elements.userName) elements.userName.textContent = gameState.userName || '星际战士';
    if (elements.userId) elements.userId.textContent = gameState.userId || '888888';
    if (elements.winCount) elements.winCount.textContent = gameState.winCount;
    if (elements.loseCount) elements.loseCount.textContent = gameState.loseCount;
    if (elements.winRate) elements.winRate.textContent = calculateWinRate();
    if (elements.battleUserName) elements.battleUserName.textContent = gameState.userName || '星际战士';
  } catch (error) {
    console.error('更新用户信息失败:', error);
    // 降级默认值
    if (elements.userAvatar) {
      elements.userAvatar.className = 'w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mr-4';
      elements.userAvatar.innerHTML = '<i class="fa fa-user text-2xl text-primary"></i>';
    }
  }
}

/**
 * 初始化战斗
 */
function initBattle() {
  try {
    // 重置战斗状态（新增剩余积分初始化）
    gameState.battleTime = 0;
    gameState.battleScore = 100;
    gameState.remainingScore = 100; // 剩余积分初始值=总积分
    gameState.campHp = 200;
    gameState.killCount = 0;
    gameState.units = [];
    gameState.remainingTime = 60;
    gameState.gameOver = false;
    gameState.statData = {
      summonedUnits: 0,
      enemyTypesKilled: { enemy1: 0, enemy2: 0, enemy3: 0 }
    };
    
    // 清空战场单位
    const battleField = document.querySelector('.battle-field');
    if (battleField) {
      document.querySelectorAll('.unit').forEach(unit => {
        if (unit.parentNode === battleField) unit.remove();
      });
    }
    
    // 更新UI（新增剩余积分更新）
    if (elements.battleScore) elements.battleScore.textContent = gameState.battleScore;
    if (elements.remainingScore) elements.remainingScore.textContent = gameState.remainingScore;
    if (elements.campHp) elements.campHp.textContent = gameState.campHp;
    if (elements.battleLog) elements.battleLog.innerHTML = '';
    if (elements.battleResult) elements.battleResult.classList.add('hidden');
    if (elements.countdownContainer) elements.countdownContainer.classList.remove('countdown-warning');
    
    // 清除旧计时器
    if (gameState.battleTimer) clearInterval(gameState.battleTimer);
    if (gameState.enemySpawnTimer) clearInterval(gameState.enemySpawnTimer);
    if (gameState.countdownTimer) clearInterval(gameState.countdownTimer);
    
    // 启动计时器
    gameState.battleTimer = setInterval(() => gameState.battleTime++, 1000);
    startCountdown();
    startEnemySpawn();
    
    // 战斗日志
    addBattleLog('战斗开始! 敌人全力进攻大本营，坚守1分钟!', 'text-gray-300');
    addBattleLog(`初始积分: ${gameState.battleScore}`, 'text-yellow-400');
  } catch (error) {
    console.error('初始化战斗失败:', error);
    addBattleLog('战斗初始化失败，请重试', 'text-danger');
  }
}

/**
 * 启动倒计时
 */
function startCountdown() {
  if (!elements.countdownText) return;
  
  gameState.countdownTimer = setInterval(() => {
    if (gameState.gameOver) {
      clearInterval(gameState.countdownTimer);
      return;
    }
    
    gameState.remainingTime--;
    updateCountdownUI();
    
    // 倒计时结束 = 胜利
    if (gameState.remainingTime <= 0) {
      clearInterval(gameState.countdownTimer);
      endBattle(true);
    }
    
    // 最后10秒警告
    if (gameState.remainingTime === 10 && elements.countdownContainer) {
      elements.countdownContainer.classList.add('countdown-warning');
      addBattleLog('倒计时10秒！坚持住！', 'text-warning');
    }
  }, 1000);
}

/**
 * 更新倒计时UI
 */
function updateCountdownUI() {
  if (!elements.countdownText) return;
  
  const minutes = Math.floor(gameState.remainingTime / 60).toString().padStart(2, '0');
  const seconds = (gameState.remainingTime % 60).toString().padStart(2, '0');
  elements.countdownText.textContent = `${minutes}:${seconds}`;
}

/**
 * 开始生成敌人
 */
function startEnemySpawn() {
  // 初始生成2个敌人
  spawnEnemy();
  spawnEnemy();
  
  // 后续每隔1.5-2.5秒生成1个
  gameState.enemySpawnTimer = setInterval(() => {
    if (!gameState.gameOver) spawnEnemy();
    else clearInterval(gameState.enemySpawnTimer);
  }, Math.random() * 1000 + 1500);
}

/**
 * 生成单个敌人
 */
function spawnEnemy() {
  try {
    const enemyTypes = ['enemy1', 'enemy2', 'enemy3'];
    const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    const config = unitConfigs[randomType];
    if (!config) return;
    
    const battleField = document.querySelector('.battle-field');
    if (!battleField) return;
    
    // 随机生成x坐标（避免超出屏幕）
    const fieldWidth = battleField.offsetWidth;
    const x = Math.random() * (fieldWidth - 60) + 30;
    
    // 创建敌人元素
    const enemyId = generateRandomId();
    const enemyElement = document.createElement('div');
    enemyElement.id = enemyId;
    enemyElement.className = `unit bg-${config.color}/20 border-2 border-${config.color} animate-spawn`;
    enemyElement.style.left = `${x}px`;
    enemyElement.style.top = '40px'; // 顶部生成
    
    // 敌人内容（图标+血条）
    enemyElement.innerHTML = `
      <i class="fa ${config.icon} text-xl text-${config.color}"></i>
      <div class="hp-bar">
        <div class="hp-fill bg-${config.color}" style="width: 100%"></div>
      </div>
    `;
    
    battleField.appendChild(enemyElement);
    
    // 获取大本营位置（用于导航）
    const campElement = document.querySelector('.camp');
    const campRect = campElement.getBoundingClientRect();
    const fieldRect = battleField.getBoundingClientRect();
    const campX = campRect.left - fieldRect.left + campRect.width / 2;
    const campY = campRect.top - fieldRect.top + campRect.height / 2;
    
    // 存储敌人数据
    const enemy = {
      id: enemyId,
      type: config.type,
      name: config.name,
      x,
      y: 40,
      hp: config.hp,
      maxHp: config.hp,
      attack: config.attack,
      speed: config.speed,
      isEnemy: true,
      element: enemyElement,
      isEngaged: false,
      target: null,
      attackCooldown: 0,
      searchRange: config.searchRange,
      campTarget: { x: campX, y: campY },
      killReward: config.killReward
    };
    
    gameState.units.push(enemy);
    addBattleLog(`敌人${config.name}发起进攻！`, 'text-danger');
    
    // 启动敌人AI
    startUnitAI(enemy);
  } catch (error) {
    console.error('生成敌人失败:', error);
  }
}

/**
 * 召唤友军单位
 * @param {string} unitType - 单位类型（soldier/tank）
 */
function summonUnit(unitType) {
  if (gameState.gameOver) return;
  
  const config = unitConfigs[unitType];
  if (!config) return;
  
  // 积分不足
  if (gameState.battleScore < config.cost) {
    addBattleLog(`积分不足，无法召唤${unitType === 'soldier' ? '士兵' : '坦克'}`, 'text-warning');
    return;
  }
  
  try {
    // 扣除积分（同步更新剩余积分）
    gameState.battleScore -= config.cost;
    gameState.remainingScore -= config.cost;
    if (elements.battleScore) elements.battleScore.textContent = gameState.battleScore;
    if (elements.remainingScore) elements.remainingScore.textContent = gameState.remainingScore;
    
    gameState.statData.summonedUnits++;
    
    const campElement = document.querySelector('.camp');
    const battleField = document.querySelector('.battle-field');
    if (!campElement || !battleField) return;
    
    const campRect = campElement.getBoundingClientRect();
    const fieldRect = battleField.getBoundingClientRect();
    
    // 随机左右生成
    const isLeft = Math.random() > 0.5;
    const x = isLeft 
      ? campRect.left - fieldRect.left - 60 
      : campRect.right - fieldRect.left + 10;
    
    // 创建单位元素
    const unitId = generateRandomId();
    const unitElement = document.createElement('div');
    unitElement.id = unitId;
    unitElement.className = `unit bg-${config.color}/20 border-2 border-${config.color} animate-spawn`;
    unitElement.style.left = `${x}px`;
    unitElement.style.bottom = '120px';
    
    // 单位内容
    unitElement.innerHTML = `
      <i class="fa ${config.icon} text-xl text-${config.color}"></i>
      <div class="hp-bar">
        <div class="hp-fill bg-${config.color}" style="width: 100%"></div>
      </div>
    `;
    
    battleField.appendChild(unitElement);
    
    // 存储单位数据
    const unit = {
      id: unitId,
      type: config.type,
      x,
      y: battleField.offsetHeight - 170,
      hp: config.hp,
      maxHp: config.hp,
      attack: config.attack,
      speed: config.speed,
      isEnemy: false,
      element: unitElement,
      isEngaged: false,
      target: null,
      attackCooldown: 0,
      searchRange: config.searchRange
    };
    
    gameState.units.push(unit);
    addBattleLog(`召唤了${unitType === 'soldier' ? '士兵' : '坦克'}! 消耗${config.cost}积分`, 'text-success');
    
    // 启动友军AI
    startUnitAI(unit);
  } catch (error) {
    console.error('召唤单位失败:', error);
    // 恢复积分（同步恢复剩余积分）
    gameState.battleScore += config.cost;
    gameState.remainingScore += config.cost;
    if (elements.battleScore) elements.battleScore.textContent = gameState.battleScore;
    if (elements.remainingScore) elements.remainingScore.textContent = gameState.remainingScore;
    addBattleLog(`召唤${unitType === 'soldier' ? '士兵' : '坦克'}失败，请重试`, 'text-danger');
  }
}

/**
 * 启动单位AI
 * @param {object} unit - 单位数据对象
 */
function startUnitAI(unit) {
  if (!unit.element || !document.getElementById(unit.id) || gameState.gameOver) return;
  
  const aiInterval = setInterval(() => {
    if (!document.getElementById(unit.id) || gameState.gameOver) {
      clearInterval(aiInterval);
      return;
    }
    
    if (unit.hp <= 0) {
      removeUnit(unit);
      clearInterval(aiInterval);
      return;
    }
    
    // 敌人AI vs 友军AI
    unit.isEnemy ? enemyAIBehavior(unit) : allyAIBehavior(unit);
  }, 100);
}

/**
 * 敌人AI行为（优先攻击大本营）
 * @param {object} enemy - 敌人数据对象
 */
function enemyAIBehavior(enemy) {
  try {
    const campElement = document.querySelector('.camp');
    const battleField = document.querySelector('.battle-field');
    if (!campElement || !battleField) return;
    
    const campRect = campElement.getBoundingClientRect();
    const enemyRect = enemy.element.getBoundingClientRect();
    
    // 检查是否到达大本营攻击范围
    const isInCampRange = enemyRect.top >= campRect.top - 50 && 
                          enemyRect.top <= campRect.bottom + 50 &&
                          enemyRect.left >= campRect.left - 50 && 
                          enemyRect.right <= campRect.right + 50;
    
    if (isInCampRange) {
      enemy.isEngaged = true;
      enemy.element.classList.add('unit-engaged');
      attackCamp(enemy);
      return;
    }
    
    // 寻找拦路的友军
    let blockingAlly = null;
    let blockingDistance = Infinity;
    
    gameState.units.forEach(unit => {
      if (!unit.isEnemy && unit.hp > 0 && document.getElementById(unit.id)) {
        const distance = calculateDistance(enemy, unit);
        if (distance <= enemy.searchRange && unit.y < enemy.y + 50) {
          blockingDistance = distance;
          blockingAlly = unit;
        }
      }
    });
    
    // 攻击拦路友军或冲向大本营
    if (blockingAlly) {
      enemy.target = blockingAlly;
      const distance = calculateDistance(enemy, blockingAlly);
      
      if (distance <= 50) { // 攻击范围
        enemy.isEngaged = true;
        enemy.element.classList.add('unit-engaged');
        
        if (enemy.attackCooldown <= 0) {
          attackTarget(enemy, blockingAlly);
          enemy.attackCooldown = 10; // 1秒冷却
        } else {
          enemy.attackCooldown--;
        }
      } else {
        moveTowardsTarget(enemy, blockingAlly);
      }
    } else {
      enemy.isEngaged = false;
      enemy.target = null;
      enemy.element.classList.remove('unit-engaged');
      moveTowardsCamp(enemy, battleField);
    }
  } catch (error) {
    console.error('敌人AI失败:', error);
  }
}

/**
 * 友军AI行为（优先攻击敌人）
 * @param {object} ally - 友军数据对象
 */
function allyAIBehavior(ally) {
  try {
    // 寻找最近敌人
    if (!ally.isEngaged) {
      findNearestTarget(ally);
    }
    
    if (ally.target && document.getElementById(ally.target.id)) {
      const distance = calculateDistance(ally, ally.target);
      
      if (distance <= 50) { // 攻击范围
        ally.isEngaged = true;
        ally.element.classList.add('unit-engaged');
        
        if (ally.attackCooldown <= 0) {
          attackTarget(ally, ally.target);
          ally.attackCooldown = 10;
        } else {
          ally.attackCooldown--;
        }
      } else if (distance <= ally.searchRange) { // 寻敌范围
        ally.isEngaged = true;
        ally.element.classList.add('unit-engaged');
        moveTowardsTarget(ally, ally.target);
      } else { // 超出范围，继续巡逻
        ally.isEngaged = false;
        ally.target = null;
        ally.element.classList.remove('unit-engaged');
        moveInOriginalDirection(ally);
      }
    } else {
      ally.isEngaged = false;
      ally.element.classList.remove('unit-engaged');
      moveInOriginalDirection(ally);
      findNearestTarget(ally);
    }
  } catch (error) {
    console.error('友军AI失败:', error);
  }
}

/**
 * 计算两个单位之间的距离
 * @param {object} unitA - 单位A
 * @param {object} unitB - 单位B
 * @returns {number} 距离
 */
function calculateDistance(unitA, unitB) {
  return Math.sqrt(Math.pow(unitA.x - unitB.x, 2) + Math.pow(unitA.y - unitB.y, 2));
}

/**
 * 寻找最近的敌对目标
 * @param {object} unit - 当前单位
 */
function findNearestTarget(unit) {
  let nearestTarget = null;
  let nearestDistance = Infinity;
  
  gameState.units.forEach(target => {
    if (target.id !== unit.id && 
        target.isEnemy !== unit.isEnemy && 
        target.hp > 0 && 
        document.getElementById(target.id)) {
      
      const distance = calculateDistance(unit, target);
      if (distance <= unit.searchRange && distance < nearestDistance) {
        nearestDistance = distance;
        nearestTarget = target;
      }
    }
  });
  
  if (nearestTarget) {
    unit.target = nearestTarget;
  }
}

/**
 * 向目标移动
 * @param {object} unit - 移动单位
 * @param {object} target - 目标单位
 */
function moveTowardsTarget(unit, target) {
  if (!document.getElementById(unit.id) || !document.getElementById(target.id)) return;
  
  const dx = target.x - unit.x;
  const dy = target.y - unit.y;
  const distance = calculateDistance(unit, target);
  
  if (distance === 0) return;
  
  // 归一化移动方向
  const moveX = (dx / distance) * unit.speed;
  const moveY = (dy / distance) * unit.speed;
  
  // 更新位置
  unit.x += moveX;
  unit.y += moveY;
  
  // 更新DOM
  if (unit.isEnemy) {
    unit.element.style.top = `${unit.y}px`;
  } else {
    unit.element.style.bottom = `${window.innerHeight - unit.y - 50}px`;
  }
  unit.element.style.left = `${unit.x}px`;
}

/**
 * 向大本营移动（敌人专用）
 * @param {object} enemy - 敌人单位
 * @param {HTMLElement} battleField - 战场容器
 */
function moveTowardsCamp(enemy, battleField) {
  if (!document.getElementById(enemy.id) || !battleField) return;
  
  const dx = enemy.campTarget.x - enemy.x;
  const dy = enemy.campTarget.y - enemy.y;
  const distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
  
  if (distance === 0) return;
  
  const moveX = (dx / distance) * enemy.speed;
  const moveY = (dy / distance) * enemy.speed;
  
  // 更新位置（限制在战场内）
  enemy.x = Math.max(30, Math.min(battleField.offsetWidth - 30, enemy.x + moveX));
  enemy.y = Math.max(40, Math.min(battleField.offsetHeight - 150, enemy.y + moveY));
  
  // 更新DOM
  enemy.element.style.top = `${enemy.y}px`;
  enemy.element.style.left = `${enemy.x}px`;
}

/**
 * 按原方向移动（巡逻）
 * @param {object} unit - 移动单位
 */
function moveInOriginalDirection(unit) {
  if (!document.getElementById(unit.id)) return;
  
  if (unit.isEnemy) {
    // 敌人向下移动
    unit.y += unit.speed;
    unit.element.style.top = `${unit.y}px`;
    
    if (unit.y > window.innerHeight) {
      removeUnit(unit);
    }
  } else {
    // 友军向上移动
    unit.y -= unit.speed;
    unit.element.style.bottom = `${window.innerHeight - unit.y - 50}px`;
    
    if (unit.y < 0) {
      removeUnit(unit);
    }
  }
}

/**
 * 攻击目标单位
 * @param {object} attacker - 攻击者
 * @param {object} target - 被攻击者
 */
function attackTarget(attacker, target) {
  if (!document.getElementById(attacker.id) || !document.getElementById(target.id) || gameState.gameOver) return;
  
  // 攻击动画
  attacker.element.classList.add('unit-attack');
  setTimeout(() => attacker.element.classList.remove('unit-attack'), 300);
  
  // 造成伤害
  const damage = attacker.attack;
  target.hp -= damage;
  
  // 更新血条
  const targetHpFill = target.element.querySelector('.hp-fill');
  if (targetHpFill) {
    targetHpFill.style.width = `${Math.max(0, (target.hp / target.maxHp) * 100)}%`;
  }
  
  // 显示伤害数值
  showDamageValue(target.element, damage, attacker.isEnemy);
  
  // 战斗日志
  const attackerName = attacker.isEnemy ? attacker.name : (attacker.type === 'soldier' ? '士兵' : '坦克');
  const targetName = target.isEnemy ? target.name : (target.type === 'soldier' ? '士兵' : '坦克');
  addBattleLog(`${attackerName}对${targetName}造成${damage}点伤害`, attacker.isEnemy ? 'text-danger' : 'text-success');
  
  // 目标死亡
  if (target.hp <= 0) {
    if (!target.isEnemy) {
      addBattleLog(`${targetName}被击败了!`, 'text-danger');
    } else {
      // 统计击杀（同步更新剩余积分）
      if (gameState.statData.enemyTypesKilled[target.type] !== undefined) {
        gameState.statData.enemyTypesKilled[target.type]++;
      }
      const killReward = target.killReward || 0;
      gameState.killCount++;
      gameState.battleScore += killReward;
      gameState.remainingScore += killReward; // 剩余积分增加击杀奖励
      
      addBattleLog(`成功击败${targetName}! 获得${killReward}积分`, 'text-success');
      if (elements.battleScore) elements.battleScore.textContent = gameState.battleScore;
      if (elements.remainingScore) elements.remainingScore.textContent = gameState.remainingScore;
    }
    
    // 移除目标
    removeUnit(target);
    
    // 攻击者继续行动
    attacker.isEngaged = false;
    attacker.target = null;
    attacker.element.classList.remove('unit-engaged');
    
    if (attacker.isEnemy) {
      addBattleLog(`${attackerName}继续向大本营进攻!`, 'text-danger');
    }
  }
}

/**
 * 攻击大本营（敌人专用）
 * @param {object} enemy - 敌人单位
 */
function attackCamp(enemy) {
  if (!document.getElementById(enemy.id) || gameState.gameOver) return;
  
  // 攻击动画
  enemy.element.classList.add('unit-attack');
  setTimeout(() => enemy.element.classList.remove('unit-attack'), 300);
  
  // 造成伤害
  const damage = enemy.attack;
  gameState.campHp -= damage;
  if (elements.campHp) elements.campHp.textContent = gameState.campHp;
  
  // 显示伤害数值
  const campElement = document.querySelector('.camp');
  if (campElement) {
    showDamageValue(campElement, damage, true);
  }
  
  // 战斗日志
  addBattleLog(`${enemy.name}攻击了大本营，造成${damage}点伤害！`, 'text-danger');
  
  // 大本营震动
  if (campElement) {
    campElement.classList.add('animate-shake');
    setTimeout(() => campElement.classList.remove('animate-shake'), 500);
  }
  
  // 大本营被摧毁 = 失败
  if (gameState.campHp <= 0) {
    gameState.campHp = 0;
    if (elements.campHp) elements.campHp.textContent = 0;
    gameState.gameOver = true;
    endBattle(false);
  }
}

/**
 * 移除单位（死亡/消失）
 * @param {object} unit - 要移除的单位
 */
function removeUnit(unit) {
  try {
    // 从数组中移除
    gameState.units = gameState.units.filter(u => u.id !== unit.id);
    
    // DOM移除动画
    if (unit.element && unit.element.parentNode) {
      unit.element.style.opacity = 0;
      unit.element.style.transform = 'scale(0.5)';
      setTimeout(() => {
        if (unit.element && unit.element.parentNode) {
          unit.element.parentNode.removeChild(unit.element);
        }
      }, 300);
    }
  } catch (error) {
    console.error('移除单位失败:', error);
  }
}

/**
 * 显示伤害数值浮动效果
 * @param {HTMLElement} targetElement - 目标元素
 * @param {number} damage - 伤害值
 * @param {boolean} isEnemyAttack - 是否是敌人攻击
 */
function showDamageValue(targetElement, damage, isEnemyAttack) {
  try {
    const damageElement = document.createElement('div');
    damageElement.className = `absolute text-${isEnemyAttack ? 'danger' : 'success'} font-bold text-sm`;
    damageElement.textContent = `-${damage}`;
    
    // 定位到目标上方
    const targetRect = targetElement.getBoundingClientRect();
    const fieldRect = document.querySelector('.battle-field').getBoundingClientRect();
    damageElement.style.left = `${targetRect.left - fieldRect.left + targetRect.width/2 - 10}px`;
    damageElement.style.top = `${targetRect.top - fieldRect.top - 20}px`;
    
    if (elements.damageContainer) {
      elements.damageContainer.appendChild(damageElement);
    }
    
    // 浮动消失动画
    setTimeout(() => {
      damageElement.style.opacity = 0;
      damageElement.style.transform = 'translateY(-15px)';
      damageElement.style.transition = 'opacity 0.5s, transform 0.5s';
      
      setTimeout(() => {
        if (damageElement.parentNode) damageElement.parentNode.removeChild(damageElement);
      }, 500);
    }, 10);
  } catch (error) {
    console.error('显示伤害数值失败:', error);
  }
}

/**
 * 添加战斗日志
 * @param {string} message - 日志内容
 * @param {string} className - 文本样式类
 */
function addBattleLog(message, className = 'text-gray-300') {
  try {
    const logItem = document.createElement('div');
    logItem.className = `flex items-start ${className}`;
    logItem.innerHTML = `<i class="fa fa-circle text-xs mt-1.5 mr-1.5 text-gray-500"></i><span>${message}</span>`;
    
    if (elements.battleLog) {
      elements.battleLog.appendChild(logItem);
      elements.battleLog.scrollTop = elements.battleLog.scrollHeight; // 滚动到底部
    }
  } catch (error) {
    console.error('添加日志失败:', error);
  }
}

/**
 * 结束战斗（显示结算）
 * @param {boolean} isWin - 是否胜利
 */
function endBattle(isWin) {
  gameState.gameOver = true;
  
  // 清除所有计时器
  if (gameState.battleTimer) clearInterval(gameState.battleTimer);
  if (gameState.enemySpawnTimer) clearInterval(gameState.enemySpawnTimer);
  if (gameState.countdownTimer) clearInterval(gameState.countdownTimer);
  
  // 停止所有单位
  gameState.units.forEach(unit => {
    if (unit.element && unit.element.parentNode) {
      unit.element.style.pointerEvents = 'none';
    }
  });
  
  // 计算战斗数据（同步剩余积分）
  const battleMinutes = Math.floor(gameState.battleTime / 60).toString().padStart(2, '0');
  const battleSeconds = (gameState.battleTime % 60).toString().padStart(2, '0');
  const battleTimeFormatted = `${battleMinutes}:${battleSeconds}`;
  
  // 计算击杀奖励
  let totalKillReward = 0;
  Object.keys(gameState.statData.enemyTypesKilled).forEach(type => {
    totalKillReward += gameState.statData.enemyTypesKilled[type] * (unitConfigs[type]?.killReward || 0);
  });
  
  const winBonus = isWin ? 50 : 0;
  const finalScore = gameState.battleScore + winBonus;
  gameState.remainingScore = finalScore; // 战斗结束后剩余积分=最终积分
  
  // 更新战绩
  if (isWin) {
    gameState.winCount++;
    gameState.battleScore = finalScore;
    if (elements.remainingScore) elements.remainingScore.textContent = gameState.remainingScore;
  } else {
    gameState.loseCount++;
  }
  
  // 更新用户信息
  updateUserInfo();
  
  // 填充结算数据
  fillSettlementData(isWin, battleTimeFormatted, totalKillReward, winBonus, finalScore);
  
  // 显示结算弹窗
  setTimeout(() => {
    if (elements.battleResult) elements.battleResult.classList.remove('hidden');
  }, 1000);
}

/**
 * 填充结算弹窗数据
 * @param {boolean} isWin - 是否胜利
 * @param {string} battleTime - 战斗时长
 * @param {number} killReward - 击杀奖励
 * @param {number} winBonus - 胜利奖励
 * @param {number} finalScore - 最终积分
 */
function fillSettlementData(isWin, battleTime, killReward, winBonus, finalScore) {
  try {
    if (isWin) {
      // 胜利样式
      if (elements.resultIconContainer) {
        elements.resultIconContainer.className = 'w-24 h-24 rounded-full mx-auto mb-4 border-4 border-success bg-success/20 flex items-center justify-center border-glow-win';
      }
      if (elements.resultIcon) elements.resultIcon.className = 'fa fa-trophy text-4xl text-success';
      if (elements.resultTitle) {
        elements.resultTitle.className = 'text-2xl font-bold text-success mb-2';
        elements.resultTitle.textContent = '战斗胜利!';
      }
      if (elements.resultDesc) elements.resultDesc.textContent = `坚守${battleTime}！成功守护大本营`;
      if (elements.playAgainBtn) elements.playAgainBtn.className = 'flex-1 bg-success hover:bg-success/90 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300';
      
      // 显示奖励
      if (elements.rewardSection) elements.rewardSection.classList.remove('hidden');
      if (elements.rewardBase) elements.rewardBase.textContent = `+${winBonus}`;
      if (elements.rewardKills) elements.rewardKills.textContent = `+${killReward}`;
      if (elements.rewardTotal) elements.rewardTotal.textContent = `+${finalScore - 100}`; // 减去初始100积分
    } else {
      // 失败样式
      if (elements.resultIconContainer) {
        elements.resultIconContainer.className = 'w-24 h-24 rounded-full mx-auto mb-4 border-4 border-danger bg-danger/20 flex items-center justify-center border-glow-lose';
      }
      if (elements.resultIcon) elements.resultIcon.className = 'fa fa-times-circle text-4xl text-danger';
      if (elements.resultTitle) {
        elements.resultTitle.className = 'text-2xl font-bold text-danger mb-2';
        elements.resultTitle.textContent = '战斗失败';
      }
      if (elements.resultDesc) elements.resultDesc.textContent = `大本营被摧毁，战斗时长${battleTime}`;
      if (elements.playAgainBtn) elements.playAgainBtn.className = 'flex-1 bg-danger hover:bg-danger/90 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300';
      
      // 隐藏奖励
      if (elements.rewardSection) elements.rewardSection.classList.add('hidden');
    }
    
    // 填充统计数据
    if (elements.statKills) elements.statKills.textContent = gameState.killCount;
    if (elements.statCampHp) elements.statCampHp.textContent = `${gameState.campHp}/${200}`;
    if (elements.statTime) elements.statTime.textContent = battleTime;
    if (elements.statSummoned) elements.statSummoned.textContent = gameState.statData.summonedUnits;
  } catch (error) {
    console.error('填充结算数据失败:', error);
  }
}