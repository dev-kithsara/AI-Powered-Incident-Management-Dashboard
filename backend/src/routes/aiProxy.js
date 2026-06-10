const router = require('express').Router();
const axios  = require('axios');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

const AI_URL = () => process.env.AI_SERVICE_URL || 'http://ai-service:8001';
const AI_KEY = () => process.env.AI_API_KEY     || '';

const proxyToAI = async (req, res, next) => {
  try {
    const path   = req.path;
    const method = req.method.toLowerCase();
    const config = { headers: { 'X-API-Key': AI_KEY() } };

    let response;
    if (method === 'get') {
      response = await axios.get(`${AI_URL()}/api/ai${path}`, { ...config, params: req.query });
    } else {
      response = await axios[method](`${AI_URL()}/api/ai${path}`, req.body, config);
    }
    res.json(response.data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    // AI service unavailable — return graceful error
    res.status(503).json({ error: 'AI service temporarily unavailable', detail: err.message });
  }
};

router.get('/similar-incidents', proxyToAI);
router.get('/cluster-map',       proxyToAI);
router.post('/predict-risk',     proxyToAI);
router.get('/cluster-stats',     proxyToAI);
router.get('/model-status',      proxyToAI);
router.get('/health',            proxyToAI);
router.post('/process',          proxyToAI);
router.get('/risk-analysis',     proxyToAI);
router.post('/retrain-classifier', proxyToAI); // retrain classifier only
router.post('/run-pipeline',       proxyToAI); // full pipeline: embed → cluster → train
router.post('/seed-baseline',      proxyToAI); // seed 30 baseline incidents + run pipeline
router.post('/lessons-learned/recommend', proxyToAI);

module.exports = router;
