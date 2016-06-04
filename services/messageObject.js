var ByteBuffer = require("bytebuffer");
var CRC32 = require('crc-32');
var services = require('../services/index.js');
var _ = require("underscore");
var logger = require('winston');


/**
 * Message Format
 *
 * 1) Header: 12 bytes
 * 4 bytes: int timestamp
 * 4 bytes: int payloadLength
 * 4 bytes: int payloadCrc
 *
 * 2) Payload:
 *
 * TOPIC: TOGATEWAY_UPGRADE, TOGATEWAY_UPGRADE/[gatewayId] (cloud to gateway)
 *  n bytes data (executables)
 *
 * TOPIC: TOGATEWAY_LATEST_VERSION, TOGATEWAY_LATEST_VERSION/[gatewayId] (cloud to gateway)
 *  {
 *   version: version,
 *  }
 *
 * TOPIC: TOGATEWAY_DOWNLOAD_UPGRADE, TOGATEWAY_DOWNLOAD_UPGRADE/[gatewayId] (cloud to gateway)
 *  n bytes data (executables)
 *
 * TOPIC: TOCLOUD_STATUS/[gatewayId] (gateway to cloud)
 *  {
 *   companyId: gateway's company id
 *   version: version,
 *   timestamp: timestamp // in milli-second
 *  }
 *
 * TOPIC: TOCLOUD_REQUEST_LATEST_VERSION/[gatewayId] (gateway to cloud)
 *   empty
 *
 * TOPIC: TOCLOUD_REQUEST_UPGRADE/[gatewayId] (gateway to cloud)
 *  {
 *   version: version,
 *  }
 *
 */



var MessageObject = function (timestamp, data) {
    this._timestamp = timestamp; // date
    this._data = data; // string
    this._messageLength = this._data?Buffer.byteLength(this._data, 'utf-8'):0;
    this._crc = this._data?CRC32.bstr(this._data):0;
};


MessageObject.prototype.toBuffer = function () {
    var timestampInSec = new ByteBuffer(4).writeInt32(Math.floor(this._timestamp.getTime()/1000)).flip();
    var crc = new ByteBuffer(4).writeInt32(this._crc ).flip(); // crc32 takes 4 bytes
    var messageLength = new ByteBuffer(4).writeInt32(this._messageLength).flip();
    var data = this._data;
    var bb = ByteBuffer.concat([timestampInSec,messageLength, crc,data]).toBuffer();

    return bb;
};

MessageObject.prototype.fromBuffer = function (buffer) {
    var msgBb = ByteBuffer.wrap(buffer, 'binary');
    this._timestamp = new Date(parseInt(msgBb.readInt32())*1000);
    this._messageLength = msgBb.readInt32();
    this._crc = msgBb.readInt32();
    this._data = msgBb.readString(this._messageLength);
    var calculatedCrc = CRC32.bstr(this._data);

    if (this._crc !== calculatedCrc) {
        //throw new Error("CRC not match: received: " + this._crc + "; calculated: " + calculatedCrc);
    }
};


MessageObject.prototype.getPayload = function(){
    return this._data;
};

MessageObject.prototype.getPayloadJson = function(){
    try{
        var json = JSON.parse(this._data.toString());
        return json;
    } catch (e){
        logger.debug(e);
        return null;
    }
};

MessageObject.prototype.getTimestamp = function(){
    return this._timestamp;
}


module.exports = MessageObject;




