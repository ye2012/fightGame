// 全局DOM元素缓存
const elements = {
    // 页面容器
    loginPage: document.getElementById('login-page'),
    userPage: document.getElementById('user-page'),
    battlePage: document.getElementById('battle-page'),
    
    // 登录页面
    guestLoginBtn: document.getElementById('guest-login'),
    avatarOptions: document.querySelectorAll('.avatar-option'),
    
    // 个人中心
    userAvatar: document.getElementById('user-avatar'),
    userName: document.getElementById('user-name'),
    userId: document.getElementById('user-id'),
    winCount: document.getElementById('win-count'),
    loseCount: document.getElementById('lose-count'),
    winRate: document.getElementById('win-rate'),
    startGameBtn: document.getElementById('start-game'),
    logoutBtn: document.getElementById('logout-btn'),
    
    // 战斗页面
    battleUserAvatar: document.getElementById('battle-user-avatar'),
    battleUserName: document.getElementById('battle-user-name'),
    battleScore: document.getElementById('battle-score'),
    remainingScore: document.getElementById('remaining-score'),
    campHp: document.getElementById('camp-hp'),
    campHpFill: document.getElementById('camp-hp-fill'),
    battleLog: document.getElementById('battle-log'),
    damageContainer: document.getElementById('damage-container'),
    countdownText: document.getElementById('countdown-text'),
    backToUserBtn: document.getElementById('back-to-user'),
    summonSoldierBtn: document.getElementById('summon-soldier'),
    summonTankBtn: document.getElementById('summon-tank'),
    summonArcherBtn: document.getElementById('summon-archer'),
    summonMageBtn: document.getElementById('summon-mage'),
    summonKnightBtn: document.getElementById('summon-knight'),
    
    // 结算弹窗
    battleResult: document.getElementById('battle-result'),
    resultIconContainer: document.getElementById('result-icon-container'),
    resultIcon: document.getElementById('result-icon'),
    resultTitle: document.getElementById('result-title'),
    resultDesc: document.getElementById('result-desc'),
    rewardSection: document.getElementById('reward-section'),
    rewardBase: document.getElementById('reward-base'),
    rewardKills: document.getElementById('reward-kills'),
    rewardTotal: document.getElementById('reward-total'),
    statKills: document.getElementById('stat-kills'),
    statCampHp: document.getElementById('stat-camp-hp'),
    statTime: document.getElementById('stat-time'),
    statSummoned: document.getElementById('stat-summoned'),
    statEnemyTypes: document.getElementById('stat-enemy-types'), // 新增：敌人类型击杀统计
    backToUserFromResult: document.getElementById('back-to-user-from-result'),
    playAgainBtn: document.getElementById('play-again')
};

/**
 * 页面切换函数
 */
function switchPage(fromPage, toPage) {
    try {
        const fromEl = elements[`${fromPage}Page`];
        const toEl = elements[`${toPage}Page`];
        
        if (!fromEl || !toEl) return;
        
        fromEl.classList.add('hidden');
        toEl.classList.remove('hidden');
        gameState.currentPage = toPage;
        
        // 切换到战斗页面时初始化战斗
        if (toPage === 'battle') {
            initBattle();
        }
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
        if (elements.battleUserName) elements.battleUserName.textContent = gameState.userName || '星际战士';
        if (elements.userId) elements.userId.textContent = `ID: ${Math.floor(Math.random() * 1000000)}`;
        if (elements.winCount) elements.winCount.textContent = gameState.winCount;
        if (elements.loseCount) elements.loseCount.textContent = gameState.loseCount;
        if (elements.winRate) elements.winRate.textContent = calculateWinRate();
    } catch (error) {
        console.error('更新用户信息失败:', error);
    }
}

/**
 * 初始化战斗
 */
function initBattle() {
    try {
        // 重置战斗状态
        gameState.battleScore = 100;
        gameState.remainingScore = 100;
        gameState.campHp = 200;
        gameState.killCount = 0;
        gameState.units = [];
        gameState.remainingTime = 60;
        gameState.gameOver = false;
        gameState.statData = {
            summonedUnits: 0,
            enemyTypesKilled: { 
                enemy1: 0, // 侦察兵
                enemy2: 0, // 突击手
                enemy3: 0, // 重装兵
                enemy4: 0  // 无人机
            },
            totalDamageDealt: 0, // 新增：总伤害统计
            allyLossCount: 0     // 新增：友军损失数量
        };
        
        // 清除旧计时器
        if (gameState.battleTimer) clearInterval(gameState.battleTimer);
        if (gameState.enemySpawnTimer) clearInterval(gameState.enemySpawnTimer);
        if (gameState.countdownTimer) clearInterval(gameState.countdownTimer);
        
        // 清空战场
        const battleField = document.querySelector('.battle-field');
        if (battleField) {
            document.querySelectorAll('.unit, .aoe-effect, .damage-value').forEach(el => el.remove());
        }
        
        // 更新UI
        if (elements.battleScore) elements.battleScore.textContent = gameState.battleScore;
        if (elements.remainingScore) elements.remainingScore.textContent = gameState.remainingScore;
        if (elements.campHp) elements.campHp.textContent = gameState.campHp;
        if (elements.campHpFill) elements.campHpFill.style.width = '100%';
        if (elements.battleLog) elements.battleLog.innerHTML = '';
        if (elements.battleResult) elements.battleResult.classList.add('hidden');
        if (elements.countdownText) {
            elements.countdownText.textContent = '01:00';
            elements.countdownText.classList.remove('text-red-500');
        }
        
        // 启动计时器
        gameState.battleTimer = setInterval(() => gameState.battleTime++, 1000);
        startCountdown();
        startEnemySpawn();
        
        // 战斗日志
        addBattleLog('战斗开始! 抵御敌人进攻，守护大本营60秒!', 'text-gray-300');
        addBattleLog('士兵(10积分)：均衡全能 | 坦克(30积分)：肉盾远程 | 弓箭手(15积分)：克制飞行', 'text-gray-300');
        addBattleLog('法师(25积分)：AOE伤害 | 骑士(20积分)：高速突击', 'text-gray-300');
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
            console.log("game is over le");
            clearInterval(gameState.countdownTimer);
            return;
        }
        
        gameState.remainingTime--;
        const minutes = Math.floor(gameState.remainingTime / 60).toString().padStart(2, '0');
        const seconds = (gameState.remainingTime % 60).toString().padStart(2, '0');
        elements.countdownText.textContent = `${minutes}:${seconds}`;
        
        // 时间结束胜利
        if (gameState.remainingTime <= 0) {
            clearInterval(gameState.countdownTimer);
            endBattle(true);
        }
        
        // 最后10秒警告
        if (gameState.remainingTime === 10) {
            elements.countdownText.classList.add('text-red-500');
            addBattleLog('倒计时10秒！坚持住！', 'text-warning');
        }
    }, 1000);
}

/**
 * 开始生成敌人
 */
function startEnemySpawn() {
    // 初始生成2个地面敌人
    spawnEnemy(['enemy1', 'enemy2']);
    
    // 后续随机生成敌人（包含飞行敌人）
    gameState.enemySpawnTimer = setInterval(() => {
        if (gameState.gameOver) {
            clearInterval(gameState.enemySpawnTimer);
            return;
        }
        
        const enemyTypes = ['enemy1', 'enemy2', 'enemy3', 'enemy4'];
        const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        spawnEnemy([randomType]);
    }, Math.random() * 1000 + 1500);
}

/**
 * 生成敌人
 */
function spawnEnemy(enemyTypeList) {
    try {
        const battleField = document.querySelector('.battle-field');
        if (!battleField) return;
        
        const fieldWidth = battleField.offsetWidth;
        const campElement = document.querySelector('.camp');
        const campRect = campElement.getBoundingClientRect();
        const fieldRect = battleField.getBoundingClientRect();
        const campX = campRect.left - fieldRect.left + campRect.width / 2;
        const campY = campRect.top - fieldRect.top + campRect.height / 2;
        
        enemyTypeList.forEach(type => {
            const config = unitConfigs[type];
            if (!config) return;
            
            // 随机x坐标（避免超出屏幕）
            const x = Math.random() * (fieldWidth - 80) + 40;
            
            // 创建敌人元素
            const enemyId = generateRandomId();
            const enemyElement = document.createElement('div');
            enemyElement.id = enemyId;
            enemyElement.className = `unit bg-${config.color}/20 border-2 border-${config.color} ${config.isFlying ? 'is-flying' : ''}`;
            enemyElement.style.left = `${x}px`;
            enemyElement.style.top = '40px';
            
            enemyElement.innerHTML = `
                <i class="fa ${config.icon} text-xl text-${config.color}"></i>
                <div class="hp-bar">
                    <div class="hp-fill bg-${config.color}" style="width: 100%"></div>
                </div>
            `;
            
            battleField.appendChild(enemyElement);
            
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
                attackRange: config.attackRange,
                isFlying: config.isFlying,
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
            addBattleLog(`${config.isFlying ? '飞行敌人' : '敌人'}「${config.name}」出现！`, config.isFlying ? 'text-secondary' : 'text-danger');
            
            // 启动AI
            startUnitAI(enemy);
        });
    } catch (error) {
        console.error('生成敌人失败:', error);
    }
}

/**
 * 召唤友军单位
 */
function summonUnit(unitType) {
    if (gameState.gameOver) return;
    
    const config = unitConfigs[unitType];
    if (!config) return;
    
    // 积分不足
    if (gameState.battleScore < config.cost) {
        addBattleLog(`积分不足，无法召唤${config.name}（需要${config.cost}积分）`, 'text-warning');
        return;
    }
    
    try {
        // 扣除积分
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
        
        // 随机左右生成（错开位置）
        const isLeft = Math.random() > 0.5;
        const offset = Math.random() * 40;
        const x = isLeft 
            ? campRect.left - fieldRect.left - 60 - offset 
            : campRect.right - fieldRect.left + 10 + offset;
        
        // 创建友军元素
        const unitId = generateRandomId();
        const unitElement = document.createElement('div');
        unitElement.id = unitId;
        unitElement.className = `unit bg-${config.color}/20 border-2 border-${config.color}`;
        unitElement.style.left = `${x}px`;
        unitElement.style.bottom = '120px';
        
        unitElement.innerHTML = `
            <i class="fa ${config.icon} text-xl text-${config.color}"></i>
            <div class="hp-bar">
                <div class="hp-fill bg-${config.color}" style="width: 100%"></div>
            </div>
        `;
        
        battleField.appendChild(unitElement);
        
        // 存储友军数据
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
            attackRange: config.attackRange,
            isFlying: config.isFlying,
            canAttackFlying: config.canAttackFlying,
            isAOE: config.isAOE || false,
            aoeRange: config.aoeRange || 0,
            isEnemy: false,
            element: unitElement,
            isEngaged: false,
            target: null,
            attackCooldown: 0,
            searchRange: config.searchRange
        };
        
        gameState.units.push(unit);
        addBattleLog(`召唤${config.name}！${config.desc}（攻击距离${config.attackRange}px）`, `text-${config.color}`);
        
        // 启动AI
        startUnitAI(unit);
    } catch (error) {
        console.error('召唤单位失败:', error);
        // 恢复积分
        gameState.battleScore += config.cost;
        gameState.remainingScore += config.cost;
        if (elements.battleScore) elements.battleScore.textContent = gameState.battleScore;
        if (elements.remainingScore) elements.remainingScore.textContent = gameState.remainingScore;
        addBattleLog(`召唤${config.name}失败，请重试`, 'text-danger');
    }
}

/**
 * 启动单位AI
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
 * 敌人AI行为
 */
function enemyAIBehavior(enemy) {
    try {
        const campElement = document.querySelector('.camp');
        if (!campElement) return;
        
        // 寻找攻击范围内的友军
        let target = findTargetInRange(enemy, gameState.units.filter(u => !u.isEnemy));
        
        if (target) {
            enemy.isEngaged = true;
            if (calculateDistance(enemy, target) <= enemy.attackRange) {
                attackUnit(enemy, target);
            } else {
                moveTowardsTarget(enemy, target);
            }
        } else {
            // 无目标时攻击大本营
            enemy.isEngaged = false;
            const campRect = campElement.getBoundingClientRect();
            const fieldRect = document.querySelector('.battle-field').getBoundingClientRect();
            const campX = campRect.left - fieldRect.left + campRect.width / 2;
            const campY = campRect.top - fieldRect.top + campRect.height / 2;
            
            // 敌人到达大本营攻击范围
            if (calculateDistance(enemy, { x: campX, y: campY }) <= enemy.attackRange) {
                attackCamp(enemy);
            } else {
                moveTowardsPoint(enemy, campX, campY);
            }
        }
    } catch (error) {
        console.error('敌人AI失败:', error);
    }
}

/**
 * 友军AI行为
 */
function allyAIBehavior(ally) {
    try {
        const battleField = document.querySelector('.battle-field');
        if (!battleField) return;
        
        // 筛选可用目标
        let availableTargets = gameState.units.filter(u => u.isEnemy && u.hp > 0);
        
        // 坦克/骑士仅攻击地面敌人
        if (!ally.canAttackFlying) {
            availableTargets = availableTargets.filter(u => !u.isFlying);
        }
        
        // 弓箭手优先攻击飞行敌人
        if (ally.type === 'archer') {
            const flyingTargets = availableTargets.filter(u => u.isFlying);
            if (flyingTargets.length > 0) {
                availableTargets = flyingTargets;
            }
        }
        
        // 骑士优先攻击距离大本营最近的敌人
        if (ally.type === 'knight') {
            availableTargets.sort((a, b) => {
                const distA = calculateDistance(a, a.campTarget);
                const distB = calculateDistance(b, b.campTarget);
                return distA - distB;
            });
        }
        
        // 寻找攻击范围内的目标
        let target = findTargetInRange(ally, availableTargets);
        
        if (target) {
            ally.isEngaged = true;
            ally.target = target;
            
            // 攻击范围内直接攻击
            if (calculateDistance(ally, target) <= ally.attackRange) {
                attackUnit(ally, target);
            } else {
                // 移动到攻击范围
                moveTowardsTarget(ally, target);
            }
        } else {
            // 无目标时巡逻（保持在大本营前方）
            ally.isEngaged = false;
            ally.target = null;
            
            const campRect = document.querySelector('.camp').getBoundingClientRect();
            const fieldRect = battleField.getBoundingClientRect();
            const campX = campRect.left - fieldRect.left + campRect.width / 2;
            const patrolY = battleField.offsetHeight / 2;
            
            // 移动到巡逻位置
            if (Math.abs(ally.y - patrolY) > 20) {
                moveTowardsPoint(ally, ally.x, patrolY);
            } else {
                // 左右巡逻
                const leftBound = 50;
                const rightBound = battleField.offsetWidth - 50;
                if (ally.x <= leftBound || ally.x >= rightBound) {
                    ally.patrolDirection = ally.x <= leftBound ? 'right' : 'left';
                }
                
                const newX = ally.patrolDirection === 'right' ? ally.x + ally.speed : ally.x - ally.speed;
                moveTowardsPoint(ally, newX, ally.y);
            }
        }
    } catch (error) {
        console.error('友军AI失败:', error);
    }
}

/**
 * 寻找范围内最近的目标
 */
function findTargetInRange(unit, targets) {
    if (!targets || targets.length === 0) return null;
    
    let closestTarget = null;
    let minDistance = Infinity;
    
    targets.forEach(target => {
        const distance = calculateDistance(unit, target);
        if (distance <= unit.searchRange && distance < minDistance) {
            minDistance = distance;
            closestTarget = target;
        }
    });
    
    return closestTarget;
}

/**
 * 计算两点之间距离
 */
function calculateDistance(point1, point2) {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 向目标移动
 */
function moveTowardsTarget(unit, target) {
    const dx = target.x - unit.x;
    const dy = target.y - unit.y;
    const distance = calculateDistance(unit, target);
    
    if (distance === 0) return;
    
    // 计算移动方向
    const moveX = (dx / distance) * unit.speed;
    const moveY = (dy / distance) * unit.speed;
    
    // 更新位置（避免超出屏幕）
    const battleField = document.querySelector('.battle-field');
    const fieldWidth = battleField.offsetWidth;
    const fieldHeight = battleField.offsetHeight;
    
    const newX = Math.max(24, Math.min(fieldWidth - 24, unit.x + moveX));
    const newY = Math.max(24, Math.min(fieldHeight - 24, unit.y + moveY));
    
    unit.x = newX;
    unit.y = newY;
    
    // 更新DOM位置
    if (unit.element) {
        unit.element.style.left = `${newX}px`;
        unit.element.style.top = `${newY}px`;
    }
}

/**
 * 向指定坐标移动
 */
function moveTowardsPoint(unit, targetX, targetY) {
    const dx = targetX - unit.x;
    const dy = targetY - unit.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return;
    
    // 计算移动方向
    const moveX = (dx / distance) * unit.speed;
    const moveY = (dy / distance) * unit.speed;
    
    // 更新位置（避免超出屏幕）
    const battleField = document.querySelector('.battle-field');
    const fieldWidth = battleField.offsetWidth;
    const fieldHeight = battleField.offsetHeight;
    
    const newX = Math.max(24, Math.min(fieldWidth - 24, unit.x + moveX));
    const newY = Math.max(24, Math.min(fieldHeight - 24, unit.y + moveY));
    
    unit.x = newX;
    unit.y = newY;
    
    // 更新DOM位置
    if (unit.element) {
        unit.element.style.left = `${newX}px`;
        unit.element.style.top = `${newY}px`;
    }
}

/**
 * 单位攻击
 */
function attackUnit(attacker, defender) {
    // 攻击冷却
    if (attacker.attackCooldown > 0) {
        attacker.attackCooldown--;
        return;
    }
    
    // 检查目标是否存在
    if (!defender || defender.hp <= 0 || !document.getElementById(defender.id)) {
        attacker.target = null;
        attacker.isEngaged = false;
        return;
    }
    
    // 播放攻击动画
    if (attacker.element) {
        attacker.element.classList.add('unit-attack');
        setTimeout(() => {
            if (attacker.element) attacker.element.classList.remove('unit-attack');
        }, 300);
    }
    
    // 计算伤害
    const damage = attacker.attack;
    defender.hp = Math.max(0, defender.hp - damage);
    
    // 记录总伤害（仅友军攻击计入）
    if (!attacker.isEnemy) {
        gameState.statData.totalDamageDealt += damage;
    }
    
    // 显示伤害数值
    showDamageValue(defender.x, defender.y, damage, defender.isEnemy ? 'text-red-400' : 'text-blue-400');
    
    // 更新目标血条
    const defenderHpFill = defender.element.querySelector('.hp-fill');
    if (defenderHpFill) {
        const hpPercent = (defender.hp / defender.maxHp) * 100;
        defenderHpFill.style.width = `${hpPercent}%`;
    }
    
    // 法师AOE伤害
    if (attacker.isAOE && !attacker.isEnemy) {
        triggerAOEDamage(attacker, defender.x, defender.y);
    }
    
    // 目标死亡处理
    if (defender.hp <= 0) {
        if (defender.isEnemy) {
            handleEnemyDeath(defender);
        } else {
            handleAllyDeath(defender);
        }
        attacker.target = null;
        attacker.isEngaged = false;
    }
    
    // 重置攻击冷却（根据单位类型调整冷却时间）
    attacker.attackCooldown = attacker.isEnemy ? 15 : 
                             attacker.type === 'tank' ? 20 : 
                             attacker.type === 'mage' ? 12 : 
                             attacker.type === 'archer' ? 8 : 10;
}

/**
 * 触发AOE伤害
 */
function triggerAOEDamage(attacker, centerX, centerY) {
    try {
        const battleField = document.querySelector('.battle-field');
        if (!battleField) return;
        
        // 创建AOE特效
        const aoeEffect = document.createElement('div');
        aoeEffect.className = 'aoe-effect';
        aoeEffect.style.left = `${centerX - 60}px`;
        aoeEffect.style.top = `${centerY - 60}px`;
        battleField.appendChild(aoeEffect);
        
        // 移除AOE特效
        setTimeout(() => {
            if (aoeEffect.parentNode) aoeEffect.parentNode.removeChild(aoeEffect);
        }, 500);
        
        // 寻找AOE范围内的其他敌人
        const aoeRange = attacker.aoeRange;
        const enemiesInAOE = gameState.units.filter(u => 
            u.isEnemy && 
            u.hp > 0 && 
            calculateDistance({ x: centerX, y: centerY }, u) <= aoeRange &&
            u.id !== attacker.id
        );
        
        // 对范围内敌人造成伤害（50%基础伤害）
        enemiesInAOE.forEach(enemy => {
            const aoeDamage = Math.floor(attacker.attack * 0.5);
            enemy.hp = Math.max(0, enemy.hp - aoeDamage);
            
            // 记录AOE伤害
            gameState.statData.totalDamageDealt += aoeDamage;
            
            // 显示AOE伤害数值
            showDamageValue(enemy.x, enemy.y, aoeDamage, 'text-purple-400');
            
            // 更新血条
            const enemyHpFill = enemy.element.querySelector('.hp-fill');
            if (enemyHpFill) {
                const hpPercent = (enemy.hp / enemy.maxHp) * 100;
                enemyHpFill.style.width = `${hpPercent}%`;
            }
            
            // 敌人死亡
            if (enemy.hp <= 0) {
                handleEnemyDeath(enemy);
            }
        });
        
        if (enemiesInAOE.length > 0) {
            addBattleLog(`${attacker.name}的AOE伤害击中${enemiesInAOE.length}个敌人！`, `text-${unitConfigs[attacker.type].color}`);
        }
    } catch (error) {
        console.error('AOE伤害触发失败:', error);
    }
}

/**
 * 显示伤害数值
 */
function showDamageValue(x, y, damage, colorClass) {
    try {
        const damageContainer = elements.damageContainer;
        if (!damageContainer) return;
        
        const damageElement = document.createElement('div');
        damageElement.className = `damage-value ${colorClass}`;
        damageElement.textContent = `-${damage}`;
        damageElement.style.left = `${x}px`;
        damageElement.style.top = `${y}px`;
        
        // 居中对齐
        damageElement.style.transform = 'translate(-50%, -50%)';
        
        damageContainer.appendChild(damageElement);
        
        // 移除伤害数值
        setTimeout(() => {
            if (damageElement.parentNode) damageElement.parentNode.removeChild(damageElement);
        }, 500);
    } catch (error) {
        console.error('显示伤害数值失败:', error);
    }
}

/**
 * 敌人攻击大本营
 */
function attackCamp(enemy) {
    // 攻击冷却
    if (enemy.attackCooldown > 0) {
        enemy.attackCooldown--;
        return;
    }
    
    // 播放攻击动画
    if (enemy.element) {
        enemy.element.classList.add('unit-attack');
        setTimeout(() => {
            if (enemy.element) enemy.element.classList.remove('unit-attack');
        }, 300);
    }
    
    // 大本营受伤
    gameState.campHp = Math.max(0, gameState.campHp - enemy.attack);
    
    // 显示伤害数值
    const campElement = document.querySelector('.camp');
    const campRect = campElement.getBoundingClientRect();
    const fieldRect = document.querySelector('.battle-field').getBoundingClientRect();
    const campX = campRect.left - fieldRect.left + campRect.width / 2;
    const campY = campRect.top - fieldRect.top + campRect.height / 2;
    showDamageValue(campX, campY, enemy.attack, 'text-red-400');
    
    // 更新大本营UI
    if (elements.campHp) elements.campHp.textContent = gameState.campHp;
    if (elements.campHpFill) {
        const hpPercent = (gameState.campHp / 200) * 100;
        elements.campHpFill.style.width = `${hpPercent}%`;
        
        // 血量警告
        if (gameState.campHp <= 50 && elements.campHpFill.classList.contains('bg-success')) {
            elements.campHpFill.classList.remove('bg-success');
            elements.campHpFill.classList.add('bg-danger');
            addBattleLog('大本营血量危急！', 'text-danger');
        }
    }
    
    // 大本营被摧毁，战斗失败
    if (gameState.campHp <= 0) {
        endBattle(false);
    }
    
    // 重置攻击冷却
    enemy.attackCooldown = 20;
}

/**
 * 处理敌人死亡
 */
function handleEnemyDeath(enemy) {
    // 增加击杀计数和积分
    gameState.killCount++;
    gameState.battleScore += enemy.killReward;
    gameState.remainingScore += enemy.killReward;
    gameState.statData.enemyTypesKilled[enemy.type] = (gameState.statData.enemyTypesKilled[enemy.type] || 0) + 1;
    
    // 更新UI
    if (elements.battleScore) elements.battleScore.textContent = gameState.battleScore;
    if (elements.remainingScore) elements.remainingScore.textContent = gameState.remainingScore;
    
    // 战斗日志
    addBattleLog(`成功击杀${enemy.isFlying ? '飞行敌人' : '敌人'}「${enemy.name}」，获得${enemy.killReward}积分！`, 'text-success');
    
    // 移除单位
    removeUnit(enemy);
}

/**
 * 处理友军死亡
 */
function handleAllyDeath(ally) {
    // 记录友军损失
    gameState.statData.allyLossCount++;
    
    // 战斗日志
    addBattleLog(`${ally.name}被击败！`, 'text-danger');
    
    // 移除单位
    removeUnit(ally);
}

/**
 * 移除单位
 */
function removeUnit(unit) {
    // 从单位列表中移除
    gameState.units = gameState.units.filter(u => u.id !== unit.id);
    
    // 移除DOM元素
    if (unit.element && unit.element.parentNode) {
        // 播放消失动画
        unit.element.style.opacity = '0';
        unit.element.style.transform = 'scale(0.8)';
        unit.element.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            if (unit.element.parentNode) unit.element.parentNode.removeChild(unit.element);
        }, 300);
    }
}

/**
 * 添加战斗日志
 */
function addBattleLog(content, colorClass) {
    if (!elements.battleLog) return;
    
    const logElement = document.createElement('div');
    logElement.className = colorClass;
    logElement.textContent = `[${formatTime()}] ${content}`;
    
    // 添加到日志容器顶部
    elements.battleLog.insertBefore(logElement, elements.battleLog.firstChild);
    
    // 限制日志数量（最多20条）
    if (elements.battleLog.children.length > 20) {
        elements.battleLog.removeChild(elements.battleLog.lastChild);
    }
    
    // 滚动到底部
    elements.battleLog.scrollTop = elements.battleLog.scrollHeight;
}

/**
 * 格式化时间（HH:MM:SS）
 */
function formatTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

/**
 * 结束战斗（核心结算入口）
 */
function endBattle(isWin) {
    console.log("endBattle:", isWin);
    gameState.gameOver = true;
    
    // 清除计时器
    if (gameState.battleTimer) clearInterval(gameState.battleTimer);
    if (gameState.enemySpawnTimer) clearInterval(gameState.enemySpawnTimer);
    if (gameState.countdownTimer) clearInterval(gameState.countdownTimer);
    
    // 更新胜负统计
    if (isWin) {
        gameState.winCount++;
        addBattleLog('🎉 战斗胜利！成功守护大本营60秒！', 'text-success');
    } else {
        gameState.loseCount++;
        addBattleLog('💥 战斗失败！大本营被摧毁', 'text-danger');
    }
    
    // 更新用户信息（胜率等）
    updateUserInfo();
    
    // 显示结算弹窗（差异化处理）
    showBattleResult(isWin);
}

/**
 * 显示战斗结算弹窗（完善胜利/失败差异化）
 */
function showBattleResult(isWin) {
    if (!elements.battleResult) { console.log("没有result"); return;}
    
    console.log("showBattleResult:", isWin)
    // 1. 基础数据计算
    const totalSeconds = 60 - gameState.remainingTime;
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    const battleTime = `${minutes}:${seconds}`;
    
    // 2. 差异化奖励规则
    let baseReward, killReward, timeReward, totalReward;
    if (isWin) {
        // 胜利奖励：基础50 + 击杀数×3 + 剩余时间×2 + 剩余血量×0.1
        baseReward = 50;
        killReward = gameState.killCount * 3;
        timeReward = gameState.remainingTime * 2; // 剩余时间越多奖励越多
        const hpReward = Math.floor(gameState.campHp * 0.1); // 大本营剩余血量奖励
        totalReward = baseReward + killReward + timeReward + hpReward;
    } else {
        // 失败奖励：基础10 + 击杀数×1（无时间和血量奖励）
        baseReward = 10;
        killReward = gameState.killCount * 1;
        timeReward = 0;
        totalReward = baseReward + killReward;
    }
    
    // 3. 敌人类型击杀统计文本
    const enemyTypeStats = [
        `侦察兵: ${gameState.statData.enemyTypesKilled.enemy1}`,
        `突击手: ${gameState.statData.enemyTypesKilled.enemy2}`,
        `重装兵: ${gameState.statData.enemyTypesKilled.enemy3}`,
        `无人机: ${gameState.statData.enemyTypesKilled.enemy4}`
    ].join(' | ');
    
    // 4. 差异化UI更新
    // 图标容器
    if (elements.resultIconContainer) {
        elements.resultIconContainer.className = `w-24 h-24 rounded-full mx-auto mb-4 border-4 ${isWin ? 'border-success bg-success/20' : 'border-danger bg-danger/20'} flex items-center justify-center`;
        elements.resultIconContainer.classList.add(isWin ? 'border-glow-win' : 'border-glow-lose');
    }
    
    // 结果图标
    if (elements.resultIcon) {
        elements.resultIcon.className = `fa ${isWin ? 'fa-trophy' : 'fa-skull'} text-4xl ${isWin ? 'text-success' : 'text-danger'}`;
    }
    
    // 结果标题
    if (elements.resultTitle) {
        elements.resultTitle.textContent = isWin ? '🎉 战斗胜利！' : '💥 战斗失败';
        elements.resultTitle.className = `text-2xl font-bold ${isWin ? 'text-success' : 'text-danger'} mb-2`;
    }
    
    // 结果描述（差异化文案）
    if (elements.resultDesc) {
        if (isWin) {
            elements.resultDesc.textContent = `坚守${battleTime}！成功守护大本营，获得丰厚奖励！`;
        } else {
            elements.resultDesc.textContent = `战斗时长${battleTime}，大本营被摧毁，再接再厉！`;
        }
    }
    
    // 奖励数值（胜利显示时间奖励，失败隐藏）
    if (elements.rewardBase) elements.rewardBase.textContent = `+${baseReward}`;
    if (elements.rewardKills) elements.rewardKills.textContent = `+${killReward}`;
    
    // 胜利额外显示时间奖励项
    const timeRewardElement = document.createElement('div');
    timeRewardElement.className = `reward-card bg-gray-800 rounded p-3 ${!isWin ? 'hidden' : ''}`;
    timeRewardElement.innerHTML = `
        <p class="text-gray-400 text-xs mb-1">${isWin ? '时间奖励' : ''}</p>
        <p class="text-xl font-bold text-yellow-400">+${timeReward}</p>
    `;
    // 插入到击杀奖励后
    const rewardsContainer = document.querySelector('.rewards');
    if (rewardsContainer && isWin) {
        rewardsContainer.insertBefore(timeRewardElement, rewardsContainer.children[2]);
    }
    
    // 总奖励
    if (elements.rewardTotal) elements.rewardTotal.textContent = `+${totalReward}`;
    
    // 战斗统计（新增总伤害和友军损失）
    if (elements.statKills) elements.statKills.textContent = gameState.killCount;
    if (elements.statCampHp) elements.statCampHp.textContent = `${gameState.campHp}/200`;
    if (elements.statTime) elements.statTime.textContent = battleTime;
    if (elements.statSummoned) elements.statSummoned.textContent = gameState.statData.summonedUnits;
    
    // 新增：敌人类型击杀统计
    if (document.getElementById('stat-enemy-types')) {
        document.getElementById('stat-enemy-types').textContent = enemyTypeStats;
    }
    
    // 新增：总伤害统计
    const totalDamageElement = document.createElement('div');
    totalDamageElement.className = 'stat-item';
    totalDamageElement.innerHTML = `
        <span class="text-gray-500">总伤害:</span>
        <span class="text-white font-bold">${gameState.statData.totalDamageDealt}</span>
    `;
    const statsGrid = document.querySelector('.stats-grid');
    if (statsGrid) {
        statsGrid.appendChild(totalDamageElement);
    }
    
    // 新增：友军损失统计
    const allyLossElement = document.createElement('div');
    allyLossElement.className = 'stat-item';
    allyLossElement.innerHTML = `
        <span class="text-gray-500">友军损失:</span>
        <span class="text-white font-bold">${gameState.statData.allyLossCount}</span>
    `;
    if (statsGrid) {
        statsGrid.appendChild(allyLossElement);
    }
    
    // 5. 差异化按钮文本
    if (elements.playAgainBtn) {
        elements.playAgainBtn.textContent = isWin ? '再来一局' : '重新挑战';
        elements.playAgainBtn.className = `flex-1 btn ${isWin ? 'btn-success' : 'btn-danger'} py-2`;
    }
    
    // 6. 显示弹窗
    elements.battleResult.classList.remove('hidden');
    elements.battleResult.classList.add('active');
    
    // 7. 更新总积分
    gameState.battleScore += totalReward;
    if (elements.battleScore) elements.battleScore.textContent = gameState.battleScore;
    
    // 8. 战斗日志最终记录
    addBattleLog(`战斗结束！${isWin ? '获得总奖励' : '获得基础奖励'}${totalReward}积分`, isWin ? 'text-success' : 'text-danger');
}