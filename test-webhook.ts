import { WebhooksResource } from './src/resources/webhooks/webhooks.resource';
import { HttpClient } from './src/core/http-client';
import * as crypto from 'node:crypto';

// Mock HttpClient since we only test verifySignature which doesn't use it
const mockHttpClient = {} as HttpClient;
const webhooks = new WebhooksResource(mockHttpClient);

const secret = 'my_secret_key';
const payload = JSON.stringify({ event: 'transfer.created', data: { id: '123' } });

// Generate valid signature
const hmac = crypto.createHmac('sha256', secret);
const validSignature = hmac.update(payload).digest('hex');

console.log('Testing Webhook Signature Verification...');

// Test 1: Valid Signature
const isValid = webhooks.verifySignature(payload, validSignature, secret);
console.log(`Test 1 (Valid): ${isValid ? 'PASS' : 'FAIL'}`);

// Test 2: Invalid Signature
const isInvalid = webhooks.verifySignature(payload, 'invalid_signature', secret);
console.log(`Test 2 (Invalid): ${!isInvalid ? 'PASS' : 'FAIL'}`);

// Test 3: Tampered Payload
const tamperedPayload = payload + ' ';
const isTampered = webhooks.verifySignature(tamperedPayload, validSignature, secret);
console.log(`Test 3 (Tampered Payload): ${!isTampered ? 'PASS' : 'FAIL'}`);

if (isValid && !isInvalid && !isTampered) {
  console.log('All Webhook Tests PASSED');
  process.exit(0);
} else {
  console.error('Some Webhook Tests FAILED');
  process.exit(1);
}
