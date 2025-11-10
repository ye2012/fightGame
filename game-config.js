// 全局状态管理（初始配置）
const gameState = {
  currentPage: 'login',
  userId: '',
  userName: '',
  userAvatar: '1', // 默认头像ID（1-4）
  winCount: 0,
  loseCount: 0,
  battleTimer: null,
  battleTime: 0,
  battleScore: 0,
  campHp: 200,
  killCount: 0,
  enemySpawnTimer: null,
  units: [],
  countdownTimer: null,
  remainingTime: 60, // 1分钟倒计时
  gameOver: false,
  // 结算统计数据
  statData: {
    summonedUnits: 0,
    enemyTypesKilled: {
      enemy1: 0,
      enemy2: 0,
      enemy3: 0
    }
  }
};

// 单位配置（可独立修改属性）
const unitConfigs = {
  soldier: {
    type: 'soldier',
    hp: 50,
    attack: 15,
    speed: 2,
    cost: 10,
    color: 'success',
    icon: 'fa-user',
    isEnemy: false,
    searchRange: 200
  },
  tank: {
    type: 'tank',
    hp: 100,
    attack: 30,
    speed: 1,
    cost: 30,
    color: 'warning',
    icon: 'fa-tank',
    isEnemy: false,
    searchRange: 300
  },
  enemy1: {
    type: 'enemy1',
    name: '外星入侵者',
    hp: 40,
    attack: 12,
    speed: 1.8,
    color: 'danger',
    icon: 'fa-alien',
    isEnemy: true,
    searchRange: 100,
    priority: 'camp',
    killReward: 20
  },
  enemy2: {
    type: 'enemy2',
    name: '战争机器人',
    hp: 60,
    attack: 18,
    speed: 1.2,
    color: 'danger',
    icon: 'fa-robot',
    isEnemy: true,
    searchRange: 150,
    priority: 'camp',
    killReward: 30
  },
  enemy3: {
    type: 'enemy3',
    name: '星际虫子',
    hp: 30,
    attack: 10,
    speed: 2.2,
    color: 'danger',
    icon: 'fa-bug',
    isEnemy: true,
    searchRange: 80,
    priority: 'camp',
    killReward: 15
  }
};

// // DOM元素统一获取（避免重复查询）
// const elements = {
//   // 页面容器
//   loginPage: document.getElementById('login-page'),
//   userPage: document.getElementById('user-page'),
//   battlePage: document.getElementById('battle-page'),
//   // 登录相关
//   nicknameInput: document.getElementById('nickname'),
//   loginBtn: document.getElementById('login-btn'),
//   guestLoginBtn: document.getElementById('guest-login'),
//   avatarOptions: document.querySelectorAll('.avatar-option'),
//   // 用户中心相关
//   backBtn: document.getElementById('back-btn'),
//   logoutBtn: document.getElementById('logout-btn'),
//   startGameBtn: document.getElementById('start-game'),
//   userAvatar: document.getElementById('user-avatar'),
//   userName: document.getElementById('user-name'),
//   userId: document.getElementById('user-id'),
//   winRate: document.getElementById('win-rate'),
//   winCount: document.getElementById('win-count'),
//   loseCount: document.getElementById('lose-count'),
//   // 战斗页面相关
//   backToUserBtn: document.getElementById('back-to-user'),
//   battleUserAvatar: document.getElementById('battle-user-avatar'),
//   battleUserName: document.getElementById('battle-user-name'),
//   battleScore: document.getElementById('battle-score'),
//   campHp: document.getElementById('camp-hp'),
//   summonSoldierBtn: document.getElementById('summon-soldier'),
//   summonTankBtn: document.getElementById('summon-tank'),
//   battleLog: document.getElementById('battle-log'),
//   damageContainer: document.getElementById('damage-container'),
//   countdownContainer: document.getElementById('countdown-container'),
//   countdownText: document.getElementById('countdown-text'),
//   // 结算弹窗相关
//   battleResult: document.getElementById('battle-result'),
//   resultIconContainer: document.getElementById('result-icon-container'),
//   resultIcon: document.getElementById('result-icon'),
//   resultTitle: document.getElementById('result-title'),
//   resultDesc: document.getElementById('result-desc'),
//   statKills: document.getElementById('stat-kills'),
//   statCampHp: document.getElementById('stat-camp-hp'),
//   statTime: document.getElementById('stat-time'),
//   statSummoned: document.getElementById('stat-summoned'),
//   rewardSection: document.getElementById('reward-section'),
//   rewardBase: document.getElementById('reward-base'),
//   rewardKills: document.getElementById('reward-kills'),
//   rewardTotal: document.getElementById('reward-total'),
//   backToUserFromResult: document.getElementById('back-to-user-from-result'),
//   playAgainBtn: document.getElementById('play-again')
// };