import express from 'express';

const router = express.Router();

// TODO: Implement schedule routes
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Schedule endpoint - not implemented yet',
        data: []
    });
});

export default router;