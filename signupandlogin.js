"use strict";
const nodemailer = require("nodemailer");
const db = require('./database');

class SignupLogin {
    static async sendMail(toaddress, ecode) {
        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        let account = { user: "jass.ada@qq.com", pass: "ojygs_132_qmsrkekrhgjc" };
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: "smtp.qq.com",
            port: 25,
            secure: false, // true for 465, false for other ports
            auth: {
                user: account.user, // generated ethereal user
                pass: account.pass // generated ethereal password
            }
        });

        // setup email data with unicode symbols
        let mailOptions = {
            from: '"UNION Administrator" <jass.ada@qq.com>', // sender address
            to: toaddress, // list of receivers
            subject: "Email Validation Code", // Subject line
            //     text: ecode, // plain text body
            html: "<b>您正在注册UNION钱包，注册码是： " + ecode + "     <br>注册码两天内有效。</b>"// html body
        };
        // send mail with defined transport object
        let info = await transporter.sendMail(mailOptions)
    }
    /**
     * check if the emial code is avalable
     *
     * @param  {Object} ctx
     * @api public
     */
    async checkEmail(ctx) {
        console.log(ctx.request.body);
        let time = new Date();
        time = time.getTime();
        let eaddress = ctx.request.body.email;
        console.log("hhhhhhhhhhhhhhhhhhhhhhhh");
        console.log(SignupLogin.emailcode);
        if (SignupLogin.emailcode[eaddress]) {
            return ctx.body = '0';
        }
        let ecode = Math.floor(Math.random() * 1000000);
        ecode = '000000' + ecode;
        ecode = ecode.substr(-6);
        SignupLogin.emailcode[eaddress] = [ecode, time];
        //here try to send the email
        await SigupLogin.sendMail(eaddress, ecode);
        ctx.body = '1';
    }
    /**
     * clear emailcode
     * @api private
     */
    kickout() {
        let time = new Date().getTime();
        for (var item in SignupLogin.emailcode) {
            if (time - SignupLogin.emailcode[item][1] > 172800000) {
                delete SignupLogin.emailcode[item];
            }
        }
        console.log('kickout ok');
        console.log(SignupLogin.emailcode);
    }

    /**
     * Response client sign up
     *
     * @param  {Object} ctx
     * @api public
     */
    async signup(ctx) {
        let {nickname, email, sex, password} = ctx.request.body;
        let condition = 1;
        
        if(!(nickname && email && sex!==undefined &&password)){
            return ctx.body = {info: 'parameter wrong'}
        }
        let pt = password.match(ctx.app.passwordExp);
        let et = email.match(ctx.app.emailExp);
        let nt = nickname.match(ctx.app.nicknameExp);
        condition &= pt[0] == pt['input']
        condition &= et[0] == et['input']
        condition &= nt[0] == nt['input']
        if(sex != '0' || sex !='1'){
            condition = 0;
        }
        if(!condition){
            return ctx.body = {info: 'parameter wrong'}
        }
        let  res = await db.query(`INSERT INTO account_${ctx.app.accountTableNum} SET ?`, {nickname:nickname,email:email, ses: sex, password: password});
        console.log(res);
        ctx.body = {insertId: res[0].insertId}
    }

    /**
     * Response client login
     *
     * @param  {Object} ctx
     * @api public
     */
    async login(ctx){
        const {id ,password} = ctx.request.body;
        let pt, it;
        if(!id || !password){
            return ctx.body = {info: 'no login account!'}
        }  
        pt = password.match(ctx.app.passwordExp);        
        it = id.match(ctx.match(ctx.app.idExp));
        //check for the id and password format
        if(!((it && it[0]==it['input']) && (pt && pt[0] == pt['input']))){
            return ctx.body = {info: 'incorrect login form!'}
        }
        //calculate table_n by id.
        let tb_n = ctx.app.id2Table(id)        
        let [rows, _] = await db.query(`SELECT * FROM account_${tb_n} WHERE id = ?`,[id]);
        let result = rows[0];
        if(result['password'] != password){
            return ctx.body = {info: 'incorrect password!'}
        }
        /**
         * coming here indicates the login id and password is correct.
         */
        // set the cookie
        ctx.session.login = id;

        // binding ip to session to reduce insecure.
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
        ctx.session.ip = iphash;  //set the ip hash for later validation.

        //query for other infomation to response client if necessary.
        if(!result['haswallet']){
            return ctx.body = result;
        }
        [rows, _] = await db.query(`SELECT * FROM wallet_${tb_n} WHERE id = ?`,[id]);
        result = {...result, ...rows[0]}
        [rows, _] = await db.query(`SELECT * FROM transfer_${tb_n} WHERE id = ?`,[id]);
        result = {...result, ...rows[0]}
        return ctx.body = result;
    }
}
SignupLogin.emailcode = {}

module.exports = { SignupLogin };