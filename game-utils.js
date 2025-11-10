/**
 * 页面切换函数
 */
function switchPage(fromPage, toPage) {
  try {
    const fromEl = elements[`${fromPage}Page`];
    const toEl = elements[`${toPage}Page`];
    
    if (!fromEl || !toEl) return;
    
    fromEl.classList.add('hidden');
    fromEl.style.opacity = 0;
    
    setTimeout(() => {
      toEl.classList.remove('hidden');
      setTimeout(() => {
        toEl.style.opacity = 1;
        gameState.currentPage = toPage;
        
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
 */
function generateRandomId() {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * 计算胜率
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
    const avatarIcons = ['fa-user', 'fa-robot', 'fa-alien', 'fa-star'];
    const avatarColors = ['text-primary', 'text-secondary', 'text-warning', 'text-danger'];
    const avatarBgColors = ['bg-primary/20', 'bg-secondary/20', 'bg-warning/20', 'bg-danger/20'];
    const avatarBorderColors = ['border-primary', 'border-secondary', 'border-warning', 'border-danger'];
    
    let avatarIndex = parseInt(gameState.userAvatar) - 1;
    avatarIndex = Math.max(0, Math.min(3, avatarIndex));
    
    if (elements.userAvatar) {
      elements.userAvatar.className = `w-16 h-16 rounded-full ${avatarBgColors[avatarIndex]} border-2 ${avatarBorderColors[avatarIndex]} flex items-center justify-center mr-4`;
      elements.userAvatar.innerHTML = `<i class="fa ${avatarIcons[avatarIndex]} text-2xl ${avatarColors[avatarIndex]}"></i>`;
    }
    
    if (elements.battleUserAvatar) {
      elements.battleUserAvatar.className = `w-10 h-10 rounded-full ${avatarBgColors[avatarIndex]} border-2 ${avatarBorderColors[avatarIndex]} flex items-center justify-center mr-2`;
      elements.battleUserAvatar.innerHTML = `<i class="fa ${avatarIcons[avatarIndex]} text-lg ${avatarColors[avatarIndex]}"></i>`;
    }
    
    if (elements.userName) elements.userName.textContent = gameState.userName || '星际战士';
    if (elements.userId) elements.userId.textContent = gameState.userId || '888888';
    if (elements.winCount) elements.winCount.textContent = gameState.winCount;
    if (elements.loseCount) elements.loseCount.textContent = gameState.loseCount;
    if (elements.winRate) elements.winRate.textContent = calculateWinRate();
    if (elements.battleUserName) elements.battleUserName.textContent = gameState.userName || '星际战士';
  } catch (error) {
    console.error('更新用户信息失败:', error);
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
    gameState.battleTime = 0;
    gameState.battleScore = 100;
    gameState.remainingScore = 100;
    gameState.campHp = 200;
    gameState.killCount = 0;
    gameState.units = [];
    gameState.remainingTime = 60;
    gameState.gameOver = false;
    gameState.statData = {
      summonedUnits: 0,
      enemyTypesKilled: { enemy1: 0, enemy2: 0, enemy3: 0, enemy4: 0 }
    };
    
    const battleField = document.querySelector('.battle-field');
    if (battleField) {
      document.querySelectorAll('.unit').forEach(unit => {
        if (unit.parentNode === battleField) unit.remove();
      });
    }
    
    if (elements.battleScore) elements.battleScore.textContent = gameState.battleScore;
    if (elements.remainingScore) elements.remainingScore.textContent = gameState.remainingScore;
    if (elements.campHp) elements.campHp.textContent = gameState.campHp;
    if (elements.battleLog) elements.battleLog.innerHTML = '';
    if (elements.battleResult) elements.battleResult.classList.add('hidden');
    if (elements.countdownContainer) elements.countdownContainer.classList.remove('countdown-warning');
    
    if (gameState.battleTimer) clearInterval(gameState.battleTimer);
    if (gameState.enemySpawnTimer) clearInterval(gameState.enemySpawnTimer);
    if (gameState.countdownTimer) clearInterval(gameState.countdownTimer);
    
    gameState.battleTimer = setInterval(() => gameState.battleTime++, 1000);
    startCountdown();
    startEnemySpawn();
    
    addBattleLog('战斗开始! 敌人全力进攻大本营，坚守1分钟!', 'text-gray-300');
    addBattleLog('新增飞行敌人「无人机」，士兵可攻击飞行单位，坦克仅攻击地面单位!', 'text-warning');
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
    
    if (gameState.remainingTime <= 0) {
      clearInterval(gameState.countdownTimer);
      endBattle(true);
    }
    
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
 * 开始生成敌人（新增飞行敌人随机生成）
 */
function startEnemySpawn() {
  // 初始生成2个地面敌人
  spawnEnemy(['enemy1', 'enemy2']);
  
  // 后续每隔1.5-2.5秒随机生成敌人（包含飞行敌人）
  gameState.enemySpawnTimer = setInterval(() => {
    if (gameState.gameOver) {
      clearInterval(gameState.enemySpawnTimer);
      return;
    }
    
    // 敌人类型池（包含飞行敌人enemy4）
    const enemyTypes = ['enemy1', 'enemy2', 'enemy3', 'enemy4'];
    // 随机选择1个敌人生成
    const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    spawnEnemy([randomType]);
  }, Math.random() * 1000 + 1500);
}

/**
 * 生成单个/多个敌人（支持飞行敌人样式）
 * @param {Array} enemyTypeList - 要生成的敌人类型列表
 */
function spawnEnemy(enemyTypeList) {
  try {
    const battleField = document.querySelector('.battle-field');
    if (!battleField) return;
    
    const fieldWidth = battleField.offsetWidth;
    
    enemyTypeList.forEach(type => {
      const config = unitConfigs[type];
      if (!config) return;
      
      // 随机生成x坐标（战场顶部）
      const x = Math.random() * (fieldWidth - 60) + 30;
      
      // 创建敌人元素（新增is-flying类标识飞行单位）
      const enemyId = generateRandomId();
      const enemyElement = document.createElement('div');
      enemyElement.id = enemyId;
      enemyElement.className = `unit bg-${config.color}/20 border-2 border-${config.color} animate-spawn ${config.isFlying ? 'is-flying' : ''}`;
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
      
      // 获取大本营位置
      const campElement = document.querySelector('.camp');
      const campRect = campElement.getBoundingClientRect();
      const fieldRect = battleField.getBoundingClientRect();
      const campX = campRect.left - fieldRect.left + campRect.width / 2;
      const campY = campRect.top - fieldRect.top + campRect.height / 2;
      
      // 存储敌人数据（包含飞行属性、攻击距离）
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
        attackRange: config.attackRange, // 攻击距离
        isFlying: config.isFlying,       // 飞行属性
        isEnemy: true,
        element: enemyElement,
        isEngaged: false,
        target: null,
        attackCooldown: 0,
        searchRange: 200,
        campTarget: { x: campX, y: campY },
        killReward: config.killReward
      };
      
      gameState.units.push(enemy);
      // 飞行敌人特殊提示
      const spawnTip = config.isFlying 
        ? `飞行敌人「${config.name}」出现！` 
        : `敌人「${config.name}」发起进攻！`;
      addBattleLog(spawnTip, config.isFlying ? 'text-secondary' : 'text-danger');
      
      // 启动敌人AI
      startUnitAI(enemy);
    });
  } catch (error) {
    console.error('生成敌人失败:', error);
  }
}

/**
 * 召唤友军单位（士兵/坦克）- 点击一次触发单次召唤
 * @param {string} unitType - 单位类型（soldier/tank）
 */
function summonUnit(unitType) {
  if (gameState.gameOver) return;
  
  const config = unitConfigs[unitType];
  if (!config) return;
  
  // 积分不足判断（仅需单次召唤成本）
  if (gameState.battleScore < config.cost) {
    addBattleLog(`积分不足，无法召唤${config.name}（需要${config.cost}积分）`, 'text-warning');
    return;
  }
  
  try {
    // 扣除单次召唤积分
    gameState.battleScore -= config.cost;
    gameState.remainingScore -= config.cost;
    if (elements.battleScore) elements.battleScore.textContent = gameState.battleScore;
    if (elements.remainingScore) elements.remainingScore.textContent = gameState.remainingScore;
    
    gameState.statData.summonedUnits++; // 统计+1（单次召唤）
    
    const campElement = document.querySelector('.camp');
    const battleField = document.querySelector('.battle-field');
    if (!campElement || !battleField) return;
    
    const campRect = campElement.getBoundingClientRect();
    const fieldRect = battleField.getBoundingClientRect();
    
    // 随机左右生成（大本营两侧，无偏移）
    const isLeft = Math.random() > 0.5;
    const x = isLeft 
      ? campRect.left - fieldRect.left - 60 
      : campRect.right - fieldRect.left + 10;
    
    // 创建友军元素
    const unitId = generateRandomId();
    const unitElement = document.createElement('div');
    unitElement.id = unitId;
    unitElement.className = `unit bg-${config.color}/20 border-2 border-${config.color} animate-spawn`;
    unitElement.style.left = `${x}px`;
    unitElement.style.bottom = '120px'; // 底部生成
    
    // 友军内容（图标+血条）
    unitElement.innerHTML = `
      <i class="fa ${config.icon} text-xl text-${config.color}"></i>
      <div class="hp-bar">
        <div class="hp-fill bg-${config.color}" style="width: 100%"></div>
      </div>
    `;
    
    battleField.appendChild(unitElement);
    
    // 存储友军数据（包含攻击距离、飞行攻击权限）
    const unit = {
      id: unitId,
      type: config.type,
      name: config.name,
      x,
      y: battleField.offsetHeight - 170,
      hp: config.hp,
      maxHp: config.hp,
      attack: config.attack,
      speed: config.speed,
      attackRange: config.attackRange, // 攻击距离（坦克>士兵）
      isFlying: config.isFlying,
      canAttackFlying: config.canAttackFlying, // 是否可攻击飞行单位
      isEnemy: false,
      element: unitElement,
      isEngaged: false,
      target: null,
      attackCooldown: 0,
      searchRange: config.searchRange
    };
    
    gameState.units.push(unit);
    
    // 召唤提示（还原单次召唤文案）
    const unitTip = unitType === 'soldier'
      ? `召唤${config.name}！可攻击地面和飞行敌人，攻击距离${config.attackRange}px`
      : `召唤${config.name}！仅攻击地面敌人，攻击距离${config.attackRange}px（更远）`;
    addBattleLog(unitTip, 'text-success');
    
    // 启动友军AI
    startUnitAI(unit);
  } catch (error) {
    console.error('召唤单位失败:', error);
    // 恢复单次召唤积分
    gameState.battleScore += config.cost;
    gameState.remainingScore += config.cost;
    if (elements.battleScore) elements.battleScore.textContent = gameState.battleScore;
    if (elements.remainingScore) elements.remainingScore.textContent = gameState.remainingScore;
    addBattleLog(`召唤${config.name}失败，请重试`, 'text-danger');
  }
}

/**
 * 启动单位AI（核心逻辑：索敌+移动+攻击）
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
    
    // 友军AI vs 敌人AI
    unit.isEnemy ? enemyAIBehavior(unit) : allyAIBehavior(unit);
  }, 100);
}

/**
 * 敌人AI行为（向大本营移动，攻击范围内的友军）
 * @param {object} enemy - 敌人数据对象
 */
function enemyAIBehavior(enemy) {
  try {
    const campElement = document.querySelector('.camp');
    const battleField = document.querySelector('.battle-field');
    if (!campElement || !battleField) return;
    
    // 1. 寻找攻击范围内的友军目标
    let target = findTargetInRange(enemy, gameState.units.filter(u => !u.isEnemy));
    
    if (target) {
      enemy.isEngaged = true;
      // 2. 在攻击范围内：发起攻击
      if (calculateDistance(enemy, target) <= enemy.attackRange) {
        attackUnit(enemy, target);
      } else {
        // 3. 不在攻击范围内：向目标移动
        moveTowardsTarget(enemy, target);
      }
    } else {
      // 4. 无目标：向大本营移动
      enemy.isEngaged = false;
      const campRect = campElement.getBoundingClientRect();
      const fieldRect = battleField.getBoundingClientRect();
      const campX = campRect.left - fieldRect.left + campRect.width / 2;
      const campY = campRect.top - fieldRect.top + campRect.height / 2;
      moveTowardsPoint(enemy, campX, campY);
    }
  } catch (error) {
    console.error('敌人AI失败:', error);
  }
}

/**
 * 友军AI行为（寻找敌人，根据自身特性攻击）
 * @param {object} ally - 友军数据对象（士兵/坦克）
 */
function allyAIBehavior(ally) {
  try {
    const battleField = document.querySelector('.battle-field');
    if (!battleField) return;
    
    // 1. 根据友军特性筛选目标：坦克仅地面敌人，士兵全类型
    let availableTargets = gameState.units.filter(u => u.isEnemy);
    if (!ally.canAttackFlying) {
      availableTargets = availableTargets.filter(u => !u.isFlying); // 坦克过滤飞行敌人
    }
    
    // 2. 寻找攻击范围内的目标
    let target = findTargetInRange(ally, availableTargets);
    
    if (target) {
      ally.isEngaged = true;
      // 3. 在攻击范围内：发起攻击
      if (calculateDistance(ally, target) <= ally.attackRange) {
        attackUnit(ally, target);
      } else {
        // 4. 不在攻击范围内：向目标移动
        moveTowardsTarget(ally, target);
      }
    } else {
      // 5. 无目标：巡逻（上下移动）
      ally.isEngaged = false;
      if (ally.y < battleField.offsetHeight / 2) {
        ally.y += ally.speed;
      } else {
        ally.y -= ally.speed;
      }
      ally.element.style.bottom = `${window.innerHeight - ally.y - 50}px`;
    }
  } catch (error) {
    console.error('友军AI失败:', error);
  }
}

/**
 * 在攻击范围内寻找最近的目标
 * @param {object} attacker - 攻击者
 * @param {Array} targets - 候选目标列表
 * @returns {object|null} 最近的目标
 */
function findTargetInRange(attacker, targets) {
  let nearestTarget = null;
  let nearestDistance = Infinity;
  
  targets.forEach(target => {
    if (target.hp <= 0 || !document.getElementById(target.id)) return;
    
    const distance = calculateDistance(attacker, target);
    // 目标在索敌范围内，且距离最近
    if (distance <= attacker.searchRange && distance < nearestDistance) {
      nearestDistance = distance;
      nearestTarget = target;
    }
  });
  
  return nearestTarget;
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
 * 向目标单位移动
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
 * 向指定坐标点移动
 * @param {object} unit - 移动单位
 * @param {number} targetX - 目标X坐标
 * @param {number} targetY - 目标Y坐标
 */
function moveTowardsPoint(unit, targetX, targetY) {
  if (!document.getElementById(unit.id)) return;
  
  const dx = targetX - unit.x;
  const dy = targetY - unit.y;
  const distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
  
  if (distance === 0) return;
  
  // 归一化移动方向
  const moveX = (dx / distance) * unit.speed;
  const moveY = (dy / distance) * unit.speed;
  
  // 更新位置
  unit.x += moveX;
  unit.y += moveY;
  
  // 更新DOM
  unit.element.style.top = `${unit.y}px`;
  unit.element.style.left = `${unit.x}px`;
}

/**
 * 单位攻击逻辑（带攻击冷却）
 * @param {object} attacker - 攻击者
 * @param {object} target - 被攻击者
 */
function attackUnit(attacker, target) {
  if (!document.getElementById(attacker.id) || !document.getElementById(target.id) || gameState.gameOver) return;
  
  // 攻击冷却（1秒冷却）
  if (attacker.attackCooldown > 0) {
    attacker.attackCooldown--;
    return;
  }
  
  // 攻击动画
  attacker.element.classList.add('unit-attack');
  setTimeout(() => attacker.element.classList.remove('unit-attack'), 300);
  
  // 造成伤害
  target.hp -= attacker.attack;
  target.hp = Math.max(0, target.hp); // 血量不低于0
  
  // 更新目标血条
  const targetHpFill = target.element.querySelector('.hp-fill');
  if (targetHpFill) {
    const hpPercent = (target.hp / target.maxHp) * 100;
    targetHpFill.style.width = `${hpPercent}%`;
  }
  
  // 显示伤害数值
  showDamageValue(target.element, attacker.attack, attacker.isEnemy);
  
  // 战斗日志
  const attackTip = attacker.isEnemy
    ? `敌人「${attacker.name}」对「${target.name}」造成${attacker.attack}点伤害！`
    : `「${attacker.name}」对${target.isFlying ? '飞行敌人' : '敌人'}「${target.name}」造成${attacker.attack}点伤害！`;
  addBattleLog(attackTip, attacker.isEnemy ? 'text-danger' : 'text-success');
  
  // 目标死亡处理
  if (target.hp <= 0) {
    if (target.isEnemy) {
      // 友军击杀敌人：获得积分
      gameState.killCount++;
      gameState.battleScore += target.killReward;
      gameState.remainingScore += target.killReward;
      if (elements.battleScore) elements.battleScore.textContent = gameState.battleScore;
      if (elements.remainingScore) elements.remainingScore.textContent = gameState.remainingScore;
      
      gameState.statData.enemyTypesKilled[target.type] = (gameState.statData.enemyTypesKilled[target.type] || 0) + 1;
      addBattleLog(`成功击杀${target.isFlying ? '飞行敌人' : '敌人'}「${target.name}」，获得${target.killReward}积分！`, 'text-success');
    } else {
      // 敌人击杀友军
      addBattleLog(`「${target.name}」被${target.isFlying ? '飞行敌人' : '敌人'}「${attacker.name}」击败！`, 'text-danger');
    }
    removeUnit(target);
  }
  
  // 重置攻击冷却
  attacker.attackCooldown = 10; // 10个AI周期（1秒）
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
      elements.battleLog.scrollTop = elements.battleLog.scrollHeight;
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
  
  // 计算战斗数据
  const battleMinutes = Math.floor(gameState.battleTime / 60).toString().padStart(2, '0');
  const battleSeconds = (gameState.battleTime % 60).toString().padStart(2, '0');
  const battleTimeFormatted = `${battleMinutes}:${battleSeconds}`;
  
  let totalKillReward = 0;
  Object.keys(gameState.statData.enemyTypesKilled).forEach(type => {
    totalKillReward += gameState.statData.enemyTypesKilled[type] * (unitConfigs[type]?.killReward || 0);
  });
  
  const winBonus = isWin ? 50 : 0;
  const finalScore = gameState.battleScore + winBonus;
  gameState.remainingScore = finalScore;
  
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
      
      if (elements.rewardSection) elements.rewardSection.classList.remove('hidden');
      if (elements.rewardBase) elements.rewardBase.textContent = `+${winBonus}`;
      if (elements.rewardKills) elements.rewardKills.textContent = `+${killReward}`;
      if (elements.rewardTotal) elements.rewardTotal.textContent = `+${finalScore - 100}`;
    } else {
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
      
      if (elements.rewardSection) elements.rewardSection.classList.add('hidden');
    }
    
    // 填充统计数据（包含飞行敌人击杀数）
    if (elements.statKills) elements.statKills.textContent = gameState.killCount;
    if (elements.statCampHp) elements.statCampHp.textContent = `${gameState.campHp}/${200}`;
    if (elements.statTime) elements.statTime.textContent = battleTime;
    if (elements.statSummoned) elements.statSummoned.textContent = gameState.statData.summonedUnits;
  } catch (error) {
    console.error('填充结算数据失败:', error);
  }
}

// 页面加载完成后绑定事件
window.addEventListener('load', bindEvents);