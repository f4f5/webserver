"use strict";
const {createHash} = require('crypto');


/**
 * @param {string} algorithm
 * @param {any} content
 *  @return {string}
 */
const encrypt =(algorithm, content)=>{
    let hash = createHash(algorithm)
    hash.update(content)
    return hash.digest('base64')
}

module.exports = {

    /**
     * Extract client identify string from ip and user-agent
     *
     * @param {Object} ctx
     * @return {String}
     * @api public
     */
    clientIdentify(ctx){
        //deal with ip
        let ip = ctx.request.ip
        let ips = ctx.request.ips
        if(!ips.includes(ip)){
            ips.unshift(ip);
        }
        ip = ''
        while(1){
            ip+=ips.shift();
            if(ips.length==0) break;
        }
        ips=ip.split('.')
        let iphash = 0
        for(let i in ips){
            iphash+=parseInt(ips[i])||0;
        }

        //extract numbers in userAgent
        let uanum_str = ctx.request.header['user-Agent'].replace(/[^0-9]/ig,'');
        let uanum = parseInt(uanum_str)||0
        let mid = parseInt(uanum_str.length/2);
        while(1){
            if(uanum_str.length<=8) break;
            uanum = parseInt(uanum_str.substr(0,mid)) + parseInt(uanum_str.substr(-mid))
            uanum_str = ''+uanum
        }
        return '' + (uanum + iphash)%4294967291
    },

    

    /**
     * @param {any} content
     *  @return {string}
     */
    sha1(content){encrypt('sha1', content)}


}
