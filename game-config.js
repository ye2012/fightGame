// 全局游戏状态
const gameState = {
  currentPage: 'login', // 当前页面（login/user/battle）
  userName: '',         // 用户名
  userAvatar: '1',      // 用户头像索引
  winCount: 0,          // 胜利次数
  loseCount: 0,         // 失败次数
  battleScore: 0,       // 战斗积分
  remainingScore: 0,    // 剩余积分
  campHp: 200,          // 大本营血量
  killCount: 0,         // 击杀数
  units: [],            // 战场单位列表
  remainingTime: 60,    // 剩余时间
  gameOver: false,      // 战斗是否结束
  statData: {           // 战斗统计
    summonedUnits: 0,
    enemyTypesKilled: { enemy1: 0, enemy2: 0, enemy3: 0, enemy4: 0 }
  }
};

// 单位配置表（新增飞行属性isFlying、攻击距离attackRange）
const unitConfigs = {
  // 友军单位
  soldier: {           // 士兵（人）
    type: 'soldier',
    name: '士兵',
    icon: 'fa-user',
    color: 'success',  // 绿色
    hp: 80,            // 血量
    attack: 25,        // 攻击力
    speed: 3,          // 移动速度
    attackRange: 100,   // 攻击距离（较近）
    isFlying: false,   // 地面单位
    canAttackFlying: true, // 可攻击飞行单位
    cost: 10,          // 召唤成本
    searchRange: 300   // 索敌范围
  },
  tank: {              // 坦克
    type: 'tank',
    name: '坦克',
    icon: 'fa-tank',
    color: 'warning',  // 橙色
    hp: 200,           // 血量（厚）
    attack: 50,        // 攻击力（高）
    speed: 1.5,        // 移动速度（慢）
    attackRange: 200,  // 攻击距离（更远）
    isFlying: false,   // 地面单位
    canAttackFlying: false, // 仅攻击地面单位
    cost: 30,          // 召唤成本
    searchRange: 350   // 索敌范围（更广）
  },
  
  // 敌方单位（新增飞行敌人enemy4）
  enemy1: {            // 地面敌人-小兵
    type: 'enemy1',
    name: '侦察兵',
    icon: 'fa-bug',
    color: 'danger',   // 红色
    hp: 50,
    attack: 15,
    speed: 2.5,
    attackRange: 80,
    isFlying: false,   // 地面
    killReward: 5      // 击杀奖励积分
  },
  enemy2: {            // 地面敌人-精英
    type: 'enemy2',
    name: '突击手',
    icon: 'fa-skull',
    color: 'danger',
    hp: 120,
    attack: 30,
    speed: 2,
    attackRange: 120,
    isFlying: false,   // 地面
    killReward: 15
  },
  enemy3: {            // 地面敌人-重型
    type: 'enemy3',
    name: '重装兵',
    icon: 'fa-shield-halved',
    color: 'danger',
    hp: 200,
    attack: 45,
    speed: 1.2,
    attackRange: 180,
    isFlying: false,   // 地面
    killReward: 25
  },
  enemy4: {            // 飞行敌人-新增
    type: 'enemy4',
    name: '无人机',
    icon: 'fa-helicopter',
    color: 'secondary',// 紫色（区分飞行）
    hp: 60,
    attack: 20,
    speed: 4,          // 飞行速度快
    attackRange: 80,
    isFlying: true,    // 飞行单位
    killReward: 10
  }
};

// 全局DOM元素缓存
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
  remainingScore: document.getElementById('remaining-score'),
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