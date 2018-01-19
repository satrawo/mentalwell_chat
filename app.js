var restify = require('restify');
var builder = require('botbuilder');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function(){
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users 
server.post('api/messages', connector.listen());

// save data in bot for temporary
var inMemoryStorage = new builder.MemoryBotStorage();

var bot = new builder.UniversalBot(connector, [
    function(session) {
        session.send("สวัสดีค่ะ น้องสดใสจาก Mental Well Being ยินดีที่ได้รู้จักคะ");
        session.beginDialog("ensureProfile", session.userData.profile);
    },
    function (session, results) {
        session.userData.profile = results.response; // Save user profile.
        session.send("โอเค...")
        session.send(`ขอบคุณ คุณ ${session.userData.profile.name} ที่ให้ความร่วมมือนะคะกับน้องสดใสนะคะ`);
        // session.send(`โปรไฟล์ของคุณคือ 
        //             \nชื่อ: ${session.userData.profile.name} 
        //             \nเพศ: ${session.userData.profile.gender}
        //             \nอายุ: ${session.userData.profile.age}
        //             \nระดับการศึกษา: ${session.userData.profile.education}
        //             \nอาชีพ: ${session.userData.profile.occupation}
        //             \nสถานภาพ: ${session.userData.profile.marriageStatus}
        //             `);
        // builder.Prompts.confirm(session, "น้องสดใสมีคำถาม 5 คำถามอยากถามเพื่อวัดระดับ คุณต้องการทำไหม?", {listStyle:  3});
    }

    // function(session){
    //     builder.Prompts.confirm(session, "น้องสดใสมีคำถาม 5 คำถามอยากถามเพื่อวัดระดับ คุณต้องการทำไหม?", {listStyle:  3});
    // },
    // function(session, results) {
    //     if(session.response){
    //         session.beginDialog("st5");
    //     }
    //     else{
    //         session.endDialog(`ว๊าา..แย่จัง น้องสดใสเสียใจ TT`);
    //     }
    // }

]).set('storage', inMemoryStorage); // Register in-memory storage

// --------------------- Dialog ------------------------------------

// Add first run dialog
bot.dialog('firstRun', function (session) {    
    session.userData.firstRun = true;
    session.send("สวัสดี...").endDialog();
}).triggerAction({
    onFindAction: function (context, callback) {
        // Only trigger if we've never seen user before
        if (!context.userData.firstRun) {
            // Return a score of 1.1 to ensure the first run dialog wins
            callback(null, 1.1);
        } else {
            callback(null, 0.0);
        }
    }
});
// bot.dialog('help', function (session, args, next) {
//     session.endDialog("พวกเราคือ Mental Well Being เรามาเพื่อช่วยให้คุณผ่อนคลาย พบพวกเราได้ที่: http://www.mentalwellbeing.in.th/ ");
// })
// .triggerAction({
//     matches: /^help$/i,
//     // onSelectAction: (session, args, next) => {
//     //     // Add the help dialog to the dialog stack 
//     //     // (override the default behavior of replacing the stack)
//     //     if(session.message.text){
//     //         session.beginDialog(args.action, args);
//     //     }
//     // }
// });

//askForHelp 
bot.dialog("ensureProfile", [
    function (session, args, next) {
        session.dialogData.profile = args || {}; // Set the profile or create the object.
        if (!session.dialogData.profile.name) {
            session.send("เรามาทำความรู้จักกันเถอะ");
            builder.Prompts.text(session, "คุณชื่ออะไรคะ?");
        } else {
            next(); // Skip if we already have this info.
        }
    },
    function (session, results, next) {
        if (results.response) {
            session.dialogData.profile.name = results.response;
        }
        if (!session.dialogData.profile.gender) {
            builder.Prompts.choice(session, "เพศของคุณ", ["ชาย","หญิง","ไม่ระบุ"], { listStyle:  2 });  
        } else {
            next(); // Skip if we already have this info.
        }
    },
    function (session, results, next) {
        if (results.response) {
            // Save user's name if we asked for it.
            session.dialogData.profile.gender = results.response.entity;
        }
        if (!session.dialogData.profile.age) {
            builder.Prompts.number(session, "คุณอายุเท่าไหร่?");  
        } else {
            next(); // Skip if we already have this info.
        }
    },
    function (session, results, next) {
        if (results.response) {
            // Save user's name if we asked for it.
            session.dialogData.profile.age = results.response;
        }
        if (!session.dialogData.profile.education) {
            builder.Prompts.choice(session, "ระดับการศึกษา", ["ประถมศึกษา","มัธยมศึกษา","ปวช / ปวส / อนุปริญญา","ปริญญาตรี","ปริญญาโท /เอก"], { listStyle:  2 }); 
        } else {
            next(); // Skip if we already have this info.
        }
    },
    function (session, results, next) {
        if (results.response) {
            // Save user's name if we asked for it.
            session.dialogData.profile.education = results.response.entity;
        }
        if (!session.dialogData.profile.occupation) {
            builder.Prompts.choice(session, "อาชีพ", ["นักเรียน / นิสิต / นักศึกษา","ค้าขาย / รับจ้าง / ธุรกิจส่วนตัว","พนักงานบริษัท / ห้างร้าน","รับราชการ / รัฐวิสาหกิจ","ว่างงาน"], { listStyle:  2 }); 
        } else {
            next(); // Skip if we already have this info.
        }
    },
    function (session, results, next) {
        if (results.response) {
            // Save user's name if we asked for it.
            session.dialogData.profile.occupation = results.response.entity;
        }
        if (!session.dialogData.profile.marriageStatus) {
            builder.Prompts.choice(session, "สถานภาพการสมรส", ["โสด","คู่","หย่าร้าง"], { listStyle:  2 }); 
        }
    },
    function (session, results) {
        if (results.response) {
            // Save company name if we asked for it.
            session.dialogData.profile.marriageStatus = results.response.entity;
            session.beginDialog("st5");
        }
        session.endDialogWithResult({ response: session.dialogData.profile });
    }
]);

//st5 dialog
bot.dialog("st5", [
    function (session) {
        session.send("น้องสดใสมีคำถาม 5 คำถามอยากถามเพื่อวัดระดับ")
        session.send(`คำถามต่อไปนี้ให้ตอบอยู่ในเป็นตัวเลข (0-3) โดยที่
                     \n0 หมายถึง แทบไม่มี
                     \n1 หมายถึง เป็นบางครั้ง
                     \n2 หมายถึง บ่อยครั้ง
                     \n3 หมายถึง เป็นประจำ
                    `);
    builder.Prompts.number(session, "ช่วงนี้มีปัญหาในการนอนหลับไหม?");
    },
    function (session,results) {
        session.dialogData.firstFactor = results.response;
        builder.Prompts.number(session, "มีความรู้สึกว่าไม่สามารถจดจ่อกับสิ่งใดสิ่งหนึ่งไหม?");
    },
    function (session,results) {
        session.dialogData.secondFactor = results.response;
        builder.Prompts.number(session, "มีความกระวนกระวายใจหรือหงุดหงิดอะไรไหม?");
    },
    function (session,results) {
        session.dialogData.thirdFactor = results.response;
        builder.Prompts.number(session, "มีความรู้สึกเบื่อหรือเซ็งไหม?");
    },
    function (session,results) {
        session.dialogData.fourthFactor = results.response;
        builder.Prompts.number(session, "มีความรู้สึกไม่อยากออกไปข้างนอก พบปะผู้คนไหม?");
    },
    function (session,results) {
        session.dialogData.fifthFactor = results.response;
        var totalscore = session.dialogData.firstFactor + session.dialogData.secondFactor + session.dialogData.thirdFactor + session.dialogData.fourthFactor + session.dialogData.fifthFactor ;
        session.send("%s", totalscore);
        if (totalscore>0 && totalscore<=4){
            session.endDialog("ตอนนี้คุณมีความเครียดอยู่ระดับ 'เครียดน้อย' นะคะ");
        }
        if (totalscore>=5 && totalscore<=7){
            session.endDialog("ตอนนี้คุณมีความเครียดอยู่ระดับ 'เครียดปานกลาง' นะคะ");
        }        
        if (totalscore>=8 && totalscore<=9){
            session.endDialog("ตอนนี้คุณมีความเครียดอยู่ระดับ 'เครียดมาก' นะคะ");
        }
        if (totalscore>=10 && totalscore<=15){
            session.endDialog("ตอนนี้คุณมีความเครียดอยู่ระดับ 'เครียดมากที่สุด' นะคะ");
        }
    }
]);