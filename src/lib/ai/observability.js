import db from '@/lib/db';

/**
 * Placeholder for cost estimation based on model and token/size usage.
 * Values should be updated as specific configurations are determined.
 */
export function estimateCost(model, inputSize, outputSize) {
  // Baseline estimate: $0.15 per 1M tokens assumption
  const tokenCost = 0.00000015; 
  const total = (inputSize || 0) + (outputSize || 0);
  return total * tokenCost;
}

/**
 * AI Observability Utility: Tracks request latency, cost, and status.
 * 
 * @param {Object} context - Metadata about the AI request
 * @param {string} context.userId
 * @param {string} context.businessId
 * @param {string} context.requestType - "chat" | "voice" | "system"
 * @param {string} context.provider
 * @param {string} context.model
 * @param {Function} fn - The function performing the AI task
 * @returns {Promise<any>} - The result from the provided function
 */
export async function trackAIUsage({ userId, businessId, requestType, provider, model }, fn) {
  const startTime = Date.now();
  let status = 'success';
  let errorMessage = null;
  let result = null;
  let inputSize = 0;
  let outputSize = 0;

  try {
    // 1. Execute the target AI function
    result = await fn();
    
    // 2. Extract metrics from result if available (standardize on inputSize/outputSize or tokensUsed)
    if (result && typeof result === 'object') {
      inputSize = result.inputSize || result.tokensUsed || 0;
      outputSize = result.outputSize || 0;
    }
  } catch (error) {
    status = 'error';
    errorMessage = error.message;
    // We catch the error to log it, but we MUST throw it back out so original logic doesn't break
    throw error;
  } finally {
    const latency = Date.now() - startTime;
    const cost = estimateCost(model, inputSize, outputSize);

    // 3. Log to DB (Fire-and-forget style to avoid blocking response)
    db.query(`
      INSERT INTO ai_usage_logs (
        user_id, business_id, request_type, provider, model, 
        input_size, output_size, latency, estimated_cost, 
        status, error_message
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      userId || null, 
      businessId || null, 
      requestType, 
      provider, 
      model, 
      inputSize, 
      outputSize, 
      latency, 
      cost, 
      status, 
      errorMessage
    ]).catch(dbError => {
      console.error('[AI-Observability] Failed to save usage log:', dbError.message);
    });
  }

  return result;
}
