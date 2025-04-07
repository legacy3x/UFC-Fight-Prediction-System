// Add these new imports:
import swaggerUi from 'swagger-ui-express';
import { generateOpenApi } from '@ts-rest/open-api';
import { contract } from './contract';

// Add this at the end (before export):
const openApiDocument = generateOpenApi(contract, {
  info: {
    title: 'MMA Prediction API',
    version: '1.0.0',
    description: 'API for predicting MMA fight outcomes'
  }
});

router.use('/docs', swaggerUi.serve);
router.get('/docs', swaggerUi.setup(openApiDocument));

// Add this new contract definition file:
<boltAction type="file" filePath="src/api/contract.ts">
import { initContract } from '@ts-rest/core';

const c = initContract();

export const contract = c.router({
  predict: {
    method: 'POST',
    path: '/predict',
    responses: {
      200: c.type<PredictionResult>(),
      400: c.type<{ error: string }>()
    },
    body: c.type<{ fighterA: string; fighterB: string }>(),
    summary: 'Predict fight outcome between two fighters'
  },
  train: {
    method: 'POST',
    path: '/train',
    responses: {
      200: c.type<{ success: boolean }>(),
      500: c.type<{ error: string }>()
    },
    summary: 'Retrain prediction model'
  },
  versions: {
    method: 'GET',
    path: '/versions',
    responses: {
      200: c.type<Array<{ version: string; created_at: string }>>()
    },
    summary: 'List available model versions'
  }
});
