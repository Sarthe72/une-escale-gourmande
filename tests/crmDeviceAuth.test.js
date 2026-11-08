import test from 'node:test';
import assert from 'node:assert/strict';
import {validDeviceKey,verifyDeviceProof} from '../src/lib/crmDeviceAuth.js';
test('preuve appareil : signature valide, challenge différent et autre appareil refusés',async()=>{
 const keys=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},false,['sign','verify']);
 const publicKey=await crypto.subtle.exportKey('jwk',keys.publicKey);
 const sig=Buffer.from(await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},keys.privateKey,new TextEncoder().encode('challenge-unique'))).toString('base64url');
 assert.equal(validDeviceKey(publicKey),true);assert.equal(await verifyDeviceProof(publicKey,'challenge-unique',sig),true);
 assert.equal(await verifyDeviceProof(publicKey,'autre-challenge',sig),false);
 const other=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},false,['sign','verify']);
 assert.equal(await verifyDeviceProof(await crypto.subtle.exportKey('jwk',other.publicKey),'challenge-unique',sig),false);
 assert.equal(validDeviceKey({...publicKey,d:'cle-privee-interdite'}),false);
 assert.equal(await verifyDeviceProof(publicKey,'challenge-unique','invalide'),false);
});
