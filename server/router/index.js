const { Router } = require('express')
const userController = require('../controllers/user-controller')
const tatamiController = require('../controllers/tatami-controller')
const fightController = require('../controllers/fight-controller')
const publicController = require('../controllers/public-controller') 
const fighterController = require('../controllers/fighter-controller')
const authMiddleware = require('../middlewares/auth-middleware')
const { body } = require('express-validator')

const router = new Router()

// ========== PUBLIC ROUTES (БЕЗ АВТОРИЗАЦИИ) ==========
// ВАЖНО: Публичные роуты ПЕРВЫМИ!
router.get('/public/tatamis', publicController.getActiveTatamis)
router.get('/public/fights/active', publicController.getActiveFights)
router.get('/public/fights/tatami/:tatamiId', publicController.getFightsByTatami)
router.get('/public/fighters', publicController.getAllFighters)
router.get('/public/fighter/stats/:fighterId', publicController.getFighterStats)

// ========== AUTH ROUTES ==========
router.post('/login', 
    body('email').isEmail(),
    body('password').isLength({ min: 3, max: 32 }),
    userController.login
)
router.post('/logout', userController.logout)
router.get('/refresh', userController.refresh)

// ========== ADMIN MANAGEMENT ==========
router.post('/create-admin',
    authMiddleware,
    body('email').isEmail(),
    body('password').isLength({ min: 3, max: 32 }),
    userController.createAdmin
)
router.get('/admins', authMiddleware, userController.getAdmins)

// ========== TATAMI MANAGEMENT ==========
router.post('/tatami/create',
    authMiddleware,
    body('number').isInt(),
    body('name').notEmpty(),
    body('adminId').notEmpty(),
    tatamiController.createTatami
)
router.get('/tatami/all', authMiddleware, tatamiController.getAllTatami)
router.get('/tatami/my', authMiddleware, tatamiController.getMyTatami)
router.put('/tatami/status', authMiddleware, tatamiController.updateTatamiStatus)
router.delete('/tatami/delete', authMiddleware, tatamiController.deleteTatami)

// ========== FIGHTER MANAGEMENT ==========
router.post('/fighter/create',
    authMiddleware,
    body('name').notEmpty(),
    fighterController.createFighter
)
router.get('/fighter/all', authMiddleware, fighterController.getAllFighters)
router.get('/fighter/my', authMiddleware, fighterController.getMyFighters)
router.put('/fighter/update', 
    authMiddleware, 
    body('fighterId').notEmpty(),
    body('name').notEmpty(),
    fighterController.updateFighter
)
router.delete('/fighter/delete', 
    authMiddleware,
    body('fighterId').notEmpty(),
    fighterController.deleteFighter
)

// ========== FIGHT MANAGEMENT ==========
// ВАЖНО: Только ОДИН роут /fight/create!
router.post('/fight/create',
    authMiddleware,
    body('tatamiId').notEmpty(),
    body('fighter1Id').notEmpty(),
    body('fighter2Id').notEmpty(),
    fightController.createFight
)
router.get('/fight/tatami/:tatamiId', authMiddleware, fightController.getFightsByTatami)
router.get('/fight/all', authMiddleware, fightController.getAllFights)
router.put('/fight/edit',
    authMiddleware,
    body('fightId').notEmpty(),
    body('fighter1Id').notEmpty(),
    body('fighter2Id').notEmpty(),
    fightController.editFight
)
router.put('/fight/status',
    authMiddleware,
    body('fightId').notEmpty(),
    body('status').notEmpty(),
    fightController.updateFightStatus
)
router.put('/fight/result', 
    authMiddleware,
    body('fightId').notEmpty(),
    body('winner').notEmpty(),
    body('score').notEmpty(),
    fightController.updateFightResult
)

module.exports = router