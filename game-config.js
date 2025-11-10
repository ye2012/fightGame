// 全局游戏状态
const gameState = {
    currentPage: 'login',
    userName: '',
    userAvatar: '1',
    winCount: 0,
    loseCount: 0,
    battleScore: 0,
    remainingScore: 0,
    campHp: 200,
    killCount: 0,
    units: [],
    remainingTime: 60,
    gameOver: false,
    statData: {
        summonedUnits: 0,
        enemyTypesKilled: { enemy1: 0, enemy2: 0, enemy3: 0, enemy4: 0 }
    },
    // 计时器存储
    battleTimer: null,
    enemySpawnTimer: null,
    countdownTimer: null
};

// 单位配置表
const unitConfigs = {
    // 友军单位
    soldier: {
        type: 'soldier',
        name: '士兵',
        icon: 'fa-user',
        color: 'success',
        hp: 80,
        attack: 25,
        speed: 3,
        attackRange: 80,
        isFlying: false,
        canAttackFlying: true,
        cost: 10,
        searchRange: 200,
        desc: '均衡型单位，可攻击地面和飞行敌人'
    },
    tank: {
        type: 'tank',
        name: '坦克',
        icon: 'fa-tank',
        color: 'warning',
        hp: 200,
        attack: 50,
        speed: 1.5,
        attackRange: 150,
        isFlying: false,
        canAttackFlying: false,
        cost: 30,
        searchRange: 250,
        desc: '肉盾型单位，攻击距离远但无法攻击飞行敌人'
    },
    archer: {
        type: 'archer',
        name: '弓箭手',
        icon: 'fa-bow-arrow',
        color: 'info',
        hp: 60,
        attack: 20,
        speed: 2.5,
        attackRange: 200,
        isFlying: false,
        canAttackFlying: true,
        cost: 15,
        searchRange: 300,
        desc: '远程输出单位，攻击距离最远，优先攻击飞行敌人'
    },
    mage: {
        type: 'mage',
        name: '法师',
        icon: 'fa-wand-magic-sparkles',
        color: 'secondary',
        hp: 50,
        attack: 35,
        speed: 2,
        attackRange: 120,
        isFlying: false,
        canAttackFlying: true,
        cost: 25,
        searchRange: 180,
        isAOE: true,
        aoeRange: 60,
        desc: 'AOE伤害单位，攻击时对目标周围敌人造成溅射伤害'
    },
    knight: {
        type: 'knight',
        name: '骑士',
        icon: 'fa-horse-head',
        color: 'danger',
        hp: 120,
        attack: 40,
        speed: 4.5,
        attackRange: 50,
        isFlying: false,
        canAttackFlying: false,
        cost: 20,
        searchRange: 220,
        desc: '高速突击单位，移动速度最快，优先攻击敌方后排'
    },
    
    // 敌方单位
    enemy1: {
        type: 'enemy1',
        name: '侦察兵',
        icon: 'fa-bug',
        color: 'danger',
        hp: 50,
        attack: 15,
        speed: 2.5,
        attackRange: 60,
        isFlying: false,
        killReward: 5
    },
    enemy2: {
        type: 'enemy2',
        name: '突击手',
        icon: 'fa-skull',
        color: 'danger',
        hp: 120,
        attack: 30,
        speed: 2,
        attackRange: 70,
        isFlying: false,
        killReward: 15
    },
    enemy3: {
        type: 'enemy3',
        name: '重装兵',
        icon: 'fa-shield-halved',
        color: 'danger',
        hp: 200,
        attack: 45,
        speed: 1.2,
        attackRange: 80,
        isFlying: false,
        killReward: 25
    },
    enemy4: {
        type: 'enemy4',
        name: '无人机',
        icon: 'fa-helicopter',
        color: 'secondary',
        hp: 60,
        attack: 20,
        speed: 4,
        attackRange: 70,
        isFlying: true,
        killReward: 10
    }
};