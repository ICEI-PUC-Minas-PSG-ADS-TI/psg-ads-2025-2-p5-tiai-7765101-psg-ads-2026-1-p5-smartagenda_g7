/**
 * @format
 */
import 'web-streams-polyfill/dist/polyfill';
import 'react-native-get-random-values';
import structuredClonePolyfill from '@ungap/structured-clone';
if (typeof globalThis.structuredClone !== 'function') {
    globalThis.structuredClone = structuredClonePolyfill;
}
/*if (typeof global.structuredClone !== 'function') {
    global.structuredClone = structuredClonePolyfill;
}*/

import { TextEncoder, TextDecoder } from 'text-encoding';
if (!globalThis.TextEncoder) {
    globalThis.TextEncoder = TextEncoder;
}
if (!globalThis.TextDecoder) {
    globalThis.TextDecoder = TextDecoder;
}

if (!globalThis.crypto) {
    globalThis.crypto = {};
}

if (!globalThis.crypto.randomUUID) {
    globalThis.crypto.randomUUID = () =>
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';



AppRegistry.registerComponent(appName, () => App);
