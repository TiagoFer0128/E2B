async function handlepostRequest(req, env) { const requestBody = req.json(); const botAccessToken = env.SLACK_BOT_ACCESS_TOKEN; const SlackREST = require('@sagi.io/workers-slack'); const SlackAPI = new SlackREST({ botAccessToken }); const data = { channel: 'general', text: `User '${requestBody.email}' selected pricing '${requestBody.selectedPricing.type}' for $${requestBody.selectedPricing.cost}` }; const result = await SlackAPI.chat.postMessage(data); return new Response('Ok', { status: 200 }); }