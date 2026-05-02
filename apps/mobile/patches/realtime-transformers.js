"use strict";
console.log('[FlickPatch] ✅ Using patched @supabase/realtime-js transformers');
/**
 * Patched replacement for @supabase/realtime-js dist/main/lib/transformers.js
 *
 * ONLY CHANGE: httpEndpointURL now uses string operations instead of URL
 * class property access (URL.protocol / URL.pathname / URL.href all throw
 * "not implemented" in React Native 0.76 New Architecture / Hermes JSI).
 *
 * Every other export is identical to the original file.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpEndpointURL = exports.toTimestampString = exports.toArray = exports.toJson = exports.toNumber = exports.toBoolean = exports.convertCell = exports.convertColumn = exports.convertChangeData = exports.PostgresTypes = void 0;

var PostgresTypes;
(function (PostgresTypes) {
    PostgresTypes["abstime"] = "abstime";
    PostgresTypes["bool"] = "bool";
    PostgresTypes["date"] = "date";
    PostgresTypes["daterange"] = "daterange";
    PostgresTypes["float4"] = "float4";
    PostgresTypes["float8"] = "float8";
    PostgresTypes["int2"] = "int2";
    PostgresTypes["int4"] = "int4";
    PostgresTypes["int4range"] = "int4range";
    PostgresTypes["int8"] = "int8";
    PostgresTypes["int8range"] = "int8range";
    PostgresTypes["json"] = "json";
    PostgresTypes["jsonb"] = "jsonb";
    PostgresTypes["money"] = "money";
    PostgresTypes["numeric"] = "numeric";
    PostgresTypes["oid"] = "oid";
    PostgresTypes["reltime"] = "reltime";
    PostgresTypes["text"] = "text";
    PostgresTypes["time"] = "time";
    PostgresTypes["timestamp"] = "timestamp";
    PostgresTypes["timestamptz"] = "timestamptz";
    PostgresTypes["timetz"] = "timetz";
    PostgresTypes["tsrange"] = "tsrange";
    PostgresTypes["tstzrange"] = "tstzrange";
})(PostgresTypes || (exports.PostgresTypes = PostgresTypes = {}));

const convertChangeData = (columns, record, options = {}) => {
    var _a;
    const skipTypes = (_a = options.skipTypes) !== null && _a !== void 0 ? _a : [];
    if (!record) {
        return {};
    }
    return Object.keys(record).reduce((acc, rec_key) => {
        acc[rec_key] = (0, exports.convertColumn)(rec_key, columns, record, skipTypes);
        return acc;
    }, {});
};
exports.convertChangeData = convertChangeData;

const convertColumn = (columnName, columns, record, skipTypes) => {
    const column = columns.find((x) => x.name === columnName);
    const colType = column === null || column === void 0 ? void 0 : column.type;
    const value = record[columnName];
    if (colType && !skipTypes.includes(colType)) {
        return (0, exports.convertCell)(colType, value);
    }
    return noop(value);
};
exports.convertColumn = convertColumn;

const convertCell = (type, value) => {
    if (type.charAt(0) === '_') {
        const dataType = type.slice(1, type.length);
        return (0, exports.toArray)(value, dataType);
    }
    switch (type) {
        case PostgresTypes.bool:
            return (0, exports.toBoolean)(value);
        case PostgresTypes.float4:
        case PostgresTypes.float8:
        case PostgresTypes.int2:
        case PostgresTypes.int4:
        case PostgresTypes.int8:
        case PostgresTypes.numeric:
        case PostgresTypes.oid:
            return (0, exports.toNumber)(value);
        case PostgresTypes.json:
        case PostgresTypes.jsonb:
            return (0, exports.toJson)(value);
        case PostgresTypes.timestamp:
            return (0, exports.toTimestampString)(value);
        case PostgresTypes.abstime:
        case PostgresTypes.date:
        case PostgresTypes.daterange:
        case PostgresTypes.int4range:
        case PostgresTypes.int8range:
        case PostgresTypes.money:
        case PostgresTypes.reltime:
        case PostgresTypes.text:
        case PostgresTypes.time:
        case PostgresTypes.timestamptz:
        case PostgresTypes.timetz:
        case PostgresTypes.tsrange:
        case PostgresTypes.tstzrange:
            return noop(value);
        default:
            return noop(value);
    }
};
exports.convertCell = convertCell;

const noop = (value) => { return value; };

const toBoolean = (value) => {
    switch (value) {
        case 't': return true;
        case 'f': return false;
        default: return value;
    }
};
exports.toBoolean = toBoolean;

const toNumber = (value) => {
    if (typeof value === 'string') {
        const parsedValue = parseFloat(value);
        if (!Number.isNaN(parsedValue)) { return parsedValue; }
    }
    return value;
};
exports.toNumber = toNumber;

const toJson = (value) => {
    if (typeof value === 'string') {
        try { return JSON.parse(value); }
        catch (_a) { return value; }
    }
    return value;
};
exports.toJson = toJson;

const toArray = (value, type) => {
    if (typeof value !== 'string') { return value; }
    const lastIdx = value.length - 1;
    const closeBrace = value[lastIdx];
    const openBrace = value[0];
    if (openBrace === '{' && closeBrace === '}') {
        let arr;
        const valTrim = value.slice(1, lastIdx);
        try { arr = JSON.parse('[' + valTrim + ']'); }
        catch (_) { arr = valTrim ? valTrim.split(',') : []; }
        return arr.map((val) => (0, exports.convertCell)(type, val));
    }
    return value;
};
exports.toArray = toArray;

const toTimestampString = (value) => {
    if (typeof value === 'string') { return value.replace(' ', 'T'); }
    return value;
};
exports.toTimestampString = toTimestampString;

/**
 * PATCHED: Pure string implementation — avoids URL class property access.
 *
 * Original used:
 *   new URL(socketUrl)               → OK
 *   wsUrl.protocol = wsUrl.protocol.replace(...)  → THROWS in RN New Arch
 *   wsUrl.pathname = wsUrl.pathname.replace(...)  → THROWS in RN New Arch
 *   return wsUrl.href                → THROWS in RN New Arch
 *
 * Input:  wss://xyz.supabase.co/realtime/v1/websocket
 * Output: https://xyz.supabase.co/realtime/v1/api/broadcast
 */
const httpEndpointURL = (socketUrl) => {
    // Convert ws/wss → http/https
    const httpUrl = socketUrl
        .replace(/^wss:/i, 'https:')
        .replace(/^ws:/i, 'http:');

    // Split into origin + pathname  
    const m = httpUrl.match(/^(https?:\/\/[^/]*)(.*)?$/i);
    if (!m) return httpUrl + '/api/broadcast';

    const origin = m[1];
    let pathname = m[2] || '/';

    // Same cleanup as the original
    pathname = pathname
        .replace(/\/+$/, '')
        .replace(/\/socket\/websocket$/i, '')
        .replace(/\/socket$/i, '')
        .replace(/\/websocket$/i, '');

    if (pathname === '' || pathname === '/') {
        return origin + '/api/broadcast';
    }
    return origin + pathname + '/api/broadcast';
};
exports.httpEndpointURL = httpEndpointURL;
